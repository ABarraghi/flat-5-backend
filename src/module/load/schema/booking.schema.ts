import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

@Schema()
export class Booking {
  @Prop()
  broker: string;

  @Prop()
  loadId: string;

  @Prop()
  bookingId: string;

  @Prop()
  carrierId: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
