import { Module } from '@nestjs/common';
import { CoyoteBrokerService } from './service/coyote-broker.service';
import { HttpModule } from '@nestjs/axios';
import { ErrorCodeService } from '@core/exception/error-code.service';
import { coyoteErrorCodes } from '@module/broker/const/coyote.error-code';
import { datErrorCodes } from '@module/broker/const/dat.error-code';
import { DatBrokerService } from '@module/broker/service/dat-broker.service';

@Module({
  imports: [HttpModule],
  providers: [CoyoteBrokerService, DatBrokerService],
  exports: [CoyoteBrokerService, DatBrokerService]
})
export class BrokerModule {
  constructor() {
    ErrorCodeService.register(coyoteErrorCodes);
    ErrorCodeService.register(datErrorCodes);
  }
}
