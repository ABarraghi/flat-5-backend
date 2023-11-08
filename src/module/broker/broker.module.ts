import { Module } from '@nestjs/common';
import { CoyoteBrokerService } from './service/coyote-broker.service';
import { HttpModule } from '@nestjs/axios';
import { TruckStopBrokerService } from '@module/broker/service/truck-stop-broker.service';
import { MapboxService } from '@module/broker/service/mapbox.service';
import { ErrorCodeService } from '@core/exception/error-code.service';
import { coyoteErrorCodes } from '@module/broker/const/coyote.error-code';
import { datErrorCodes } from '@module/broker/const/dat.error-code';
import { DatBrokerService } from '@module/broker/service/dat-broker.service';

@Module({
  imports: [HttpModule],
  providers: [CoyoteBrokerService, DatBrokerService, TruckStopBrokerService, MapboxService],
  exports: [CoyoteBrokerService, DatBrokerService, TruckStopBrokerService, MapboxService]
})
export class BrokerModule {
  constructor() {
    ErrorCodeService.register(coyoteErrorCodes);
    ErrorCodeService.register(datErrorCodes);
  }
}
