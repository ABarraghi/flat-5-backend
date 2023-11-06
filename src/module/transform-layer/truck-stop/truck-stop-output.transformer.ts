import { Injectable } from '@nestjs/common';
import { LoadInterface } from '@module/transform-layer/interface/flat-5/load.interface';
import { TruckStopSearchLoadResponse } from '@module/transform-layer/interface/truck-stop/truck-stop-output.transformer';

@Injectable()
export class TruckStopOutputTransformer {
  searchAvailableLoads(value: TruckStopSearchLoadResponse): LoadInterface[] {
    const loads: LoadInterface[] = [];
    if (!value || !value.loads) return loads;
    if (value.loads.length) {
      value.loads.forEach(load => {
        const loadModel = new LoadInterface();
        loadModel.broker = 'truck_stop';
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
}
