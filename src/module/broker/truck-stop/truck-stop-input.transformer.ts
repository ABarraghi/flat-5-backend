import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { Injectable } from '@nestjs/common';
import {
  TruckStopEquipmentTypes,
  TruckStopInput
} from '@module/broker/interface/truck-stop/truckt-stop-input.interface';
import * as dayjs from 'dayjs';

@Injectable()
export class TruckStopInputTransformer {
  EQUIPMENT_TYPES = {
    dry_van: 'V',
    reefer: 'R',
    flatbed: 'F',
    dry_van_or_reefer: 'VR',
    flat_or_van: 'FV'
  };

  getDateInRange(from: string, to: string): string[] {
    const dateRange = [];
    const fromDate = dayjs(from);
    const toDate = dayjs(to);
    const diff = toDate.diff(fromDate, 'day');
    for (let i = 0; i < diff; i++) {
      dateRange.push(fromDate.add(i, 'day').format());
    }

    return dateRange;
  }

  searchAvailableLoads(value: SearchAvailableLoadDto): TruckStopInput {
    const input = new TruckStopInput();
    let originLatitude = 0;
    let originLongitude = 0;
    if (value.stopPoints[0].location.coordinates.latitude) {
      originLatitude = Math.floor(value.stopPoints[0].location.coordinates.latitude * 100);
    }
    if (value.stopPoints[0].location.coordinates.longitude) {
      originLongitude = Math.floor(value.stopPoints[0].location.coordinates.longitude * 100);
    }
    let originRadius = value.stopPoints[0].radius || 25;
    if (value.stopPoints[0].radius && value.stopPoints[0].radius < 25) {
      originRadius = 25;
    } else if (value.stopPoints[0].radius && value.stopPoints[0].radius > 300) {
      originRadius = 300;
    }

    input.origin = {
      city: value.stopPoints[0].location.city || '',
      state: value.stopPoints[0].location.state || '',
      country: value.stopPoints[0].location.country || '',
      range: originRadius,
      latitude: originLatitude,
      longitude: originLongitude
    };
    if (value.stopPoints[1]) {
      let destinationLatitude = 0;
      let destinationLongitude = 0;
      if (value.stopPoints[1].location?.coordinates?.latitude) {
        destinationLatitude = Math.floor(value.stopPoints[1].location.coordinates.latitude * 100);
      }
      if (value.stopPoints[1].location?.coordinates?.longitude) {
        destinationLongitude = Math.floor(value.stopPoints[1].location.coordinates.longitude * 100);
      }
      let destinationRadius = value.stopPoints[1].radius || 25;
      if (value.stopPoints[1].radius && value.stopPoints[1].radius < 25) {
        destinationRadius = 25;
      } else if (value.stopPoints[1].radius && value.stopPoints[1].radius > 300) {
        destinationRadius = 300;
      }

      input.destination = {
        city: value.stopPoints[1].location.city || '',
        state: value.stopPoints[1].location.state || '',
        country: value.stopPoints[1].location.country || '',
        range: destinationRadius,
        latitude: destinationLatitude,
        longitude: destinationLongitude
      };
    }

    const pickupDates = [];
    if (value.stopPoints[0].stopDate) {
      const fromDate = value.stopPoints[0].stopDate.from;
      let toDate = dayjs(value.stopPoints[0].stopDate.from).add(1, 'day').format();
      if (value.stopPoints[0].stopDate.to) {
        toDate = value.stopPoints[0].stopDate.to;
      }
      pickupDates.push(fromDate);
      const getDateInRange = this.getDateInRange(fromDate, toDate);
      pickupDates.push(...getDateInRange);
      pickupDates.push(toDate);
    }
    input.equipmentType = (this.EQUIPMENT_TYPES[value.equipmentType] as TruckStopEquipmentTypes) ?? 'VR';
    input.loadType = 'Full';
    if (pickupDates.length > 0) {
      input.pickupDates = pickupDates;
    }

    // const date = new Date();
    // input.pickupDate = ;

    // Mock Data
    // input = {
    //   origin: {
    //     // city: 'Boise',
    //     country: 'US',
    //     range: 2000,
    //     state: 'IL'
    //   },
    //   destination: {
    //     // city: 'WACO',
    //     country: 'US',
    //     range: 2000,
    //     state: 'PA'
    //   },
    //   equipmentType: 'VR',
    //   loadType: 'All',
    //   pickupDate: '2023-11-06' // YYYY-MM-DD
    // } as TruckStopInput;

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
