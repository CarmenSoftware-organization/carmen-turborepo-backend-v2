import { Module } from '@nestjs/common';
import { ExtraCostService } from './extra-cost.service';
import { ExtraCostController } from './extra-cost.controller';
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
  controllers: [ExtraCostController],
  providers: [ExtraCostService],
})
export class ExtraCostModule {}
