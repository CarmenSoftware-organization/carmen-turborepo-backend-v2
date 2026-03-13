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

  /**
   * Load all active cron jobs from database and schedule them
   * โหลด cron job ที่เปิดใช้งานทั้งหมดจากฐานข้อมูลและตั้งเวลาทำงาน
   */
  async loadCronJobs() {
    try {
      const activeCronJobs = await cronJobService.getActiveCronJobs()

      for (const cronJob of activeCronJobs) {
        await this.addCronJob(cronJob)
      }
    } catch (error) {
    }
  }

  /**
   * Add and schedule a cron job in the manager
   * เพิ่มและตั้งเวลา cron job ใน manager
   * @param cronJob - Cron job data from database / ข้อมูล cron job จากฐานข้อมูล
   */
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

  /**
   * Check if a cron expression represents a one-time job
   * ตรวจสอบว่า cron expression เป็นงานครั้งเดียวหรือไม่
   * @param cronExpression - Cron expression / cron expression
   * @returns True if one-time job / true ถ้าเป็นงานครั้งเดียว
   */
  private isOneTimeJob(cronExpression: string): boolean {
    // Check if cron expression has specific day/month (not wildcards)
    const parts = cronExpression.split(' ')
    if (parts.length === 5) {
      const [min, hour, day, month, dayOfWeek] = parts
      return (day !== '*' && month !== '*') || (day !== '*' && dayOfWeek !== '*')
    }
    return false
  }

  /**
   * Check if a one-time cron job has already expired
   * ตรวจสอบว่างานครั้งเดียวหมดอายุแล้วหรือไม่
   * @param cronExpression - Cron expression / cron expression
   * @returns True if expired / true ถ้าหมดอายุ
   */
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

  /**
   * Remove and stop a cron job from the manager
   * ลบและหยุด cron job จาก manager
   * @param id - Cron job ID / ID ของ cron job
   */
  removeCronJob(id: string) {
    const jobInstance = this.jobs.get(id)
    if (jobInstance) {
      jobInstance.task.stop()
      jobInstance.task.destroy()
      this.jobs.delete(id)
    }
  }

  /**
   * Update a cron job in the manager (remove old, add updated if active)
   * อัปเดต cron job ใน manager (ลบเก่า เพิ่มใหม่ถ้ายังเปิดใช้งาน)
   * @param id - Cron job ID / ID ของ cron job
   * @param updatedCronJob - Updated cron job data / ข้อมูล cron job ที่อัปเดตแล้ว
   */
  async updateCronJob(id: string, updatedCronJob: any) {
    // Remove old job
    this.removeCronJob(id)

    // Add updated job if it's active
    if (updatedCronJob.isActive) {
      await this.addCronJob(updatedCronJob)
    }
  }

  /**
   * Execute a job by type with optional data
   * ทำงานตามประเภทพร้อมข้อมูลเพิ่มเติม (ถ้ามี)
   * @param jobType - Job type (notification_check, daily_summary, custom) / ประเภทงาน
   * @param jobData - Optional job data as JSON string / ข้อมูลงานเป็น JSON string (ถ้ามี)
   */
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

  /**
   * Execute a job directly (triggered from API, bypassing cron schedule)
   * ทำงานโดยตรง (เรียกจาก API โดยไม่ผ่าน cron schedule)
   * @param jobType - Job type / ประเภทงาน
   * @param jobData - Optional job data as JSON string / ข้อมูลงานเป็น JSON string (ถ้ามี)
   */
  async executeJobDirect(jobType: string, jobData?: string) {
    await this.executeJob(jobType, jobData)
  }

  /**
   * Execute notification check job (check for scheduled notifications to send)
   * ทำงานตรวจสอบการแจ้งเตือน (ตรวจสอบการแจ้งเตือนที่ตั้งเวลาไว้)
   * @param jobData - Optional job data / ข้อมูลงาน (ถ้ามี)
   */
  private async executeNotificationCheck(jobData?: string) {
    try {
      // mock logic: check for scheduled notifications to send
      // todo: integrate with notification service

    } catch (error) {
    }
  }

  /**
   * Execute daily summary job (send daily summary to users)
   * ทำงานสรุปประจำวัน (ส่งสรุปประจำวันให้ผู้ใช้)
   */
  private async executeDailySummary() {
    try {
      // mock logic: send daily summary to users
      // todo: integrate with notification service
    } catch (error) {
    }
  }

  /**
   * Execute a custom job with provided data
   * ทำงานที่กำหนดเองพร้อมข้อมูลที่ให้มา
   * @param jobData - Job data as JSON string / ข้อมูลงานเป็น JSON string
   */
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

  /**
   * Calculate the next run time (simple default: 1 minute from now)
   * คำนวณเวลาทำงานถัดไป (ค่าเริ่มต้น: 1 นาทีจากตอนนี้)
   * @returns Next run date / วันเวลาทำงานถัดไป
   */
  private getNextRunTime(): Date {
    // Simple next run calculation - in production, use a proper cron parser
    const now = new Date()
    return new Date(now.getTime() + 60 * 1000) // Default to 1 minute from now
  }

  /**
   * Get all active jobs currently scheduled in memory
   * ค้นหารายการงานทั้งหมดที่กำลังตั้งเวลาอยู่ในหน่วยความจำ
   * @returns Array of active job summaries / อาร์เรย์ของสรุปงานที่เปิดใช้งาน
   */
  getActiveJobs() {
    return Array.from(this.jobs.values()).map(job => ({
      id: job.id,
      name: job.name,
      jobType: job.jobType,
      isRunning: true
    }))
  }

  /**
   * Stop and remove all scheduled cron jobs
   * หยุดและลบ cron job ที่ตั้งเวลาทั้งหมด
   */
  stopAllJobs() {
    for (const [id, _] of this.jobs) {
      this.removeCronJob(id)
    }
  }
}

export const cronJobManager = new CronJobManager()