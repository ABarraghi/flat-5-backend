import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { Injectable } from '@nestjs/common';
import { TruckStopInput } from '@module/transform-layer/interface/truck-stop/truckt-stop-input.interface';

@Injectable()
export class TruckStopInputTransformer {
  searchAvailableLoads(value: SearchAvailableLoadDto): TruckStopInput {
    const input = new TruckStopInput();
    input.origin = {
      city: value.from.city,
      country: value.from.country,
      range: value.from.range,
      state: value.from.state,
      latitude: value.from.latitude || 0,
      longitude: value.from.longitude || 0
    };
    input.destination = {
      city: value.to.city,
      country: value.to.country,
      range: value.to.range,
      state: value.to.state,
      latitude: value.to.latitude || 0,
      longitude: value.to.longitude || 0
    };
    input.equipmentType = 'VR';
    input.loadType = 'All';
    if (value.pickupDate) {
      input.pickupDate = value.pickupDate;
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
