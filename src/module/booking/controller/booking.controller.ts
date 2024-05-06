import { Controller, Get, Param } from '@nestjs/common';
import { ApiBrokers, isApiBroker } from '@module/broker/interface/flat-5/common.interface';
import { BookingService } from '../service/booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get(':broker/:bookingId/status')
  getBookingStatus(@Param('broker') broker: ApiBrokers, @Param('bookingId') bookingId: string) {
    if (isApiBroker(broker)) {
      return this.bookingService.getBookingStatus(broker, bookingId);
    }

    return;
  }
}
