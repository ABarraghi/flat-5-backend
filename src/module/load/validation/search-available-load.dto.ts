import { BaseSearchDto } from '@core/util/validation/base-search-dto';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsBoolean,
  IsDefined,
  IsIn,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { DISTANCE_UNIT_DEFAULT } from '@module/broker/interface/flat-5/load.interface';
import { IsAfterNow } from '@core/util/validation/validator/is-after-now';
import { IsBefore } from '@core/util/validation/validator/is-before';
import { IsAfter } from '@core/util/validation/validator/is-after';

export class CoordinateDto {
  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}

export class LocationDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinateDto)
  coordinates: CoordinateDto;

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
  @Validate(IsAfterNow)
  @Validate(IsBefore, ['to'])
  from: string;

  // @IsOptional()
  @IsString()
  @IsISO8601()
  @Validate(IsAfterNow)
  @Validate(IsAfter, ['from'])
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

  @IsBoolean()
  @IsOptional()
  hadLoad: boolean;

  @IsOptional()
  @IsNumber()
  radius: number;

  @IsOptional()
  unit: 'Miles' | 'Kilometers' = DISTANCE_UNIT_DEFAULT;
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
  returnHome: boolean;

  @IsOptional()
  @IsIn(['dry_van', 'reefer', 'flatbed', 'dry_van_or_reefer', 'flat_or_van'])
  equipmentType: string;

  @IsOptional()
  shipmentFormat: string;

  @IsOptional()
  isRestrictBusinessLogic: boolean;
  @IsOptional()
  allowEmptyLoads: boolean;
}
