import { Module } from '@nestjs/common';
import { LoadController } from '@module/load/controller/load.controller';
import { LoadService } from './service/load.service';
import { ErrorCodeService } from '@core/exception/error-code.service';
import { errorCodes } from '@module/load/const/error-code';
import { BrokerModule } from '@module/broker/broker.module';

@Module({
  imports: [BrokerModule],
  controllers: [LoadController],
  providers: [LoadService]
})
export class LoadModule {
  constructor() {
    ErrorCodeService.register(errorCodes);
  }
}
