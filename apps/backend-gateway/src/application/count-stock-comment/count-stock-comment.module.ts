import { Module } from '@nestjs/common';
import { CountStockCommentService } from './count-stock-comment.service';
import { CountStockCommentController } from './count-stock-comment.controller';
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
  controllers: [CountStockCommentController],
  providers: [CountStockCommentService],
})
export class CountStockCommentModule {}
