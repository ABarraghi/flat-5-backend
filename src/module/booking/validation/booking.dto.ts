import { IsNotEmpty, IsString, IsMongoId, IsObject } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  broker: string;

  @IsString()
  @IsNotEmpty()
  loadId: string;

  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  carrierId: string;

  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @IsObject()
  loadData: any;
}
