import { Module } from '@nestjs/common';
import { StockOutCommentService } from './stock-out-comment.service';
import { StockOutCommentController } from './stock-out-comment.controller';
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
  controllers: [StockOutCommentController],
  providers: [StockOutCommentService],
})
export class StockOutCommentModule {}
