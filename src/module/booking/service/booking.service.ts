import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoyoteBrokerService } from '@module/broker/coyote/coyote-broker.service';
import { CoyoteInputTransformer } from '@module/broker/coyote/coyote-input.transformer';
import { CoyoteOutputTransformer } from '@module/broker/coyote/coyote-output.transformer';
import { ApiBrokers } from '@module/broker/interface/flat-5/common.interface';

@Injectable()
export class BookingService {
  constructor(
    private configService: ConfigService,
    private coyoteBrokerService: CoyoteBrokerService,
    private coyoteInputTransformer: CoyoteInputTransformer,
    private coyoteOutputTransformer: CoyoteOutputTransformer
  ) {}

  async getBookingStatus(broker: ApiBrokers, bookingId: string): Promise<any> {
    switch (broker) {
      case 'coyote':
        if (this.configService.get('broker.coyote.enabled')) {
          const input = this.coyoteInputTransformer.getBookingStatus(bookingId);
          const coyoteBookingStatus = await this.coyoteBrokerService.getBookingStatus(input);

          return this.coyoteOutputTransformer.getBookingStatus(coyoteBookingStatus);
        }
        break;
      default:
        return;
    }
  }
}
