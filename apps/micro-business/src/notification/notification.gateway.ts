import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';

interface WebSocketMessage {
  type: 'register' | 'markAsRead';
  user_id?: string;
  notificationId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userConnections = new Map<string, Socket>();
  private socketToUser = new Map<string, string>();

  constructor(private readonly notificationService: NotificationService) {}

  async handleConnection(client: Socket) {
  }

  async handleDisconnect(client: Socket) {
    const user_id = this.socketToUser.get(client.id);
    if (user_id) {
      this.userConnections.delete(user_id);
      this.socketToUser.delete(client.id);
      await this.notificationService.updateUserOnlineStatus(user_id, false);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string | WebSocketMessage,
  ) {
    try {
      let data: WebSocketMessage;

      if (typeof message === 'string') {
        try {
          data = JSON.parse(message);
        } catch (parseError) {
          return;
        }
      } else {
        data = message;
      }

      if (!data || typeof data !== 'object' || !data.type) {
        return;
      }

      switch (data.type) {
        case 'register':
          if (data.user_id) {
            await this.handleUserRegister(client, data.user_id);
          }
          break;

        case 'markAsRead':
          if (data.notificationId) {
            await this.handleMarkAsRead(data.notificationId);
          }
          break;

        default:
      }
    } catch {
      // ignore
    }
  }

  @SubscribeMessage('register')
  async handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { user_id: string },
  ) {
    if (data.user_id) {
      await this.handleUserRegister(client, data.user_id);
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsReadEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    if (data.notificationId) {
      await this.handleMarkAsRead(data.notificationId);
    }
  }

  private async handleUserRegister(client: Socket, user_id: string) {
    this.userConnections.set(user_id, client);
    this.socketToUser.set(client.id, user_id);

    const unreadNotifications = await this.notificationService.getUnreadNotifications(user_id);

    for (const notification of unreadNotifications) {
      this.sendNotificationToUser(user_id, notification);
    }
  }

  private async handleMarkAsRead(notificationId: string) {
    await this.notificationService.markNotificationAsRead(notificationId);
  }

  sendNotificationToUser(user_id: string, notification: Record<string, unknown>) {
    const client = this.userConnections.get(user_id);

    if (client) {
      const message = {
        type: 'notification',
        data: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          created_at: notification.created_at,
        },
      };

      client.emit('notification', message);
    }
  }

   
  broadcastSystemNotification(notifications: any[]) {
    for (const notification of notifications) {
      this.sendNotificationToUser(notification.to_user_id as string, notification);
    }
  }

  findUserIdBySocket(socketId: string): string | null {
    return this.socketToUser.get(socketId) || null;
  }
}
