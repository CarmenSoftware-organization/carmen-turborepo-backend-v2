import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { envConfig } from 'src/libs/config.env';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REPORT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'report.v1',
          protoPath: join(
            process.cwd(),
            'proto/report/v1/report.proto',
          ),
          url: `${envConfig.REPORT_SERVICE_HOST}:${envConfig.REPORT_SERVICE_GRPC_PORT}`,
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          },
        },
      },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
