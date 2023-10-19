import { ApiBrokers } from '@module/transform-layer/interface/flat-5/common.interface';
import { CoyoteLoad } from '@module/transform-layer/interface/coyote/coyote-response.interface';
import { LoadInterface } from '@module/transform-layer/interface/flat-5/load.interface';

export interface OutputTransformerOptions {
  from: ApiBrokers;
}

export class OutputTransformer {
  static transform(value: any, options?: OutputTransformerOptions) {
    switch (options.from) {
      case 'coyote':
        return OutputTransformer.transformFromCoyote(value as CoyoteLoad);
      default:
        return value;
    }
  }

  static transformFromCoyote(value: CoyoteLoad): LoadInterface {
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
}
