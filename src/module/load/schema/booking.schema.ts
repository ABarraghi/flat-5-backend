import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@module/user/schema/user.schema';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop()
  broker: string;

  @Prop()
  loadId: string;

  @Prop()
  bookingId: string;

  @Prop()
  carrierId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: User;

  @Prop({ type: SchemaTypes.Mixed })
  loadData: any;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
