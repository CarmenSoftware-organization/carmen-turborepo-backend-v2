import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateCronJobData {
  name: string
  description?: string
  cronExpression: string
  jobType: 'notification_check' | 'daily_summary' | 'custom'
  jobData?: string
  isActive?: boolean
  createdBy?: string
}

export interface UpdateCronJobData {
  name?: string
  description?: string
  cronExpression?: string
  jobType?: 'notification_check' | 'daily_summary' | 'custom'
  jobData?: string
  isActive?: boolean
}

export const cronJobService = {
  /**
   * Get all cron jobs with creator info, ordered by creation date descending
   * ค้นหารายการ cron job ทั้งหมดพร้อมข้อมูลผู้สร้าง เรียงตามวันที่สร้างจากใหม่ไปเก่า
   * @returns Array of cron jobs / อาร์เรย์ของ cron job
   */
  async getAll() {
    return await prisma.cronJob.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  },

  /**
   * Get a cron job by ID with creator info
   * ค้นหารายการเดียวตาม ID ของ cron job พร้อมข้อมูลผู้สร้าง
   * @param id - Cron job ID / ID ของ cron job
   * @returns Cron job or null if not found / cron job หรือ null ถ้าไม่พบ
   */
  async getById(id: string) {
    return await prisma.cronJob.findFirst({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  },

  /**
   * Create a new cron job in the database
   * สร้าง cron job ใหม่ในฐานข้อมูล
   * @param data - Cron job creation data / ข้อมูลสำหรับสร้าง cron job
   * @returns Created cron job / cron job ที่สร้างแล้ว
   */
  async create(data: CreateCronJobData) {
    return await prisma.cronJob.create({
      data: {
        name: data.name,
        description: data.description,
        cronExpression: data.cronExpression,
        jobType: data.jobType,
        jobData: data.jobData,
        isActive: data.isActive ?? true,
        createdBy: data.createdBy
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  },

  /**
   * Update a cron job in the database
   * อัปเดต cron job ในฐานข้อมูล
   * @param id - Cron job ID / ID ของ cron job
   * @param data - Partial update data / ข้อมูลที่ต้องการอัปเดต
   * @returns Updated cron job / cron job ที่อัปเดตแล้ว
   */
  async update(id: string, data: UpdateCronJobData) {
    return await prisma.cronJob.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  },

  /**
   * Delete a cron job from the database
   * ลบ cron job จากฐานข้อมูล
   * @param id - Cron job ID / ID ของ cron job
   * @returns Deleted cron job / cron job ที่ลบแล้ว
   */
  async delete(id: string) {
    return await prisma.cronJob.delete({
      where: { id }
    })
  },

  /**
   * Activate a cron job (set isActive to true)
   * เปิดใช้งาน cron job (ตั้ง isActive เป็น true)
   * @param id - Cron job ID / ID ของ cron job
   * @returns Activated cron job / cron job ที่เปิดใช้งานแล้ว
   */
  async activate(id: string) {
    return await prisma.cronJob.update({
      where: { id },
      data: { isActive: true }
    })
  },

  /**
   * Deactivate a cron job (set isActive to false)
   * ปิดใช้งาน cron job (ตั้ง isActive เป็น false)
   * @param id - Cron job ID / ID ของ cron job
   * @returns Deactivated cron job / cron job ที่ปิดใช้งานแล้ว
   */
  async deactivate(id: string) {
    return await prisma.cronJob.update({
      where: { id },
      data: { isActive: false }
    })
  },

  /**
   * Update the last run timestamp and next run time for a cron job
   * อัปเดตเวลาทำงานล่าสุดและเวลาทำงานถัดไปของ cron job
   * @param id - Cron job ID / ID ของ cron job
   * @param lastRun - Last run timestamp / เวลาทำงานล่าสุด
   * @param nextRun - Optional next run timestamp / เวลาทำงานถัดไป (ถ้ามี)
   * @returns Updated cron job / cron job ที่อัปเดตแล้ว
   */
  async updateLastRun(id: string, lastRun: Date, nextRun?: Date) {
    return await prisma.cronJob.update({
      where: { id },
      data: {
        lastRun,
        nextRun
      }
    })
  },

  /**
   * Get all active cron jobs ordered by creation date ascending
   * ค้นหารายการ cron job ที่เปิดใช้งานทั้งหมด เรียงตามวันที่สร้างจากเก่าไปใหม่
   * @returns Array of active cron jobs / อาร์เรย์ของ cron job ที่เปิดใช้งาน
   */
  async getActiveCronJobs() {
    return await prisma.cronJob.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    })
  }
}