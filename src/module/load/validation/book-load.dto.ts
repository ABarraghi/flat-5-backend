import { BaseSearchDto } from '@core/util/validation/base-search-dto';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { ApiBrokers } from '@module/transform-layer/interface/flat-5/common.interface';
import { IsApiBroker } from '@module/transform-layer/validation/validator/is-api-broker';

export class BookLoadDto extends BaseSearchDto {
  @Validate(IsApiBroker)
  broker: ApiBrokers;

  @IsString()
  @IsNotEmpty()
  loadId: string;
}
