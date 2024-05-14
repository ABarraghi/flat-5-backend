import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { CoyoteBrokerService } from '@module/broker/coyote/coyote-broker.service';
import { CoyoteInputTransformer } from '@module/broker/coyote/coyote-input.transformer';
import { CoyoteOutputTransformer } from '@module/broker/coyote/coyote-output.transformer';
import { ApiBrokers } from '@module/broker/interface/flat-5/common.interface';
import { Booking } from '@module/load/schema/booking.schema';
import { CreateBookingDto } from '../validation/booking.dto';

@Injectable()
export class BookingService {
  constructor(
    private configService: ConfigService,
    private coyoteBrokerService: CoyoteBrokerService,
    private coyoteInputTransformer: CoyoteInputTransformer,
    private coyoteOutputTransformer: CoyoteOutputTransformer,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const createdBooking = new this.bookingModel(createBookingDto);

    return createdBooking.save();
  }

  async getBookingList(userId: string): Promise<any> {
    const userObjectId = new Types.ObjectId(userId);

    return this.bookingModel.find({ user: userObjectId }, '-name', { lean: true });
  }

  async getBookingDetail(bookingId: string): Promise<any> {
    return this.bookingModel.findOne({ bookingId });
  }

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
