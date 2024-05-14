import { UseGuards, Controller, Get, Param, Req } from '@nestjs/common';
import { ApiBrokers, isApiBroker } from '@module/broker/interface/flat-5/common.interface';
import { AuthGuard } from '@module/auth/auth.guard';
import { BookingService } from '../service/booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(AuthGuard)
  @Get('/')
  getBookingList(@Req() request) {
    const userId = request.user.id;

    return this.bookingService.getBookingList(userId);
  }

  @UseGuards(AuthGuard)
  @Get('/:bookingId')
  getBookingDetail(@Param('bookingId') bookingId: string) {
    return this.bookingService.getBookingDetail(bookingId);
  }

  @UseGuards(AuthGuard)
  @Get(':broker/:bookingId/status')
  getBookingStatus(@Param('broker') broker: ApiBrokers, @Param('bookingId') bookingId: string) {
    if (isApiBroker(broker)) {
      return this.bookingService.getBookingStatus(broker, bookingId);
    }

    return;
  }
}
