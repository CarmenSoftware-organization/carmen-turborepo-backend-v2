import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ClusterService } from './cluster.service';
import { ClusterController } from './cluster.controller';
import { PrismaClient_SYSTEM } from '@repo/prisma-shared-schema-platform';
import { PrismaClient_TENANT } from '@repo/prisma-shared-schema-tenant';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { envConfig } from 'src/libs/config.env';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KEYCLOAK_SERVICE',
        transport: Transport.TCP,
        options: {
          host: envConfig.KEYCLOAK_API_SERVICE_HOST,
          port: Number(envConfig.KEYCLOAK_API_SERVICE_PORT),
        },
      },
    ]),
  ],
  controllers: [ClusterController],
  providers: [
    ClusterService,
    BackendLogger,
    {
      provide: 'PRISMA_SYSTEM',
      useValue: PrismaClient_SYSTEM,
    },
    {
      provide: 'PRISMA_TENANT',
      useValue: PrismaClient_TENANT,
    },
  ],
  exports: [ClusterService],
})
export class ClusterModule {}
