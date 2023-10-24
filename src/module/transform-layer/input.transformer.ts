import { ApiBrokers } from '@module/transform-layer/interface/flat-5/common.interface';
import { Injectable } from '@nestjs/common';
import { CoyoteInputTransformer } from '@module/transform-layer/coyote/coyote-input.transformer';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { CoyoteInput } from '@module/transform-layer/interface/coyote/coyote-input.interface';

export interface InputTransformerOptions {
  to: ApiBrokers;

  [key: string]: any;
}

@Injectable()
export class InputTransformer {
  constructor(private coyoteInputTransformer: CoyoteInputTransformer) {}

  // Function overloading
  // transformSearchAvailableLoad(
  //   value: SearchAvailableLoadDto,
  //   options: { to: 'coyote' }
  // ): CoyoteInput;
  transformSearchAvailableLoad(
    value: SearchAvailableLoadDto,
    options?: InputTransformerOptions
  ): SearchAvailableLoadDto | CoyoteInput {
    switch (options.to) {
      case 'coyote':
        return this.coyoteInputTransformer.searchAvailableLoads(value);
      default:
        return value;
    }
  }

  transformGetLoadDetail(value: string, options?: InputTransformerOptions) {
    switch (options.to) {
      case 'coyote':
        return this.coyoteInputTransformer.getLoadDetail(value);
      default:
        return value;
    }
  }

  transformBookLoad(value: any, options?: InputTransformerOptions) {
    switch (options.to) {
      case 'coyote':
        return this.coyoteInputTransformer.bookLoad(value as string);
      default:
        return value;
    }
  }
}
