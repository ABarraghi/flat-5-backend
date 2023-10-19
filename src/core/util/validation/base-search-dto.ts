import { BaseRequestDto } from '@core/util/validation/base-request-dto';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { PAGINATION_ARGS } from '@core/database/const/pagination-args';

export class BaseSearchDto extends BaseRequestDto {
  @IsOptional()
  key: string;

  @IsString()
  @IsOptional()
  orderBy: any = 'createdAt';

  @IsIn(['ASC', 'DESC'])
  @Transform(({ value }) => {
    return value.toUpperCase();
  })
  @IsOptional()
  orderType: any = 'DESC';

  @IsInt()
  @Transform(({ value }) => {
    return parseInt(value, 10) > 0 ? parseInt(value, 10) : 1;
  })
  @IsOptional()
  page = PAGINATION_ARGS.page;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => {
    return parseInt(value, 10) >= 0 ? parseInt(value, 10) : undefined;
  })
  @IsOptional()
  skip: number;
}
