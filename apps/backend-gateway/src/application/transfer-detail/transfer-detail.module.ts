import { Module } from '@nestjs/common';
import { TransferDetailService } from './transfer-detail.service';
import { TransferDetailController } from './transfer-detail.controller';
import { envConfig } from 'src/libs/config.env';
import { Transport } from '@nestjs/microservices';
import { ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BUSINESS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: envConfig.BUSINESS_SERVICE_HOST,
          port: Number(envConfig.BUSINESS_SERVICE_PORT),
        },
      },
    ]),
  ],
  controllers: [TransferDetailController],
  providers: [TransferDetailService],
})
export class TransferDetailModule {}
