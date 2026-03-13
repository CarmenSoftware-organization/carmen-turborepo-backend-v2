import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { NotificationService, CreateSystemNotificationData, CreateUserNotificationData, CreateBusinessUnitNotificationData } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Create a notification (system, user-to-user, or business unit)
   * สร้างการแจ้งเตือน (ระบบ, ระหว่างผู้ใช้, หรือหน่วยธุรกิจ)
   * @param data - Contains category, title, message, type, and category-specific fields / ประกอบด้วย category, title, message, type, และฟิลด์เฉพาะประเภท
   * @returns Created notification(s) / การแจ้งเตือนที่สร้างแล้ว
   */
  @MessagePattern({ cmd: 'notification.create', service: 'notification' })
  async create(data: MicroservicePayload) {
    try {
      if (data.category === 'system') {
        const systemData: CreateSystemNotificationData = {
          title: data.title,
          message: data.message,
          type: data.type,
          metadata: data.metadata,
          userIds: data.userIds,
          scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
        };

        const notifications = await this.notificationService.createSystemNotification(systemData);

        if (!systemData.scheduled_at) {
          this.notificationGateway.broadcastSystemNotification(notifications);
        }

        return { status: 201, data: { notifications, count: notifications.length } };
      } else if (data.category === 'user-to-user') {
        const userData: CreateUserNotificationData = {
          to_user_id: data.to_user_id,
          from_user_id: data.from_user_id,
          title: data.title,
          message: data.message,
          type: data.type,
          scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
        };

        const notification = await this.notificationService.createUserNotification(userData);

        if (!userData.scheduled_at) {
          const user = await this.notificationService.getUserById(userData.to_user_id);
          if (user?.is_online) {
            this.notificationGateway.sendNotificationToUser(userData.to_user_id, notification);
          }
        }

        return { status: 201, data: notification };
      } else if (data.category === 'business-unit') {
        const buData: CreateBusinessUnitNotificationData = {
          bu_code: data.bu_code,
          from_user_id: data.from_user_id,
          title: data.title,
          message: data.message,
          type: data.type || 'BU_INFO',
          metadata: data.metadata,
          scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
        };

        const notifications = await this.notificationService.createBusinessUnitNotification(buData);

        if (!buData.scheduled_at && notifications.length > 0) {
          for (const notification of notifications) {
            if (notification.to_user_id) {
              const user = await this.notificationService.getUserById(notification.to_user_id);
              if (user?.is_online) {
                this.notificationGateway.sendNotificationToUser(notification.to_user_id, notification);
              }
            }
          }
        }

        return {
          status: 201,
          data: {
            notifications,
            count: notifications.length,
            bu_code: buData.bu_code,
          },
        };
      } else {
        return {
          status: 400,
          error: 'Invalid category. Must be "system", "user-to-user", or "business-unit"',
        };
      }
    } catch (error) {
      return {
        status: 500,
        error: 'Failed to create notification',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get unread notifications for a user
   * ดึงการแจ้งเตือนที่ยังไม่ได้อ่านของผู้ใช้
   * @param data - Contains user_id / ประกอบด้วย user_id
   * @returns Unread notifications / การแจ้งเตือนที่ยังไม่ได้อ่าน
   */
  @MessagePattern({ cmd: 'notification.getByUserId', service: 'notification' })
  async getByUserId(data: { user_id: string }) {
    try {
      const notifications = await this.notificationService.getUnreadNotifications(data.user_id);
      return { status: 200, data: { notifications } };
    } catch (error) {
      return { status: 500, error: 'Failed to get notifications' };
    }
  }

  /**
   * Get all notifications for a user
   * ดึงการแจ้งเตือนทั้งหมดของผู้ใช้
   * @param data - Contains user_id / ประกอบด้วย user_id
   * @returns All notifications / การแจ้งเตือนทั้งหมด
   */
  @MessagePattern({ cmd: 'notification.getAllByUserId', service: 'notification' })
  async getAllByUserId(data: { user_id: string }) {
    try {
      const notifications = await this.notificationService.getAllNotifications(data.user_id);
      return { status: 200, data: { notifications } };
    } catch (error) {
      return { status: 500, error: 'Failed to get notifications' };
    }
  }

  /**
   * Mark a notification as read
   * ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว
   * @param data - Contains notification id / ประกอบด้วย ID การแจ้งเตือน
   * @returns Updated notification / การแจ้งเตือนที่อัปเดตแล้ว
   */
  @MessagePattern({ cmd: 'notification.markAsRead', service: 'notification' })
  async markAsRead(data: { id: string }) {
    try {
      const notification = await this.notificationService.markNotificationAsRead(data.id);
      return { status: 200, data: { notification } };
    } catch (error) {
      return { status: 500, error: 'Failed to mark notification as read' };
    }
  }

  /**
   * Mark all notifications as read for a user
   * ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้วสำหรับผู้ใช้
   * @param data - Contains user_id / ประกอบด้วย user_id
   * @returns Count of marked notifications / จำนวนการแจ้งเตือนที่ทำเครื่องหมาย
   */
  @MessagePattern({ cmd: 'notification.markAllAsRead', service: 'notification' })
  async markAllAsRead(data: { user_id: string }) {
    try {
      const result = await this.notificationService.markAllNotificationsAsRead(data.user_id);
      return {
        status: 200,
        data: {
          message: `Marked ${result.count} notifications as read`,
          count: result.count,
        },
      };
    } catch (error) {
      return { status: 500, error: 'Failed to mark all notifications as read' };
    }
  }
}
