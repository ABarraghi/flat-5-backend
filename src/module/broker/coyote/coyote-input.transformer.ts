import { CoyoteEquipmentTypes, CoyoteInput } from '@module/broker/interface/coyote/coyote-input.interface';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { DISTANCE_UNIT_DEFAULT } from '@module/broker/interface/flat-5/load.interface';

dayjs.extend(utc);

@Injectable()
export class CoyoteInputTransformer {
  EQUIPMENT_TYPES = {
    dry_van: 'V',
    reefer: 'R',
    flatbed: 'F',
    dry_van_or_reefer: 'VR',
    flat_or_van: 'V'
  };

  searchAvailableLoads(value: SearchAvailableLoadDto): CoyoteInput {
    const input = new CoyoteInput();
    input.origin = {
      location: {
        latitude: value.stopPoints[0].location.coordinate.latitude,
        longitude: value.stopPoints[0].location.coordinate.longitude
      },
      deadheadRadius: {
        value: Math.round(value.stopPoints[0].radius) ?? 100,
        unit: value.stopPoints[0].unit ?? DISTANCE_UNIT_DEFAULT
      }
    };
    if (value.stopPoints[0].stopDate) {
      input.origin.appointment = {
        appointmentStartDateTime: value.stopPoints[0].stopDate.from,
        appointmentEndDateTime: dayjs(value.stopPoints[0].stopDate.from).add(1, 'day').format()
        // appointmentStartDateTime: '2023-11-14T14:00:00-05:00',
        // appointmentEndDateTime: '2023-11-14T12:00:00-05:00'
      };

      if (value.stopPoints[0].stopDate.to) {
        input.origin.appointment.appointmentEndDateTime = value.stopPoints[0].stopDate.to;
      }
    }
    if (value.stopPoints[1]) {
      input.destination = {
        location: {
          latitude: value.stopPoints[1].location.coordinate.latitude,
          longitude: value.stopPoints[1].location.coordinate.longitude
        },
        deadheadRadius: {
          value: Math.round(value.stopPoints[1].radius) ?? 100,
          unit: value.stopPoints[1].unit ?? DISTANCE_UNIT_DEFAULT
        }
      };

      if (value.stopPoints[1].stopDate) {
        input.origin.appointment = {
          appointmentStartDateTime: value.stopPoints[1].stopDate.from,
          appointmentEndDateTime: dayjs(value.stopPoints[1].stopDate.from).add(1, 'day').format()
        };

        if (value.stopPoints[1].stopDate.to) {
          input.origin.appointment.appointmentEndDateTime = value.stopPoints[1].stopDate.to;
        }
      }
    }
    // V/R/F/VR
    input.equipmentType = this.EQUIPMENT_TYPES[value.equipmentType] as CoyoteEquipmentTypes;
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
