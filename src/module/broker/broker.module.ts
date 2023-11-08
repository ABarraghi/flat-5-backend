import { Module } from '@nestjs/common';
import { CoyoteBrokerService } from './coyote/coyote-broker.service';
import { HttpModule } from '@nestjs/axios';
import { TruckStopBrokerService } from '@module/broker/truck-stop/truck-stop-broker.service';
import { MapboxService } from '@module/broker/service/mapbox.service';
import { ErrorCodeService } from '@core/exception/error-code.service';
import { coyoteErrorCodes } from '@module/broker/const/coyote.error-code';
import { datErrorCodes } from '@module/broker/const/dat.error-code';
import { DatBrokerService } from '@module/broker/dat/dat-broker.service';
import { CoyoteInputTransformer } from '@module/broker/coyote/coyote-input.transformer';
import { CoyoteOutputTransformer } from '@module/broker/coyote/coyote-output.transformer';
import { DatInputTransformer } from '@module/broker/dat/dat-input.transformer';
import { DatOutputTransformer } from '@module/broker/dat/dat-output.transformer';
import { TruckStopInputTransformer } from '@module/broker/truck-stop/truck-stop-input.transformer';
import { TruckStopOutputTransformer } from '@module/broker/truck-stop/truck-stop-output.transformer';

@Module({
  imports: [HttpModule],
  providers: [
    CoyoteBrokerService,
    DatBrokerService,
    TruckStopBrokerService,
    MapboxService,
    CoyoteInputTransformer,
    CoyoteOutputTransformer,
    DatInputTransformer,
    DatOutputTransformer,
    TruckStopInputTransformer,
    TruckStopOutputTransformer,
    DatOutputTransformer
  ],
  exports: [
    CoyoteBrokerService,
    DatBrokerService,
    TruckStopBrokerService,
    MapboxService,
    CoyoteInputTransformer,
    CoyoteOutputTransformer,
    DatInputTransformer,
    DatOutputTransformer,
    TruckStopInputTransformer,
    TruckStopOutputTransformer,
    DatOutputTransformer
  ]
})
export class BrokerModule {
  constructor() {
    ErrorCodeService.register(coyoteErrorCodes);
    ErrorCodeService.register(datErrorCodes);
  }
}
