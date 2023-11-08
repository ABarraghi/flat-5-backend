import { Injectable } from '@nestjs/common';
import { LoadInterface } from '@module/transform-layer/interface/flat-5/load.interface';
import { TruckStopLoad } from '@module/transform-layer/interface/truck-stop/truck-stop-output.transformer';

@Injectable()
export class TruckStopOutputTransformer {
  searchAvailableLoads(value: TruckStopLoad[]): LoadInterface[] {
    const loads: LoadInterface[] = [];
    if (!value || value.length == 0) return loads;
    for (const load of value) {
      const loadModel = new LoadInterface();
      loadModel.broker = 'truck_stop';
      loadModel.loadId = load.ID.toString();
      loadModel.pickupStop = {
        address: load.originalPlaceName,
        coordinates: {
          latitude: load?.originalCoordinates?.length > 1 ? load?.originalCoordinates[1] : 0,
          longitude: load?.originalCoordinates?.length > 1 ? load?.originalCoordinates[0] : 0
        }
      };
      loadModel.deliveryStop = {
        address: load.destinationPlaceName,
        coordinates: {
          latitude: load?.destinationCoordinates?.length > 1 ? load?.destinationCoordinates[1] : 0,
          longitude: load?.destinationCoordinates?.length > 1 ? load?.destinationCoordinates[0] : 0
        }
      };
      loadModel.metadata = {
        estimationDistance: load?.estimationDistance,
        estimationDurations: load?.estimationDurations,
        estimationAmount: load?.estimationAmount
      };
      loads.push(loadModel);
    }

    return loads;
  }
}
