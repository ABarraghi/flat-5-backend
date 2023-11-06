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
  @Type(() => CoordinateDto)
  location: CoordinateDto;

  @ValidateNested()
  @Type(() => StopDate)
  @IsOptional()
  stopDate: StopDate;

  @IsOptional()
  @IsNumber()
  radius: number;

  @IsOptional()
  unit: 'Miles' | 'Kilometers' = 'Kilometers';
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
