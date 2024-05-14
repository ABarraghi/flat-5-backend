import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorCodeService } from '@core/exception/error-code.service';
import { BookingController } from '@module/booking/controller/booking.controller';
import { errorCodes } from '@module/load/const/error-code';
import { BookingService } from '@module/booking/service/booking.service';
import { Booking, BookingSchema } from '@module/load/schema/booking.schema';
import { BrokerModule } from '@module/broker/broker.module';

@Module({
  imports: [BrokerModule, MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService]
})
export class BookingModule {
  constructor() {
    ErrorCodeService.register(errorCodes);
  }
}
