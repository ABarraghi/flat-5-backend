import { Module } from '@nestjs/common';
import { CoyoteBrokerService } from './service/coyote-broker.service';
import { HttpModule } from '@nestjs/axios';
import { TruckStopBrokerService } from '@module/broker/service/truck-stop-broker.service';
import { MapboxService } from '@module/broker/service/mapbox.service';

@Module({
  imports: [HttpModule],
  providers: [CoyoteBrokerService, TruckStopBrokerService, MapboxService],
  exports: [CoyoteBrokerService, TruckStopBrokerService, MapboxService]
})
export class BrokerModule {}
