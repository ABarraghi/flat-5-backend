import { Injectable } from '@nestjs/common';
import { Load } from '@module/broker/interface/flat-5/load.interface';
import { DATRetrieveAssetsResponse } from '@module/broker/interface/dat/dat-response.interface';

@Injectable()
export class DatOutputTransformer {
  searchAvailableLoads(value: DATRetrieveAssetsResponse): Load[] {
    const loads: Load[] = [];
    if (!value || !value.matches || !value.matches.length) return loads;
    value.matches.forEach(match => {
      const loadModel = new Load();
      loadModel.broker = 'dat';
      loadModel.loadId = match.matchId;
      const pickupStop = match.matchingAssetInfo.origin;
      loadModel.pickupStop = {
        city: pickupStop.city,
        state: pickupStop.stateProv,
        country: pickupStop.county,
        postalCode: pickupStop.postalCode,
        coordinates: {
          latitude: pickupStop.latitude,
          longitude: pickupStop.longitude
        },
        appointment: {
          startTime: match.availability.earliestWhen,
          endTime: match.availability.latestWhen
        }
      };
      const deliveryStop = match.matchingAssetInfo.destination;
      console.log(deliveryStop);
      if (deliveryStop && deliveryStop.place) {
        loadModel.deliveryStop = {
          city: deliveryStop.place.city,
          state: deliveryStop.place.stateProv, // maybe multiple states with deliveryStop.area
          country: deliveryStop.place.county,
          postalCode: deliveryStop.place.postalCode,
          coordinates: {
            latitude: deliveryStop.place.latitude,
            longitude: deliveryStop.place.longitude
          }
        };
      }
      loadModel.rawLoad = match;

      loads.push(loadModel);
    });

    return loads;
  }
}
