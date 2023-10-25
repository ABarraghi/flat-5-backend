import { CoyoteInput } from '@module/transform-layer/interface/coyote/coyote-input.interface';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoyoteInputTransformer {
  searchAvailableLoads(value: SearchAvailableLoadDto): CoyoteInput {
    const input = new CoyoteInput();
    input.origin = {
      location: {
        latitude: value.from.latitude,
        longitude: value.from.longitude
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
    if (value.to) {
      input.destination = {
        location: {
          latitude: value.to.latitude,
          longitude: value.to.longitude
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
    }
    input.equipmentType = 'V';
    input.mode = 'TL_LTL';

    return input;
  }

  getLoadDetail(loadId: string): number {
    return +loadId;
  }

  bookLoad(loadId: string) {
    return {
      loadId: +loadId,
      carrierId: 194536367
    };
  }
}
