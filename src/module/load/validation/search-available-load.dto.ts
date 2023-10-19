import { BaseSearchDto } from '@core/util/validation/base-search-dto';
import { IsLatitude, IsLongitude, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinateDto {
  @IsLatitude()
  @IsOptional()
  lat: number;

  @IsLongitude()
  @IsOptional()
  lng: number;
}

export class SearchAvailableLoadDto extends BaseSearchDto {
  @ValidateNested()
  @Type(() => CoordinateDto)
  from: CoordinateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinateDto)
  to: CoordinateDto;
}
