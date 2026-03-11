import { Module } from '@nestjs/common';
import { CreditNoteService } from './credit-note.service';
import { CreditNoteController } from './credit-note.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envConfig } from 'src/libs/config.env';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PROCUREMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: envConfig.BUSINESS_SERVICE_HOST,
          port: Number(envConfig.BUSINESS_SERVICE_PORT),
        },
      },
    ]),
  ],
  controllers: [CreditNoteController],
  providers: [CreditNoteService],
})
export class CreditNoteModule {}
