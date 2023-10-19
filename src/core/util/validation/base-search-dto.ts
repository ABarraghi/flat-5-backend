import { BaseRequestDto } from '@core/util/validation/base-request-dto';
import { IsOptional } from 'class-validator';

export class BaseSearchDto extends BaseRequestDto {
  @IsOptional()
  key: string;
}
