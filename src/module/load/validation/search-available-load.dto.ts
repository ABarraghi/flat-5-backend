import { BaseSearchDto } from '@core/util/validation/base-search-dto';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsDefined,
  IsIn,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinateDto {
  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsOptional()
  city: string;

  @IsOptional()
  state: string;

  @IsOptional()
  country: string;

  @IsOptional()
  range: number;
}

export class LocationDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinateDto)
  coordinate: CoordinateDto;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  city: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  state: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  country: string;

  @IsOptional()
  @IsNotEmpty()
  postalCode: string;
}

export class StopDate {
  @IsString()
  @IsISO8601()
  @IsDefined()
  from: string;

  @IsOptional()
  @IsString()
  @IsISO8601()
  to: string;
}

export class StopPointDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ValidateNested()
  @Type(() => StopDate)
  @IsOptional()
  stopDate: StopDate;

  @IsOptional()
  @IsNumber()
  radius: number;

  @IsOptional()
  unit: 'Miles' | 'Kilometers' = 'Miles';
}

export class SearchAvailableLoadDto extends BaseSearchDto {
  @ValidateNested({ each: true })
  @Type(() => StopPointDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ArrayNotEmpty()
  stopPoints: StopPointDto[];

  @IsOptional()
  @IsIn(['standard', 'enRoute'])
  type: 'standard' | 'enRoute' = 'standard';

  @IsOptional()
  equipmentType: string;

  @IsOptional()
  shipmentFormat: string;
}
