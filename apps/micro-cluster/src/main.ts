import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envConfig } from 'src/libs/config.env';
import { WinstonModule } from 'nest-winston';
import { BackendLogger, winstonLogger } from './common/helpers/backend.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });
  const logger = new BackendLogger(bootstrap.name);

  const clusterServiceHost = envConfig.CLUSTER_SERVICE_HOST ?? 'localhost';
  const clusterServicePort = Number(envConfig.CLUSTER_SERVICE_PORT ?? 5014);
  const clusterServiceHttpPort = Number(envConfig.CLUSTER_SERVICE_HTTP_PORT ?? 6014);

  // Connect TCP microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: clusterServiceHost,
      port: clusterServicePort,
    },
  });

  await app.startAllMicroservices();
  await app.listen(clusterServiceHttpPort);

  logger.log(
    `ClusterService TCP is running on ${clusterServiceHost}:${clusterServicePort}`,
  );
  logger.log(
    `ClusterService HTTP is running on ${clusterServiceHost}:${clusterServiceHttpPort}`,
  );
}

bootstrap();
