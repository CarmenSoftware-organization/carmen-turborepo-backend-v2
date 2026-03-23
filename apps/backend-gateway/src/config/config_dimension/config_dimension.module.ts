import { Module } from '@nestjs/common';
import { Config_DimensionService } from './config_dimension.service';
import { Config_DimensionController } from './config_dimension.controller';
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
  controllers: [Config_DimensionController],
  providers: [Config_DimensionService],
})
export class Config_DimensionModule {}
