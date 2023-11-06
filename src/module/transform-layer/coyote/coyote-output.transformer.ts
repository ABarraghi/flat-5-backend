import { Injectable } from '@nestjs/common';
import {
  BookingLoad,
  LoadInterface
} from '@module/transform-layer/interface/flat-5/load.interface';
import {
  CoyoteLoad,
  CoyoteSearchLoadResponse
} from '@module/transform-layer/interface/coyote/coyote-response.interface';

@Injectable()
export class CoyoteOutputTransformer {
  searchAvailableLoads(value: CoyoteSearchLoadResponse): LoadInterface[] {
    const loads: LoadInterface[] = [];
    if (!value || !value.loads) return loads;
    if (value.loads.length) {
      value.loads.forEach(load => {
        const loadModel = new LoadInterface();
        loadModel.broker = 'coyote';
        loadModel.loadId = load.loadId.toString();
        const pickupStop = load.stops.find(stop => stop.stopType === 'Pickup');
        loadModel.pickupStop = {
          address: pickupStop.facility.address,
          coordinates: {
            latitude: pickupStop.facility.geoCoordinates.latitude,
            longitude: pickupStop.facility.geoCoordinates.longitude
          },
          appointment: {
            appointmentStartDateTimeUtc: pickupStop.appointment.appointmentStartDateTimeUtc,
            appointmentEndDateTimeUtc: pickupStop.appointment.appointmentEndDateTimeUtc
          }
        };
        const deliveryStop = load.stops.find(stop => stop.stopType === 'Delivery');
        loadModel.deliveryStop = {
          address: deliveryStop.facility.address,
          coordinates: {
            latitude: deliveryStop.facility.geoCoordinates.latitude,
            longitude: deliveryStop.facility.geoCoordinates.longitude
          },
          appointment: {
            appointmentStartDateTimeUtc: deliveryStop.appointment.appointmentStartDateTimeUtc,
            appointmentEndDateTimeUtc: deliveryStop.appointment.appointmentEndDateTimeUtc
          }
        };

        loads.push(loadModel);
      });
    }

    return loads;
  }

  getLoadDetail(value: CoyoteLoad): LoadInterface {
    const output = new LoadInterface();
    output.broker = 'coyote';
    output.loadId = value.loadId.toString();
    const pickupStop = value.stops.find(stop => stop.stopType === 'Pickup');
    output.pickupStop = {
      address: pickupStop.facility.address,
      coordinates: {
        latitude: pickupStop.facility.geoCoordinates.latitude,
        longitude: pickupStop.facility.geoCoordinates.longitude
      },
      appointment: {
        appointmentStartDateTimeUtc: pickupStop.appointment.appointmentStartDateTimeUtc,
        appointmentEndDateTimeUtc: pickupStop.appointment.appointmentEndDateTimeUtc
      }
    };
    const deliveryStop = value.stops.find(stop => stop.stopType === 'Delivery');
    output.deliveryStop = {
      address: deliveryStop.facility.address,
      coordinates: {
        latitude: deliveryStop.facility.geoCoordinates.latitude,
        longitude: deliveryStop.facility.geoCoordinates.longitude
      },
      appointment: {
        appointmentStartDateTimeUtc: deliveryStop.appointment.appointmentStartDateTimeUtc,
        appointmentEndDateTimeUtc: deliveryStop.appointment.appointmentEndDateTimeUtc
      }
    };

    return output;
  }

  bookLoad(value: any): any {
    return new BookingLoad({ bookingId: value });
  }
}
