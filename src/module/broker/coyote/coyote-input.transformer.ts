import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { Injectable } from '@nestjs/common';
import { CoyoteEquipmentTypes, CoyoteInput } from '@module/broker/interface/coyote/coyote-input.interface';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { DISTANCE_UNIT_DEFAULT } from '@module/broker/interface/flat-5/load.interface';
import { BookLoadDto } from '@module/load/validation/book-load.dto';

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
        latitude: value.stopPoints[0].location.coordinates.latitude,
        longitude: value.stopPoints[0].location.coordinates.longitude
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
      };

      if (value.stopPoints[0].stopDate.to) {
        input.origin.appointment.appointmentEndDateTime = value.stopPoints[0].stopDate.to;
      }
    }
    if (value.stopPoints[1]) {
      if (value.stopPoints[1].isOpen) {
        // do nothing for now
      } else {
        input.destination = {
          location: {
            latitude: value.stopPoints[1].location.coordinates.latitude,
            longitude: value.stopPoints[1].location.coordinates.longitude
          },
          deadheadRadius: {
            value: Math.round(value.stopPoints[1].radius) ?? 100,
            unit: value.stopPoints[1].unit ?? DISTANCE_UNIT_DEFAULT
          }
        };

        if (value.stopPoints[1].stopDate) {
          input.destination.appointment = {
            appointmentStartDateTime: value.stopPoints[1].stopDate.from,
            appointmentEndDateTime: dayjs(value.stopPoints[1].stopDate.from).add(1, 'day').format()
          };

          if (value.stopPoints[1].stopDate.to) {
            input.destination.appointment.appointmentEndDateTime = value.stopPoints[1].stopDate.to;
          }
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

  bookLoad(bookLoadDto: BookLoadDto) {
    const result: any = {
      loadId: +bookLoadDto.loadId
    };

    if ('carrierId' in bookLoadDto) {
      result.carrierId = +bookLoadDto.carrierId;
    }

    return result;
  }

  getBookingDetail(bookingId: string): string {
    return bookingId;
  }

  getBookingStatus(bookingId: string): string {
    return bookingId;
  }
}
