import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Feature, FeatureCollection } from '@module/broker/interface/mapbox/mapbox-interface';
import { map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import * as MapboxSdk from '@mapbox/mapbox-sdk';
import * as MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import { catchError, firstValueFrom } from 'rxjs';
import { Logging } from '@core/logger/logging.service';

@Injectable()
export class MapboxService {
  private mapboxConfig: { url: string; key: string };
  private readonly mapboxClient: any;
  public directionsService: any;
  public directionsClient: any;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.mapboxConfig = this.configService.get('mapbox');
    this.mapboxClient = MapboxSdk({ accessToken: this.mapboxConfig.key });
    this.directionsService = MapboxDirections(this.mapboxClient);
    this.directionsClient = new MapboxDirections({
      accessToken: this.mapboxConfig.key,
      profile: 'mapbox/driving'
    });
  }

  async searchAddress(city: string = '', state: string = '', country: string = ''): Promise<Feature> {
    const searchKey = `${city} ${state} ${country}`;
    const urlGetPlace = `${this.mapboxConfig.url}/${encodeURIComponent(searchKey)}.json?access_token=${
      this.mapboxConfig.key
    }`;
    const response = this.httpService.get<FeatureCollection>(urlGetPlace).pipe(
      map((axiosResponse: AxiosResponse<FeatureCollection>) => axiosResponse.data),
      catchError(e => {
        Logging.error('Mapbox search address got error', e);
        throw new BadRequestException('Mapbox search address got error');
      })
    );

    const data: FeatureCollection = await firstValueFrom(response);
    // const data = (await response) ;
    let result: Feature;
    if (data?.features?.length > 0) {
      const features = data?.features.filter(
        f => f.place_type.includes('country') || f.place_type.includes('city') || f.place_type.includes('place')
      );
      if (features?.length > 0) {
        result = features[0];
      } else {
        result = data.features[0];
      }
    }

    return result;
  }
}
