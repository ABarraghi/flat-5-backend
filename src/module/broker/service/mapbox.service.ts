import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  Feature,
  FeatureCollection
} from '@module/transform-layer/interface/mapbox/mapbox-interface';
import { map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import {
  TruckStopLDeliveryAddressInfo,
  TruckStopLDeliveryAddressInfoResponse
} from '@module/transform-layer/interface/truck-stop/truck-stop-output.transformer';
import * as mapboxSdk from '@mapbox/mapbox-sdk';
import * as MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import { Convert } from '@core/util/convert';
@Injectable()
export class MapboxService {
  private mapboxConfig: { url: string; key: string };
  private readonly mapboxClient: any;
  private directionsService: any;
  private directionsClient: any;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.mapboxConfig = this.configService.get('app.mapbox');
    this.mapboxClient = mapboxSdk({ accessToken: this.mapboxConfig.key });
    this.directionsService = MapboxDirections(this.mapboxClient);
    this.directionsClient = new MapboxDirections({
      accessToken: this.mapboxConfig.key,
      profile: 'mapbox/driving'
    });
  }

  async searchAddress(
    city: string = '',
    state: string = '',
    country: string = ''
  ): Promise<Feature> {
    const searchKey = `${city} ${state} ${country}`;
    const response = await this.httpService
      .get(
        `${this.mapboxConfig.url}/${encodeURIComponent(searchKey)}.json?access_token=${
          this.mapboxConfig.key
        }`
      )
      .pipe(map((axiosResponse: AxiosResponse) => axiosResponse.data as FeatureCollection))
      .toPromise();

    const data = (await response) as FeatureCollection;
    let result;
    if (data?.features?.length > 0) {
      const features = data?.features.filter(
        f =>
          f.place_type.includes('country') ||
          f.place_type.includes('city') ||
          f.place_type.includes('place')
      );
      if (features?.length > 0) {
        result = features[0];
      } else {
        result = data.features[0];
      }
    }

    return result as Feature;
  }

  async transformInfoTruckStop(
    input: TruckStopLDeliveryAddressInfo
  ): Promise<TruckStopLDeliveryAddressInfoResponse> {
    const origin = await this.searchAddress(
      input.originCity,
      input.originState,
      input.originCountry
    );
    const destination = await this.searchAddress(
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
    const loadedMileRate = 2.5;
    const deadheadMileRate = 0.75;
    const response = await this.directionsService.getDirections(directionsRequest).send();
    const route = response.body.routes[0];

    const distance = Convert.metersToMiles(route.distance); // (miles)
    const durations = route.duration / 60; // (minutes)
    const deadheadMiles = distance; // Need to confirm what is deadheadMiles, assume deadheadMiles= distance
    const amount = distance * loadedMileRate + deadheadMiles * deadheadMileRate;
    console.log(`Distance: ${distance} miles`);
    console.log(`Duration: ${durations} minutes`);
    const result: TruckStopLDeliveryAddressInfoResponse = {
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
