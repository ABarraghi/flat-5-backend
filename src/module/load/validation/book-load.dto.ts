import { IsNotEmpty, IsString, Validate, IsMongoId, IsObject } from 'class-validator';
import { BaseSearchDto } from '@core/util/validation/base-search-dto';
import { ApiBrokers } from '@module/broker/interface/flat-5/common.interface';
import { IsApiBroker } from '@module/broker/validation/validator/is-api-broker';

export class BookLoadDto extends BaseSearchDto {
  @Validate(IsApiBroker)
  broker: ApiBrokers;

  @IsString()
  @IsNotEmpty()
  loadId: string;

  @IsString()
  carrierId: string;

  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @IsObject()
  loadData: any;
}
