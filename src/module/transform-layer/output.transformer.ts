import { ApiBrokers } from '@module/transform-layer/interface/flat-5/common.interface';
import {
  CoyoteLoad,
  CoyoteSearchLoadResponse
} from '@module/transform-layer/interface/coyote/coyote-response.interface';
import { Injectable } from '@nestjs/common';
import { CoyoteOutputTransformer } from '@module/transform-layer/coyote/coyote-output.transformer';
import { LoadInterface } from '@module/transform-layer/interface/flat-5/load.interface';
import { TruckStopOutputTransformer } from '@module/transform-layer/truck-stop/truck-stop-output.transformer';
import { TruckStopLoad } from '@module/transform-layer/interface/truck-stop/truck-stop-output.transformer';

export interface OutputTransformerOptions {
  from: ApiBrokers;
}

@Injectable()
export class OutputTransformer {
  constructor(
    private coyoteOutputTransformer: CoyoteOutputTransformer,
    private truckStopOutputTransformer: TruckStopOutputTransformer
  ) {}

  transformSearchAvailableLoads(value: any, options?: OutputTransformerOptions): LoadInterface[] {
    switch (options.from) {
      case 'coyote':
        return this.coyoteOutputTransformer.searchAvailableLoads(value as CoyoteSearchLoadResponse);
      case 'truck_stop':
        return this.truckStopOutputTransformer.searchAvailableLoads(value as TruckStopLoad[]);
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
