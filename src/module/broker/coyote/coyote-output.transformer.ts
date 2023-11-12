import { Injectable } from '@nestjs/common';
import { BookingLoad, Load } from '@module/broker/interface/flat-5/load.interface';
import {
  CoyoteAddress,
  CoyoteLoad,
  CoyoteSearchLoadResponse
} from '@module/broker/interface/coyote/coyote-response.interface';

@Injectable()
export class CoyoteOutputTransformer {
  searchAvailableLoads(value: CoyoteSearchLoadResponse): Load[] {
    const loads: Load[] = [];
    if (!value || !value.loads || !value.loads.length) return loads;
    value.loads.forEach(load => {
      const loadModel = new Load();
      loadModel.broker = 'coyote';
      loadModel.loadId = load.loadId.toString();
      const pickupStop = load.stops.find(stop => stop.stopType === 'Pickup');
      loadModel.pickupStop = {
        address: this.buildAddress(pickupStop.facility.address),
        state: pickupStop.facility.address.stateProvinceCode,
        postalCode: pickupStop.facility.address.postalCode,
        city: pickupStop.facility.address.cityName,
        line1: pickupStop.facility.address.line1,
        line2: pickupStop.facility.address.line2,
        coordinates: {
          latitude: pickupStop.facility.geoCoordinates.latitude,
          longitude: pickupStop.facility.geoCoordinates.longitude
        },
        appointment: {
          startTime: pickupStop.appointment.appointmentStartDateTimeUtc,
          endTime: pickupStop.appointment.appointmentEndDateTimeUtc
        }
      };
      const deliveryStop = load.stops.find(stop => stop.stopType === 'Delivery');
      loadModel.deliveryStop = {
        address: this.buildAddress(deliveryStop.facility.address),
        coordinates: {
          latitude: deliveryStop.facility.geoCoordinates.latitude,
          longitude: deliveryStop.facility.geoCoordinates.longitude
        },
        appointment: {
          startTime: deliveryStop.appointment.appointmentStartDateTimeUtc,
          endTime: deliveryStop.appointment.appointmentEndDateTimeUtc
        }
      };
      loadModel.amount = load.loadDetails.rate.value;
      loadModel.currency = load.loadDetails.rate.currencyType;
      loadModel.rate =
        load.loadDetails.loadDistance.value && load.loadDetails.rate.value
          ? load.loadDetails.rate.value / load.loadDetails.loadDistance.value
          : -1;
      loadModel.distance = load.loadDetails.loadDistance.value;
      loadModel.distanceUnit = load.loadDetails.loadDistance.unit;
      // Todo: need to re-calculate duration by business logic
      loadModel.duration = load.loadDetails.loadDistance.value / 60;
      loadModel.durationUnit = 'minutes';
      loadModel.rawLoad = load;

      loads.push(loadModel);
    });

    return loads;
  }

  getLoadDetail(value: CoyoteLoad): Load {
    const output = new Load();
    output.broker = 'coyote';
    output.loadId = value.loadId.toString();
    const pickupStop = value.stops.find(stop => stop.stopType === 'Pickup');
    output.pickupStop = {
      address: this.buildAddress(pickupStop.facility.address),
      coordinates: {
        latitude: pickupStop.facility.geoCoordinates.latitude,
        longitude: pickupStop.facility.geoCoordinates.longitude
      },
      appointment: {
        startTime: pickupStop.appointment.appointmentStartDateTimeUtc,
        endTime: pickupStop.appointment.appointmentEndDateTimeUtc
      }
    };
    const deliveryStop = value.stops.find(stop => stop.stopType === 'Delivery');
    output.deliveryStop = {
      address: this.buildAddress(deliveryStop.facility.address),
      coordinates: {
        latitude: deliveryStop.facility.geoCoordinates.latitude,
        longitude: deliveryStop.facility.geoCoordinates.longitude
      },
      appointment: {
        startTime: deliveryStop.appointment.appointmentStartDateTimeUtc,
        endTime: deliveryStop.appointment.appointmentEndDateTimeUtc
      }
    };

    return output;
  }

  bookLoad(value: any): any {
    return new BookingLoad({ bookingId: value });
  }

  buildAddress(address: CoyoteAddress): string {
    return (
      address.line1 +
      ' ' +
      address.line2 +
      address.cityName +
      ', ' +
      address.stateProvinceCode +
      ' ' +
      address.postalCode
    )
      .replace(/ {2}/g, ' ')
      .trim();
  }
}
