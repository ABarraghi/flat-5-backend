import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Load } from '@module/broker/interface/flat-5/load.interface';
import {
  TruckStopDeliveryAddressInfo,
  TruckStopDeliveryAddressInfoResponse,
  TruckStopLoad
} from '@module/broker/interface/truck-stop/truckstop-response.interface';
import { Loc } from '@core/util/loc';
import { MapboxService } from '@module/broker/service/mapbox.service';
import { PriceService } from '@module/broker/service/price.service';
import { Logging } from '@core/logger/logging.service';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class TruckStopOutputTransformer {
  constructor(
    private mapboxService: MapboxService,
    private priceService: PriceService
  ) {}

  async searchAvailableLoads(value: TruckStopLoad[], searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[]> {
    const loads: Load[] = [];
    if (!value || !value.length) return loads;
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    const deliveryPromises = value.map(load => {
      const input: TruckStopDeliveryAddressInfo = {
        originCity: load.OriginCity,
        originCountry: load.OriginState,
        originState: load.OriginCountry,
        destinationCity: load.DestinationCity,
        destinationCountry: load.DestinationState,
        destinationState: load.DestinationCountry
      };

      return this.calculateInfo(input);
    });

    const deliveryInfos = await Promise.all(deliveryPromises);

    for (const load of value) {
      const loadModel = new Load();
      loadModel.broker = 'truck_stop';
      loadModel.loadId = load.ID.toString();
      loadModel.originDeadhead = -1;
      loadModel.destinationDeadhead = -1;

      // const input: TruckStopDeliveryAddressInfo = {
      //   originCity: load.OriginCity,
      //   originCountry: load.OriginState,
      //   originState: load.OriginCountry,
      //   destinationCity: load.DestinationCity,
      //   destinationCountry: load.DestinationState,
      //   destinationState: load.DestinationCountry
      // };
      // const deliveryInfo = await this.calculateInfo(input);
      const deliveryInfo = deliveryInfos.shift();
      if (!deliveryInfo) continue;

      load.PickupDate = load.PickupDate ? load.PickupDate.trim() : '';
      load.PickupTime = load.PickupTime ? load.PickupTime.trim() : '';

      loadModel.pickupStop = {
        address: deliveryInfo.originalPlaceName,
        city: load.OriginCity,
        state: load.OriginState,
        county: load.OriginCountry,
        coordinates: {
          latitude: deliveryInfo?.originalCoordinates?.length > 1 ? deliveryInfo?.originalCoordinates[1] : 0,
          longitude: deliveryInfo?.originalCoordinates?.length > 1 ? deliveryInfo?.originalCoordinates[0] : 0
        },
        appointment: {
          startTime: load.PickupDate === 'DAILY' ? load.PickupDate : `${load.PickupDate} ${load.PickupTime}`
        }
      };

      loadModel.deliveryStop = {
        address: deliveryInfo.destinationPlaceName,
        city: load.DestinationCity,
        state: load.DestinationState,
        county: load.DestinationCountry,
        coordinates: {
          latitude: deliveryInfo?.destinationCoordinates?.length > 1 ? deliveryInfo?.destinationCoordinates[1] : 0,
          longitude: deliveryInfo?.destinationCoordinates?.length > 1 ? deliveryInfo?.destinationCoordinates[0] : 0
        }
      };

      loadModel.originDeadhead = Loc.distanceInMiles(
        searchAvailableLoadDto.stopPoints[0].location.coordinates,
        loadModel.pickupStop.coordinates
      );
      loadModel.destinationDeadhead = Loc.distanceInMiles(
        loadModel.deliveryStop.coordinates,
        searchAvailableLoadDto.stopPoints[1].location.coordinates
      );
      let deliveryDate = '';

      load.DeliveryDate = load.DeliveryDate ? load.DeliveryDate.trim() : '';
      load.DeliveryTime = load.DeliveryTime ? load.DeliveryTime.trim() : '';

      if (load.DeliveryDate && load.DeliveryTime) {
        // need convert to ISO
        deliveryDate = `${load.DeliveryDate} ${load.DeliveryTime}`;
      }
      if (deliveryDate) {
        if (searchAvailableLoadDto.stopPoints[1].stopDate) {
          let toDate = dayjs(searchAvailableLoadDto.stopPoints[1].stopDate.from).add(1, 'day').format();
          if (searchAvailableLoadDto.stopPoints[1].stopDate.to) {
            toDate = searchAvailableLoadDto.stopPoints[1].stopDate.to;
          }
          if (dayjs(deliveryDate).isAfter(dayjs(toDate))) continue;
          loadModel.deliveryStop.appointment = {
            startTime: deliveryDate
          };
        }
      }
      loadModel.driveDistance = deliveryInfo?.estimationDistance ? +deliveryInfo?.estimationDistance.toFixed(2) : 0;
      loadModel.flyDistance = Loc.distanceInMiles(loadModel.pickupStop.coordinates, loadModel.deliveryStop.coordinates);
      loadModel.distance = loadModel.driveDistance ?? loadModel.flyDistance;
      loadModel.distanceUnit = 'Miles';
      loadModel.duration = deliveryInfo?.estimationDurations ? +deliveryInfo?.estimationDurations.toFixed(2) : 0;
      loadModel.amount = deliveryInfo?.estimationAmount ? +deliveryInfo?.estimationAmount.toFixed(2) : 0;
      loadModel.deadHeadRate = this.priceService.deadHeadRate;
      loadModel.rate = this.priceService.loadedKilometerRate;
      loadModel.shipperInfo = {
        email: load.TruckCompanyEmail,
        fax: load.TruckCompanyFax,
        phone: load.TruckCompanyPhone,
        name: load.TruckCompanyName
      };
      loadModel.equipmentType = load.EquipmentTypes.Description;
      loadModel.weight = load.Weight ? parseFloat(load.Weight) : 0;
      loadModel.width = load.Width ? parseFloat(load.Width) : 0;
      loadModel.length = load.Length ? parseFloat(load.Length) : 0;
      loadModel.rawLoad = load;

      loads.push(loadModel);
    }

    return loads;
  }

  async calculateInfo(input: TruckStopDeliveryAddressInfo): Promise<TruckStopDeliveryAddressInfoResponse> {
    try {
      const origin = await this.mapboxService.searchAddress(input.originCity, input.originState, input.originCountry);
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

      const response = await this.mapboxService.directionsService.getDirections(directionsRequest).send();
      const route = response.body.routes[0];

      const distance = Loc.metersToMiles(route.distance); // (miles)
      const durations = route.duration / 60; // (minutes)
      // deadheadMiles is the distance from the origin to the pickup point (no load)
      // Todo: getDirection from origin to pickup point, then get distance
      const deadheadMiles = 0;
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
    } catch (err) {
      Logging.error(`[TruckStop] Search Multiple Details Available Loads got error`, err.response?.data ?? err);
      throw new InternalServerErrorException(err);
    }
  }
}
