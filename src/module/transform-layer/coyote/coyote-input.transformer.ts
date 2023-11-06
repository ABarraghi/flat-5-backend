import {
  CoyoteEquipmentTypes,
  CoyoteInput
} from '@module/transform-layer/interface/coyote/coyote-input.interface';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';

@Injectable()
export class CoyoteInputTransformer {
  searchAvailableLoads(value: SearchAvailableLoadDto): CoyoteInput {
    const input = new CoyoteInput();
    input.origin = {
      location: {
        latitude: value.stopPoints[0].location.latitude,
        longitude: value.stopPoints[0].location.longitude
      },
      deadheadRadius: {
        value: Math.round(value.stopPoints[0].radius) ?? 100,
        unit: value.stopPoints[0].unit ?? 'Kilometers'
      }
    };
    if (value.stopPoints[0].stopDate) {
      input.origin.appointment = {
        appointmentStartDateTime: dayjs(value.stopPoints[0].stopDate.from).startOf('day').format(),
        appointmentEndDateTime: dayjs(value.stopPoints[0].stopDate.from).endOf('day').format()
      };

      if (value.stopPoints[0].stopDate.to) {
        input.origin.appointment.appointmentEndDateTime = dayjs(value.stopPoints[0].stopDate.to)
          .endOf('day')
          .format();
      }
    }
    if (value.stopPoints[1]) {
      input.destination = {
        location: {
          latitude: value.stopPoints[1].location.latitude,
          longitude: value.stopPoints[1].location.longitude
        },
        deadheadRadius: {
          value: Math.round(value.stopPoints[1].radius) ?? 100,
          unit: value.stopPoints[1].unit ?? 'Kilometers'
        }
      };
    }
    if (value.stopPoints[1].stopDate) {
      input.origin.appointment = {
        appointmentStartDateTime: dayjs(value.stopPoints[1].stopDate.from).startOf('day').format(),
        appointmentEndDateTime: dayjs(value.stopPoints[1].stopDate.from).endOf('day').format()
      };

      if (value.stopPoints[1].stopDate.to) {
        input.origin.appointment.appointmentEndDateTime = dayjs(value.stopPoints[1].stopDate.to)
          .endOf('day')
          .format();
      }
    }
    // Todo: need to validate later
    input.equipmentType = (value.equipmentType as CoyoteEquipmentTypes) ?? 'V';
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
