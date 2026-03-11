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

  // list all environment variables
  logger.verbose({ envConfig: envConfig, process_env: process.env }, 'env');

  const fileServiceHost = envConfig.FILE_SERVICE_HOST;
  const fileServiceHttpsPort = Number(envConfig.FILE_SERVICE_HTTPS_PORT);
  const fileServiceHttpPort = Number(envConfig.FILE_SERVICE_HTTP_PORT);

  logger.log(
    `FileService is configured to run on ${fileServiceHost}:${fileServiceHttpsPort}`,
  );
  logger.log(
    `HTTP server is configured to run on ${fileServiceHost}:${fileServiceHttpPort}`,
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: fileServiceHost,
      port: fileServiceHttpsPort,
    },
  });

  await app.startAllMicroservices();
  await app.listen(fileServiceHttpPort);

  logger.log(
    `FileService is running on ${fileServiceHost}:${fileServiceHttpsPort}`,
  );
  logger.log(
    `HTTP server is running on ${fileServiceHost}:${fileServiceHttpPort}`,
  );
}

bootstrap();
