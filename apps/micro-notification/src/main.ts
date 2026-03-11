import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { envConfig } from "./libs/config.env";
import { WinstonModule } from "nest-winston";
import { BackendLogger, winstonLogger } from "./common/helpers/backend.logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });
  const logger = new BackendLogger(bootstrap.name);

  const notificationServiceHost = envConfig.NOTIFICATION_SERVICE_HOST;
  const notificationServiceHttpsPort = Number(envConfig.NOTIFICATION_SERVICE_HTTPS_PORT);
  const notificationServiceHttpPort = Number(envConfig.NOTIFICATION_SERVICE_HTTP_PORT);

  logger.log(`NotificationService is configured to run on ${notificationServiceHost}:${notificationServiceHttpsPort}`);
  logger.log(`HTTP server is configured to run on ${notificationServiceHost}:${notificationServiceHttpPort}`);

  // Connect TCP microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: notificationServiceHost,
      port: notificationServiceHttpsPort,
    },
  });

  // Enable CORS for WebSocket
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.startAllMicroservices();
  await app.listen(notificationServiceHttpPort);

  logger.log(`NotificationService TCP is running on ${notificationServiceHost}:${notificationServiceHttpsPort}`);
  logger.log(`NotificationService HTTP is running on ${notificationServiceHost}:${notificationServiceHttpPort}`);
  logger.log(
    `NotificationService WebSocket is available at ws://${notificationServiceHost}:${notificationServiceHttpPort}`,
  );
}

bootstrap();
