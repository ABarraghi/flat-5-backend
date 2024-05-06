import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorCodeService } from '@core/exception/error-code.service';
import { LoadController } from '@module/load/controller/load.controller';
import { BookingController } from '@module/booking/controller/booking.controller';
import { errorCodes } from '@module/load/const/error-code';
import { BrokerModule } from '@module/broker/broker.module';
import { BookingService } from '@module/booking/service/booking.service';
import { Booking, BookingSchema } from '@module/load/schema/booking.schema';
import { LoadService } from './service/load.service';

@Module({
  imports: [BrokerModule, MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }])],
  controllers: [LoadController, BookingController],
  providers: [LoadService, BookingService]
})
export class LoadModule {
  constructor() {
    ErrorCodeService.register(errorCodes);
  }
}
