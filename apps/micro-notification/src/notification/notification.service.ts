import { Injectable } from '@nestjs/common';
import { PrismaClient_SYSTEM_CUSTOM } from '@repo/prisma-shared-schema-platform';
import type { PrismaClient } from '@repo/prisma-shared-schema-platform';

export interface CreateSystemNotificationData {
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
  scheduled_at?: Date;
  userIds?: string[];
}

export interface CreateUserNotificationData {
  from_user_id: string;
  to_user_id: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
  scheduled_at?: Date;
}

export interface CreateBusinessUnitNotificationData {
  bu_code: string;
  from_user_id?: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
  scheduled_at?: Date;
}

@Injectable()
export class NotificationService {
  private prismaPromise: Promise<PrismaClient>;

  constructor() {
    this.prismaPromise = PrismaClient_SYSTEM_CUSTOM(process.env.SYSTEM_DATABASE_URL!);
  }

  /**
   * Get Prisma client instance
   * ดึงอินสแตนซ์ Prisma client
   * @returns Prisma client / Prisma client
   */
  private async getPrisma() {
    return this.prismaPromise;
  }

  /**
   * Create a system-wide notification for all or specific users
   * สร้างการแจ้งเตือนทั้งระบบสำหรับผู้ใช้ทั้งหมดหรือผู้ใช้ที่ระบุ
   * @param data - System notification data / ข้อมูลการแจ้งเตือนระบบ
   * @returns Array of created notifications / อาร์เรย์ของการแจ้งเตือนที่สร้างแล้ว
   */
  async createSystemNotification(data: CreateSystemNotificationData) {
    const prisma = await this.getPrisma();

    let users;
    if (data.userIds && data.userIds.length > 0) {
      users = await prisma.tb_user.findMany({
        where: {
          id: { in: data.userIds },
        },
      });
    } else {
      users = await prisma.tb_user.findMany();
    }

    const notifications = [];

    for (const user of users) {
      const notification = await prisma.tb_notification.create({
        data: {
          to_user_id: user.id,
          from_user_id: null,
          title: data.title,
          message: data.message,
          type: data.type,
          category: 'system',
          scheduled_at: data.scheduled_at,
          metadata: data.metadata,
        },
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Create a user-to-user notification
   * สร้างการแจ้งเตือนจากผู้ใช้ถึงผู้ใช้
   * @param data - User notification data / ข้อมูลการแจ้งเตือนผู้ใช้
   * @returns Created notification / การแจ้งเตือนที่สร้างแล้ว
   */
  async createUserNotification(data: CreateUserNotificationData) {
    const prisma = await this.getPrisma();

    return await prisma.tb_notification.create({
      data: {
        to_user_id: data.to_user_id,
        from_user_id: data.from_user_id,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        type: data.type,
        category: 'user-to-user',
        scheduled_at: data.scheduled_at,
      },
    });
  }

  /**
   * Get users belonging to a specific business unit
   * ดึงผู้ใช้ที่อยู่ในหน่วยธุรกิจที่ระบุ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @returns Array of users in the business unit / อาร์เรย์ของผู้ใช้ในหน่วยธุรกิจ
   */
  async getUsersByBusinessUnitCode(bu_code: string) {
    const prisma = await this.getPrisma();

    const businessUnit = await prisma.tb_business_unit.findFirst({
      where: {
        code: bu_code,
      },
    });

    if (!businessUnit) {
      return [];
    }

    const userBusinessUnits = await prisma.tb_user_tb_business_unit.findMany({
      where: {
        business_unit_id: businessUnit.id,
      },
      include: {
        tb_user_tb_user_tb_business_unit_user_idTotb_user: true,
      },
    });

    const users = userBusinessUnits
      .filter((ub) => ub.tb_user_tb_user_tb_business_unit_user_idTotb_user !== null)
      .map((ub) => ub.tb_user_tb_user_tb_business_unit_user_idTotb_user!);

    return users;
  }

  /**
   * Create notifications for all users in a business unit
   * สร้างการแจ้งเตือนสำหรับผู้ใช้ทั้งหมดในหน่วยธุรกิจ
   * @param data - Business unit notification data / ข้อมูลการแจ้งเตือนหน่วยธุรกิจ
   * @returns Array of created notifications / อาร์เรย์ของการแจ้งเตือนที่สร้างแล้ว
   */
  async createBusinessUnitNotification(data: CreateBusinessUnitNotificationData) {
    const prisma = await this.getPrisma();

    const users = await this.getUsersByBusinessUnitCode(data.bu_code);
    const notifications = [];

    for (const user of users) {
      const notification = await prisma.tb_notification.create({
        data: {
          to_user_id: user.id,
          from_user_id: data.from_user_id || null,
          title: data.title,
          message: data.message,
          type: data.type,
          category: 'business-unit',
          metadata: {
            ...data.metadata,
            bu_code: data.bu_code,
          },
          scheduled_at: data.scheduled_at,
        },
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Get unread notifications for a user, ordered by creation date descending
   * ดึงการแจ้งเตือนที่ยังไม่ได้อ่านของผู้ใช้ เรียงตามวันที่สร้างจากใหม่ไปเก่า
   * @param user_id - User ID / ID ผู้ใช้
   * @returns Array of unread notifications / อาร์เรย์ของการแจ้งเตือนที่ยังไม่ได้อ่าน
   */
  async getUnreadNotifications(user_id: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_notification.findMany({
      where: {
        to_user_id: user_id,
        is_read: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Mark a single notification as read
   * ทำเครื่องหมายการแจ้งเตือนรายการเดียวว่าอ่านแล้ว
   * @param notificationId - Notification ID / ID การแจ้งเตือน
   * @returns Updated notification / การแจ้งเตือนที่อัปเดตแล้ว
   */
  async markNotificationAsRead(notificationId: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_notification.update({
      where: { id: notificationId },
      data: { is_read: true },
    });
  }

  /**
   * Mark all unread notifications as read for a user
   * ทำเครื่องหมายการแจ้งเตือนที่ยังไม่ได้อ่านทั้งหมดของผู้ใช้ว่าอ่านแล้ว
   * @param user_id - User ID / ID ผู้ใช้
   * @returns Update result with count / ผลลัพธ์การอัปเดตพร้อมจำนวน
   */
  async markAllNotificationsAsRead(user_id: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_notification.updateMany({
      where: {
        to_user_id: user_id,
        is_read: false,
      },
      data: { is_read: true },
    });
  }

  /**
   * Get scheduled notifications that are due for sending
   * ดึงการแจ้งเตือนที่ตั้งเวลาไว้และถึงกำหนดส่ง
   * @returns Array of due scheduled notifications / อาร์เรย์ของการแจ้งเตือนที่ถึงกำหนด
   */
  async getScheduledNotifications() {
    const prisma = await this.getPrisma();
    const now = new Date();
    return await prisma.tb_notification.findMany({
      where: {
        scheduled_at: {
          lte: now,
        },
        is_sent: false,
      },
      include: {
        tb_user_tb_notification_to_user_idTotb_user: true,
      },
    });
  }

  /**
   * Mark a notification as sent
   * ทำเครื่องหมายการแจ้งเตือนว่าส่งแล้ว
   * @param notificationId - Notification ID / ID การแจ้งเตือน
   * @returns Updated notification / การแจ้งเตือนที่อัปเดตแล้ว
   */
  async markNotificationAsSent(notificationId: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_notification.update({
      where: { id: notificationId },
      data: { is_sent: true },
    });
  }

  /**
   * Get all users who have unread notifications
   * ดึงผู้ใช้ทั้งหมดที่มีการแจ้งเตือนที่ยังไม่ได้อ่าน
   * @returns Array of users with their unread notifications / อาร์เรย์ของผู้ใช้พร้อมการแจ้งเตือนที่ยังไม่ได้อ่าน
   */
  async getUsersWithUnreadNotifications() {
    const prisma = await this.getPrisma();
    return await prisma.tb_user.findMany({
      where: {
        tb_notification_tb_notification_to_user_idTotb_user: {
          some: {
            is_read: false,
          },
        },
      },
      include: {
        tb_notification_tb_notification_to_user_idTotb_user: {
          where: {
            is_read: false,
          },
        },
      },
    });
  }

  /**
   * Get all users from the platform database
   * ค้นหารายการผู้ใช้ทั้งหมดจากฐานข้อมูลแพลตฟอร์ม
   * @returns Array of all users / อาร์เรย์ของผู้ใช้ทั้งหมด
   */
  async getAllUsers() {
    const prisma = await this.getPrisma();
    return await prisma.tb_user.findMany();
  }

  /**
   * Get a user by their ID
   * ค้นหารายการเดียวตาม ID ผู้ใช้
   * @param userId - User ID / ID ผู้ใช้
   * @returns User or null if not found / ผู้ใช้หรือ null ถ้าไม่พบ
   */
  async getUserById(userId: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_user.findFirst({
      where: { id: userId },
    });
  }

  /**
   * Get all notifications for a user
   * ค้นหารายการแจ้งเตือนทั้งหมดของผู้ใช้
   * @param userId - User ID / ID ผู้ใช้
   * @returns Array of all notifications / อาร์เรย์ของการแจ้งเตือนทั้งหมด
   */
  async getAllNotifications(userId: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_notification.findMany({
      where: { to_user_id: userId },
    });
  }

  /**
   * Update user online status in the database
   * อัปเดตสถานะออนไลน์ของผู้ใช้ในฐานข้อมูล
   * @param user_id - User ID / ID ผู้ใช้
   * @param isOnline - Online status / สถานะออนไลน์
   * @returns Updated user or undefined on error / ผู้ใช้ที่อัปเดตแล้วหรือ undefined เมื่อเกิดข้อผิดพลาด
   */
  async updateUserOnlineStatus(user_id: string, isOnline: boolean) {
    const prisma = await this.getPrisma();
    return await prisma.tb_user.update({
      where: { id: user_id },
      data: { is_online: isOnline },
    }).catch(() => {
    });
  }
}
