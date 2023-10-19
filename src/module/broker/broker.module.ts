import { Module } from '@nestjs/common';
import { CoyoteBrokerService } from './service/coyote-broker.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CoyoteBrokerService],
  exports: [CoyoteBrokerService]
})
export class BrokerModule {}
