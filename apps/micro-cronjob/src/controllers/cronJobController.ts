import { Context } from 'elysia'
import { cronJobService, CreateCronJobData, UpdateCronJobData } from '../services/cronJobService'
import { cronJobManager } from '../jobs/cronJobManager'
import { sendNotification } from '@/libs/sendNoti'

/**
 * Validate a cron expression format (5 parts: minute hour day month weekday)
 * ตรวจสอบรูปแบบ cron expression (5 ส่วน: นาที ชั่วโมง วัน เดือน วันในสัปดาห์)
 * @param expression - Cron expression string / สตริง cron expression
 * @returns Error message if invalid, null if valid / ข้อความข้อผิดพลาดถ้าไม่ถูกต้อง, null ถ้าถูกต้อง
 */
function validateCronExpression(expression: string): string | null {
  const cronRegex = /^(\*|([0-5]?\d)|\*\/([0-5]?\d)|([0-5]?\d)-([0-5]?\d)|([0-5]?\d),([0-5]?\d))\s+(\*|([01]?\d|2[0-3])|\*\/([01]?\d|2[0-3])|([01]?\d|2[0-3])-([01]?\d|2[0-3])|([01]?\d|2[0-3]),([01]?\d|2[0-3]))\s+(\*|([12]?\d|3[01])|\*\/([12]?\d|3[01])|([12]?\d|3[01])-([12]?\d|3[01])|([12]?\d|3[01]),([12]?\d|3[01]))\s+(\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])|([1-9]|1[0-2])-([1-9]|1[0-2])|([1-9]|1[0-2]),([1-9]|1[0-2]))\s+(\*|[0-6]|\*\/[0-6]|[0-6]-[0-6]|[0-6],[0-6])$/

  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) {
    return 'Cron expression must have exactly 5 parts (minute hour day month weekday)'
  }

  if (!cronRegex.test(expression)) {
    return 'Invalid cron expression format'
  }

  return null
}

/**
 * Validate job data JSON for notification_check type jobs
 * ตรวจสอบ JSON ของข้อมูลงานสำหรับงานประเภท notification_check
 * @param jobData - JSON string of job data / สตริง JSON ของข้อมูลงาน
 * @returns Error message if invalid, null if valid / ข้อความข้อผิดพลาดถ้าไม่ถูกต้อง, null ถ้าถูกต้อง
 */
function validateNotificationJobData(jobData: string): string | null {
  try {
    const data = JSON.parse(jobData)

    // For notification_check jobs, require title and message
    if (!data.title || typeof data.title !== 'string') {
      return 'jobData must contain "title" field (string) for notification_check jobs'
    }

    if (!data.message || typeof data.message !== 'string') {
      return 'jobData must contain "message" field (string) for notification_check jobs'
    }

    // Validate type if provided
    if (data.type && !['info', 'warning', 'success', 'error'].includes(data.type)) {
      return 'jobData "type" must be one of: info, warning, success, error'
    }

    return null
  } catch (error) {
    return 'jobData must be valid JSON format'
  }
}

