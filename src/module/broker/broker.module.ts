import { Module } from '@nestjs/common';
import { CoyoteBrokerService } from './service/coyote-broker.service';
import { HttpModule } from '@nestjs/axios';
import { TruckStopBrokerService } from '@module/broker/service/truck-stop-broker.service';

@Module({
  imports: [HttpModule],
  providers: [CoyoteBrokerService, TruckStopBrokerService],
  exports: [CoyoteBrokerService, TruckStopBrokerService]
})
export class BrokerModule {}
