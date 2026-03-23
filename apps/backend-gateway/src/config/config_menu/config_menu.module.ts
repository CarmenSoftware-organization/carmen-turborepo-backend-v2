import { Module } from '@nestjs/common';
import { Config_MenuService } from './config_menu.service';
import { Config_MenuController } from './config_menu.controller';
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
  controllers: [Config_MenuController],
  providers: [Config_MenuService],
})
export class Config_MenuModule {}
