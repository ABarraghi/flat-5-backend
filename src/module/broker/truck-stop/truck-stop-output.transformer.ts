import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Load } from '@module/broker/interface/flat-5/load.interface';
import {
  TruckStopDeliveryAddressInfo,
  TruckStopDeliveryAddressInfoResponse,
  TruckStopLoad
} from '@module/broker/interface/truck-stop/truck-stop-output.interface';
import { Loc } from '@core/util/loc';
import { MapboxService } from '@module/broker/service/mapbox.service';
import { PriceService } from '@module/broker/service/price.service';

@Injectable()
export class TruckStopOutputTransformer {
  constructor(
    private mapboxService: MapboxService,
    private priceService: PriceService
  ) {}

  async searchAvailableLoads(value: TruckStopLoad[]): Promise<Load[]> {
    const loads: Load[] = [];
    if (!value || !value.length) return loads;
    for (const load of value) {
      const loadModel = new Load();
      loadModel.broker = 'truckStop';
      loadModel.loadId = load.ID.toString();

      const input: TruckStopDeliveryAddressInfo = {
        originCity: load.OriginCity,
        originCountry: load.OriginState,
        originState: load.OriginCountry,
        destinationCity: load.DestinationCity,
        destinationCountry: load.DestinationState,
        destinationState: load.DestinationCountry
      };
      const deliveryInfo = await this.calculateInfo(input);

      loadModel.pickupStop = {
        address: deliveryInfo.originalPlaceName,
        coordinates: {
          latitude:
            deliveryInfo?.originalCoordinates?.length > 1
              ? deliveryInfo?.originalCoordinates[1]
              : 0,
          longitude:
            deliveryInfo?.originalCoordinates?.length > 1 ? deliveryInfo?.originalCoordinates[0] : 0
        }
      };
      loadModel.deliveryStop = {
        address: deliveryInfo.destinationPlaceName,
        coordinates: {
          latitude:
            deliveryInfo?.destinationCoordinates?.length > 1
              ? deliveryInfo?.destinationCoordinates[1]
              : 0,
          longitude:
            deliveryInfo?.destinationCoordinates?.length > 1
              ? deliveryInfo?.destinationCoordinates[0]
              : 0
        }
      };
      loadModel.metadata = {
        estimationDistance: deliveryInfo?.estimationDistance
          ? deliveryInfo?.estimationDistance.toFixed(2)
          : 0,
        estimationDurations: deliveryInfo?.estimationDurations
          ? deliveryInfo?.estimationDurations.toFixed(2)
          : 0,
        estimationAmount: deliveryInfo?.estimationAmount
          ? deliveryInfo?.estimationAmount.toFixed(2)
          : 0,
        email: load.TruckCompanyEmail || '',
        fax: load.TruckCompanyFax || '',
        phone: load.TruckCompanyPhone || '',
        name: load.TruckCompanyName || ''
      };
      loads.push(loadModel);
    }

    return loads;
  }

  async calculateInfo(
    input: TruckStopDeliveryAddressInfo
  ): Promise<TruckStopDeliveryAddressInfoResponse> {
    const origin = await this.mapboxService.searchAddress(
      input.originCity,
      input.originState,
      input.originCountry
    );
    const destination = await this.mapboxService.searchAddress(
      input.destinationCity,
      input.destinationState,
      input.destinationCountry
    );
    if (!origin?.center || !destination.center) {
      return null;
    }
    const waypoints = [
      {
        coordinates: origin.center
      },
      {
        coordinates: destination.center
      }
    ];

    const directionsRequest = {
      waypoints
    };

    // return {
    //   originalCoordinates: origin.center,
    //   originalPlaceName: origin.place_name,
    //   destinationCoordinates: destination.center,
    //   destinationPlaceName: destination.place_name,
    //   estimationDistance: 0,
    //   estimationDurations: 0,
    //   estimationAmount: 0
    // };

    let response;
    try {
      response = await this.mapboxService.directionsService.getDirections(directionsRequest).send();
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
    const route = response.body.routes[0];

    const distance = Loc.metersToMiles(route.distance); // (miles)
    const durations = route.duration / 60; // (minutes)
    // deadheadMiles is the distance from the origin to the pickup point (no load)
    // Todo: getDirection from origin to pickup point, then get distance
    const deadheadMiles = 0; // zero for now
    const amount = this.priceService.getAmount(distance, deadheadMiles);
    const result: TruckStopDeliveryAddressInfoResponse = {
      originalCoordinates: origin.center,
      originalPlaceName: origin.place_name,
      destinationCoordinates: destination.center,
      destinationPlaceName: destination.place_name,
      estimationDistance: distance,
      estimationDurations: durations,
      estimationAmount: amount
    };

    return result;
  }
}
