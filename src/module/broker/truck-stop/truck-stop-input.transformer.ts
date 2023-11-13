import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { Injectable } from '@nestjs/common';
import {
  TruckStopEquipmentTypes,
  TruckStopInput
} from '@module/broker/interface/truck-stop/truckt-stop-input.interface';
import * as dayjs from 'dayjs';

@Injectable()
export class TruckStopInputTransformer {
  searchAvailableLoads(value: SearchAvailableLoadDto): TruckStopInput {
    const input = new TruckStopInput();
    let originLatitude = 0;
    let originLongitude = 0;
    if (value.stopPoints[0].location.coordinate.latitude) {
      originLatitude = Math.floor(value.stopPoints[0].location.coordinate.latitude * 100);
    }
    if (value.stopPoints[0].location.coordinate.longitude) {
      originLongitude = Math.floor(value.stopPoints[0].location.coordinate.longitude * 100);
    }
    input.origin = {
      city: value.stopPoints[0].location.city || '',
      state: value.stopPoints[0].location.state || '',
      country: value.stopPoints[0].location.country || '',
      range: value.stopPoints[0].radius || 25,
      latitude: originLatitude,
      longitude: originLongitude
    };
    if (value.stopPoints[1]) {
      let destinationLatitude = 0;
      let destinationLongitude = 0;
      if (value.stopPoints[1].location?.coordinate?.latitude) {
        destinationLatitude = Math.floor(value.stopPoints[1].location.coordinate.latitude * 100);
      }
      if (value.stopPoints[1].location?.coordinate?.longitude) {
        destinationLongitude = Math.floor(value.stopPoints[1].location.coordinate.longitude * 100);
      }
      input.destination = {
        city: value.stopPoints[1].location.city || '',
        state: value.stopPoints[1].location.state || '',
        country: value.stopPoints[1].location.country || '',
        range: value.stopPoints[1].radius || 25,
        latitude: destinationLatitude,
        longitude: destinationLongitude
      };
    }

    const pickupDates = [];
    if (value.stopPoints[0].stopDate) {
      const fromDate = dayjs(value.stopPoints[0].stopDate.from).startOf('day').format();
      let toDate = dayjs(value.stopPoints[0].stopDate.from).endOf('day').format(); // cause to-date is optional
      if (value.stopPoints[0].stopDate.to) {
        toDate = dayjs(value.stopPoints[0].stopDate.to).endOf('day').format();
      }
      pickupDates.push(fromDate);
      pickupDates.push(toDate);
    }
    if (value.stopPoints[1].stopDate) {
      const fromDate = dayjs(value.stopPoints[1].stopDate.from).startOf('day').format();
      let toDate = dayjs(value.stopPoints[1].stopDate.from).endOf('day').format(); // cause to-date is optional
      if (value.stopPoints[1].stopDate.to) {
        toDate = dayjs(value.stopPoints[1].stopDate.to).endOf('day').format();
      }
      pickupDates.push(fromDate);
      pickupDates.push(toDate);
    }
    input.equipmentType = (value.equipmentType as TruckStopEquipmentTypes) ?? 'VR';
    input.equipmentType = 'VR';
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