export const cronJobController = {
  /**
   * Get all cron jobs
   * ค้นหารายการ cron job ทั้งหมด
   * @param ctx - Elysia context / context ของ Elysia
   * @returns List of cron jobs / รายการ cron job
   */
  async getAll(ctx: Context) {
    try {
      const cronJobs = await cronJobService.getAll()
      return { cronJobs }
    } catch (error) {
      ctx.set.status = 500
      return { error: 'Failed to get cron jobs' }
    }
  },

  /**
   * Get a cron job by ID
   * ค้นหารายการเดียวตาม ID ของ cron job
   * @param ctx - Elysia context with id param / context ของ Elysia พร้อมพารามิเตอร์ id
   * @returns Cron job data / ข้อมูล cron job
   */
  async getById(ctx: Context) {
    try {
      const { id } = ctx.params as { id: string }

      const cronJob = await cronJobService.getById(id)
      if (!cronJob) {
        ctx.set.status = 404
        return { error: 'Cron job not found' }
      }

      return { cronJob }
    } catch (error) {
      ctx.set.status = 500
      return { error: 'Failed to get cron job' }
    }
  },

  /**
   * Create a new cron job with validation
   * สร้าง cron job ใหม่พร้อมการตรวจสอบข้อมูล
   * @param ctx - Elysia context with body data / context ของ Elysia พร้อมข้อมูล body
   * @returns Created cron job / cron job ที่สร้างแล้ว
   */
  async create(ctx: Context) {
    try {
      const data = ctx.body as CreateCronJobData

      // Validate required fields
      if (!data.name || !data.cronExpression || !data.jobType) {
        ctx.set.status = 400
        return { error: 'Missing required fields: name, cronExpression, jobType' }
      }

      // Validate cron expression format
      const cronError = validateCronExpression(data.cronExpression)
      if (cronError) {
        ctx.set.status = 400
        return { error: `Invalid cron expression: ${cronError}` }
      }

      // Validate jobData for notification_check jobs
      if (data.jobType === 'notification_check' && data.jobData) {
        const jobDataError = validateNotificationJobData(data.jobData)
        if (jobDataError) {
          ctx.set.status = 400
          return { error: `Invalid jobData: ${jobDataError}` }
        }
      }

      const cronJob = await cronJobService.create(data)

      // Add to cron job manager if active
      if (cronJob.isActive) {
        await cronJobManager.addCronJob(cronJob)
      }

      // Send WebSocket status to admin users
      
      // call api to send notification to admin users about new cron job creation

      sendNotification({
        title: 'New Cron Job Created',
        message: `Cron job "${cronJob.name}" has been created and is currently ${cronJob.isActive ? 'active' : 'inactive'}.`,
        type: 'info',
        category: 'system',
        userIds: [] // Empty array since we are using recipientRole
      }).catch(() => {})

      // Alternatively, if you have a WebSocket function to notify admins:
      //await sendCronJobStatusToAdmins(cronJob.id, 'started', `Cron job "${cronJob.name}" created and ${cronJob.isActive ? 'started' : 'created as inactive'}`)
     
      ctx.set.status = 201
      return { cronJob }
    } catch (error) {
      ctx.set.status = 500
      return { error: 'Failed to create cron job' }
    }
  },

  /**
   * Update an existing cron job
   * อัปเดต cron job ที่มีอยู่
   * @param ctx - Elysia context with id param and body data / context ของ Elysia พร้อมพารามิเตอร์ id และข้อมูล body
   * @returns Updated cron job / cron job ที่อัปเดตแล้ว
   */
  async update(ctx: Context) {
    try {
      const { id } = ctx.params as { id: string }
      const data = ctx.body as UpdateCronJobData

      const existingCronJob = await cronJobService.getById(id)
      if (!existingCronJob) {
        ctx.set.status = 404
        return { error: 'Cron job not found' }
      }

      // Validate cron expression if provided
      if (data.cronExpression) {
        const cronError = validateCronExpression(data.cronExpression)
        if (cronError) {
          ctx.set.status = 400
          return { error: `Invalid cron expression: ${cronError}` }
        }
      }

      // Validate jobData for notification_check jobs if provided
      if (data.jobData && (data.jobType === 'notification_check' || existingCronJob.jobType === 'notification_check')) {
        const jobDataError = validateNotificationJobData(data.jobData)
        if (jobDataError) {
          ctx.set.status = 400
          return { error: `Invalid jobData: ${jobDataError}` }
        }
      }

      const cronJob = await cronJobService.update(id, data)

      // Update in cron job manager
      await cronJobManager.updateCronJob(id, cronJob)

      return { cronJob }
    } catch (error) {
      ctx.set.status = 500
      return { error: 'Failed to update cron job' }
    }
  },

  /**
   * Delete a cron job by ID
   * ลบ cron job ตาม ID
   * @param ctx - Elysia context with id param / context ของ Elysia พร้อมพารามิเตอร์ id
   * @returns Deletion confirmation / การยืนยันการลบ
   */
  async delete(ctx: Context) {
    try {
      const { id } = ctx.params as { id: string }

      const existingCronJob = await cronJobService.getById(id)
      if (!existingCronJob) {
        ctx.set.status = 404
        return { error: 'Cron job not found' }
      }

      // Remove from cron job manager first
      cronJobManager.removeCronJob(id)

      // Then delete from database
      await cronJobService.delete(id)

      return { message: 'Cron job deleted successfully' }
    } catch (error) {
      ctx.set.status = 500
      return { error: 'Failed to delete cron job' }
    }
  },

  /**
   * Start (activate) a cron job by ID
   * เริ่มการทำงาน (เปิดใช้งาน) cron job ตาม ID
   * @param ctx - Elysia context with id param / context ของ Elysia พร้อมพารามิเตอร์ id
   * @returns Started cron job / cron job ที่เริ่มทำงาน
   */
  async start(ctx: Context) {
    try {
      const { id } = ctx.params as { id: string }

      const cronJob = await cronJobService.activate(id)
      if (!cronJob) {
        ctx.set.status = 404
        return { error: 'Cron job not found' }
      }

      // Add to cron job manager
      await cronJobManager.addCronJob(cronJob)

      // Send WebSocket status to admin users
      sendNotification({
        title: 'Cron Job Started',
        message: `Cron job "${cronJob.name}" has been started.`,
        type: 'info',
        category: 'system',
        userIds: [] // Empty array since we are using recipientRole
      }).catch(() => {})

      return { cronJob, message: 'Cron job started successfully' }
    } catch (error) {
      ctx.set.status = 500
      return { error: 'Failed to start cron job' }
    }
  },

  /**
   * Stop (deactivate) a cron job by ID
   * หยุดการทำงาน (ปิดใช้งาน) cron job ตาม ID
   * @param ctx - Elysia context with id param / context ของ Elysia พร้อมพารามิเตอร์ id
   * @returns Stopped cron job / cron job ที่หยุดทำงาน
   */
  async stop(ctx: Context) {
    try {
      const { id } = ctx.params as { id: string }

      const cronJob = await cronJobService.deactivate(id)
      if (!cronJob) {
        ctx.set.status = 404
        return { error: 'Cron job not found' }
      }

      // Remove from cron job manager
      cronJobManager.removeCronJob(id)

      sendNotification({
        title: 'Cron Job Stopped',
        message: `Cron job "${cronJob.name}" has been stopped.`,
        type: 'warning',
        category: 'system',
        userIds: [] // Empty array since we are using recipientRole
      }).catch(() => {})

      return { cronJob, message: 'Cron job stopped successfully' }
    } catch (error) {
      ctx.set.status = 500
      return { error: 'Failed to stop cron job' }
    }
  },

  /**
   * Execute a cron job immediately (manual trigger)
   * ทำงาน cron job ทันที (เรียกใช้ด้วยตนเอง)
   * @param ctx - Elysia context with id param / context ของ Elysia พร้อมพารามิเตอร์ id
   * @returns Execution result / ผลการทำงาน
   */
  async execute(ctx: Context) {
    try {
      const { id } = ctx.params as { id: string }

      const cronJob = await cronJobService.getById(id)
      if (!cronJob) {
        ctx.set.status = 404
        return { error: 'Cron job not found' }
      }

      // Execute the job immediately
      await cronJobManager.executeJobDirect(cronJob.jobType, cronJob.jobData || undefined)

      return { message: `Cron job "${cronJob.name}" executed successfully` }
    } catch (error) {
      ctx.set.status = 500
      return { error: 'Failed to execute cron job' }
    }
  },

  /**
   * Get all active cron jobs currently running in memory
   * ค้นหารายการ cron job ทั้งหมดที่กำลังทำงานอยู่ในหน่วยความจำ
   * @param ctx - Elysia context / context ของ Elysia
   * @returns Active jobs in memory / งานที่กำลังทำงานในหน่วยความจำ
   */
  async getActiveInMemory(ctx: Context) {
    try {
      const activeJobs = cronJobManager.getActiveJobs()
      return { activeJobsInMemory: activeJobs }
    } catch (error) {
      ctx.set.status = 500
      return { error: 'Failed to get active jobs in memory' }
    }
  }
}