import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { routes } from './routes';
import { cronJobManager } from './jobs/cronJobManager';
import { swagger } from '@elysiajs/swagger';
import { envConfig } from './libs/config.env';

const service_host = envConfig.CRONJOB_SERVICE_HOST;
const service_port = envConfig.CRONJOB_SERVICE_TCP_PORT;

const app = new Elysia()
  .use(
    cors({
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Notification System API',
          version: '1.0.0',
          description:
            'Real-time notification system with WebSocket and CronJob management',
        },
        servers: [
          {
            url: `https://${service_host}:${service_port}`,
            description: 'Development server',
          },
          {
            url: `http://${service_host}:${service_port}`,
            description: 'Development server',
          },
          {
            url: `http://dev.blueledgers.com`,
            description: 'Production server',
          },
        ],
        tags: [
          {
            name: 'cronjobs',
            description: 'CronJob management endpoints',
          },
        ],
      },
    }),
  )
  .get('/', () => ({
    message: '🚀 Notification System API',
    status: 'ระบบพร้อมใช้งาน!',
    emoji: '🔔✨',
    endpoints: {
      ping: '/ping',
      notifications: '/api/notifications',
      cronjobs: '/api/cronjobs',
      websocket: '/ws',
      docs: '/swagger',
    },
    users: {
      description: 'Select user for dashboard testing',
      available: [
        {
          id: 'user1',
          name: 'Alice Johnson',
          role: 'admin',
          email: 'alice@example.com',
        },
        {
          id: 'user2',
          name: 'Bob Smith',
          role: 'user',
          email: 'bob@example.com',
        },
        {
          id: 'user3',
          name: 'Charlie Brown',
          role: 'user',
          email: 'charlie@example.com',
        },
      ],
    },
    fun_fact: 'Server นี้ใช้ Bun + Elysia เร็วมากกก! ⚡️',
  }))
  .get('/ping', () => 'pong')
  .get('/health', () => 'OK')
  .use(routes)
  .listen(service_port);

// Initialize dynamic cron job manager
cronJobManager.loadCronJobs();

// Graceful shutdown
process.on('SIGINT', () => {
  cronJobManager.stopAllJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cronJobManager.stopAllJobs();
  process.exit(0);
});
