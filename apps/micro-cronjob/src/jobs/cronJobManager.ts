import * as cron from 'node-cron'
import { cronJobService } from '../services/cronJobService'

interface CronJobInstance {
  id: string
  name: string
  task: cron.ScheduledTask
  jobType: string
}

class CronJobManager {
  private readonly jobs: Map<string, CronJobInstance> = new Map()

  async loadCronJobs() {
    try {
      const activeCronJobs = await cronJobService.getActiveCronJobs()

      for (const cronJob of activeCronJobs) {
        await this.addCronJob(cronJob)
      }
    } catch (error) {
    }
  }

  async addCronJob(cronJob: any) {
    try {
      // Remove existing job if it exists
      if (this.jobs.has(cronJob.id)) {
        this.removeCronJob(cronJob.id)
      }

      // Check if this is a one-time job that has already passed
      if (this.isOneTimeJobExpired(cronJob.cronExpression)) {
        await this.executeJob(cronJob.jobType, cronJob.jobData)

        // Mark as inactive since it ran
        await cronJobService.update(cronJob.id, { isActive: false })
        return
      }

      const task = cron.schedule(cronJob.cronExpression, async () => {
        const startTime = new Date()

        try {
          await this.executeJob(cronJob.jobType, cronJob.jobData)

          // Calculate next run time
          const nextRun = this.getNextRunTime()

          // Update last run time
          await cronJobService.updateLastRun(cronJob.id, startTime, nextRun)

          // If this is a one-time job, deactivate it
          if (this.isOneTimeJob(cronJob.cronExpression)) {
            await cronJobService.update(cronJob.id, { isActive: false })
            this.removeCronJob(cronJob.id)
          }
        } catch (error) {
        }
      })

      // Start the task
      task.start()

      this.jobs.set(cronJob.id, {
        id: cronJob.id,
        name: cronJob.name,
        task,
        jobType: cronJob.jobType
      })

    } catch (error) {
    }
  }

  private isOneTimeJob(cronExpression: string): boolean {
    // Check if cron expression has specific day/month (not wildcards)
    const parts = cronExpression.split(' ')
    if (parts.length === 5) {
      const [min, hour, day, month, dayOfWeek] = parts
      return (day !== '*' && month !== '*') || (day !== '*' && dayOfWeek !== '*')
    }
    return false
  }

  private isOneTimeJobExpired(cronExpression: string): boolean {
    if (!this.isOneTimeJob(cronExpression)) return false

    try {
      const parts = cronExpression.split(' ')
      const [min, hour, day, month, dayOfWeek] = parts

      if (day !== '*' && month !== '*') {
        const now = new Date()
        // Use UTC for comparison since cron expressions are in UTC
        const targetDate = new Date(Date.UTC(now.getUTCFullYear(), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min)))

        return targetDate < now
      }
    } catch (error) {
    }

    return false
  }

  removeCronJob(id: string) {
    const jobInstance = this.jobs.get(id)
    if (jobInstance) {
      jobInstance.task.stop()
      jobInstance.task.destroy()
      this.jobs.delete(id)
    }
  }

  async updateCronJob(id: string, updatedCronJob: any) {
    // Remove old job
    this.removeCronJob(id)

    // Add updated job if it's active
    if (updatedCronJob.isActive) {
      await this.addCronJob(updatedCronJob)
    }
  }

  async executeJob(jobType: string, jobData?: string) {
    switch (jobType) {
      case 'notification_check':
        await this.executeNotificationCheck(jobData)
        break
      case 'daily_summary':
        await this.executeDailySummary()
        break
      case 'custom':
        await this.executeCustomJob(jobData)
        break
      default:
    }
  }

  // Public method for direct execution (from API)
  async executeJobDirect(jobType: string, jobData?: string) {
    await this.executeJob(jobType, jobData)
  }

  private async executeNotificationCheck(jobData?: string) {
    try {
      // mock logic: check for scheduled notifications to send
      // todo: integrate with notification service

    } catch (error) {
    }
  }

  private async executeDailySummary() {
    try {
      // mock logic: send daily summary to users
      // todo: integrate with notification service
    } catch (error) {
    }
  }

  private async executeCustomJob(jobData?: string) {
    try {
      if (!jobData) {
        return
      }

      const data = JSON.parse(jobData)

      // Add custom job logic here based on data
      // For example, send custom notifications, cleanup tasks, etc.

    } catch (error) {
    }
  }

  private getNextRunTime(): Date {
    // Simple next run calculation - in production, use a proper cron parser
    const now = new Date()
    return new Date(now.getTime() + 60 * 1000) // Default to 1 minute from now
  }

  getActiveJobs() {
    return Array.from(this.jobs.values()).map(job => ({
      id: job.id,
      name: job.name,
      jobType: job.jobType,
      isRunning: true
    }))
  }

  stopAllJobs() {
    for (const [id, _] of this.jobs) {
      this.removeCronJob(id)
    }
  }
}

export const cronJobManager = new CronJobManager()