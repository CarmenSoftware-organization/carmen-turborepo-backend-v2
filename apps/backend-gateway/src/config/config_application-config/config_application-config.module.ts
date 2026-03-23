import { Module } from '@nestjs/common';
import { Config_ApplicationConfigService } from './config_application-config.service';
import { Config_ApplicationConfigController } from './config_application-config.controller';
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
  controllers: [Config_ApplicationConfigController],
  providers: [Config_ApplicationConfigService],
})
export class Config_ApplicationConfigModule {}
