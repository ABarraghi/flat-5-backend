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

  transformBooking(bookingData) {
    const booking = {
      ...bookingData,
      _id: bookingData._id.toString(),
      user: bookingData.user.toString()
    };

    return booking;
  }

  async getBookingList(userId: string): Promise<any> {
    const userObjectId = new Types.ObjectId(userId);

    const listData = await this.bookingModel.find({ user: userObjectId }, '-name', { lean: true });

    const list = listData.map(booking => this.transformBooking(booking));

    return list;
  }

  async getBookingDetail(bookingId: string): Promise<any> {
    const bookingData = await this.bookingModel.findOne({ _id: bookingId }, '-name', { lean: true });
    const booking = this.transformBooking(bookingData);

    return booking;
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
