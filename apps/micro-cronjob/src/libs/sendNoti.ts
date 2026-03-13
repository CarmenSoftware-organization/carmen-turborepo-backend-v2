import { envConfig } from '@/libs/config.env';

const notify_host = envConfig.NOTIFICATION_SERVICE_HOST || 'localhost';
const notify_port = envConfig.NOTIFICATION_SERVICE_TCP_PORT || '5006';
/**
 * Send a notification via the notification service HTTP API
 * ส่งการแจ้งเตือนผ่าน HTTP API ของบริการแจ้งเตือน
 * @param data - Notification data (title, message, type, category, userIds) / ข้อมูลการแจ้งเตือน
 * @returns Notification response or undefined on failure / ผลลัพธ์การแจ้งเตือนหรือ undefined เมื่อล้มเหลว
 */
export async function sendNotification(data: {
  title: string;
  message: string;
  type: string;
  category: string;
  userIds: string[];
}) {
  try {
    const response = await fetch(
      `http://${notify_host}:${notify_port}/api/notifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
    } else {
      return response.json();
    }
  } catch (error) {
  }
}
