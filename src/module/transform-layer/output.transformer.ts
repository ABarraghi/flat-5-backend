import { ApiBrokers } from '@module/transform-layer/interface/flat-5/common.interface';
import {
  CoyoteLoad,
  CoyoteSearchLoadResponse
} from '@module/transform-layer/interface/coyote/coyote-response.interface';
import { Injectable } from '@nestjs/common';
import { CoyoteOutputTransformer } from '@module/transform-layer/coyote/coyote-output.transformer';
import { LoadInterface } from '@module/transform-layer/interface/flat-5/load.interface';

export interface OutputTransformerOptions {
  from: ApiBrokers;
}

@Injectable()
export class OutputTransformer {
  constructor(private coyoteOutputTransformer: CoyoteOutputTransformer) {}

  transformSearchAvailableLoads(value: any, options?: OutputTransformerOptions): LoadInterface[] {
    switch (options.from) {
      case 'coyote':
        return this.coyoteOutputTransformer.searchAvailableLoads(value as CoyoteSearchLoadResponse);
      default:
        return value;
    }
  }

  transformGetLoadDetail(value: any, options?: OutputTransformerOptions): LoadInterface {
    switch (options.from) {
      case 'coyote':
        return this.coyoteOutputTransformer.getLoadDetail(value as CoyoteLoad);
      default:
        return value;
    }
  }

  transformBookLoad(value: any, options?: OutputTransformerOptions): any {
    switch (options.from) {
      case 'coyote':
        return this.coyoteOutputTransformer.bookLoad(value);
      default:
        return value;
    }
  }
}
