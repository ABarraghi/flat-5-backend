import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { CoyoteInput } from '@module/transform-layer/interface/coyote/coyote-input.interface';
import { ApiBrokers } from '@module/transform-layer/interface/flat-5/common.interface';

export interface InputTransformerOptions {
  to: ApiBrokers;
}

export class InputTransformer {
  static transform(value: SearchAvailableLoadDto, options?: InputTransformerOptions) {
    switch (options.to) {
      case 'coyote':
        return InputTransformer.transformToCoyote(value);
      default:
        return value;
    }
  }

  static transformToCoyote(value: SearchAvailableLoadDto): CoyoteInput {
    const input = new CoyoteInput();
    input.origin = {
      location: {
        latitude: value.from.lat,
        longitude: value.from.lng
      }
      // deadheadRadius: {
      //   value: 120,
      //   unit: 'Miles'
      // },
      // appointment: {
      //   appointmentStartDateTime: '2023-10-16T14:00:00-05:00',
      //   appointmentEndDateTime: '2023-10-17T12:00:00-05:00'
      // }
    };
    input.destination = {
      location: {
        latitude: value.to.lat,
        longitude: value.to.lng
      }
      // deadheadRadius: {
      //   value: 120,
      //   unit: 'Miles'
      // },
      // appointment: {
      //   appointmentStartDateTime: '2023-10-16T14:00:00-05:00',
      //   appointmentEndDateTime: '2023-10-17T12:00:00-05:00'
      // }
    };
    input.equipmentType = 'V';
    input.mode = 'TL_LTL';

    return input;
  }
}
