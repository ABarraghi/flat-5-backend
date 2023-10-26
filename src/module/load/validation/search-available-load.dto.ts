import { BaseSearchDto } from '@core/util/validation/base-search-dto';
import { IsLatitude, IsLongitude, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinateDto {
  @IsLatitude()
  @IsOptional()
  latitude: number;

  @IsLongitude()
  @IsOptional()
  longitude: number;
}

export class SearchAvailableLoadDto extends BaseSearchDto {
  @ValidateNested()
  @Type(() => CoordinateDto)
  from: CoordinateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinateDto)
  to: CoordinateDto;

  @IsOptional()
  @IsNumber()
  distance: number;

  @IsOptional()
  unit = 'Kilometers';
}
