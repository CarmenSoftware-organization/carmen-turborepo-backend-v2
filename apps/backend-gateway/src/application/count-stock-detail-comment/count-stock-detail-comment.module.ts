import { Module } from '@nestjs/common';
import { CountStockDetailCommentService } from './count-stock-detail-comment.service';
import { CountStockDetailCommentController } from './count-stock-detail-comment.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envConfig } from 'src/libs/config.env';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BUSINESS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: envConfig.BUSINESS_SERVICE_HOST,
          port: Number(envConfig.BUSINESS_SERVICE_TCP_PORT),
        },
      },
    ]),
  ],
  controllers: [CountStockDetailCommentController],
  providers: [CountStockDetailCommentService],
})
export class CountStockDetailCommentModule {}
