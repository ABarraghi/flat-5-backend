import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Logging } from '@core/logger/logging.service';
import { TruckStopInput } from '@module/transform-layer/interface/truck-stop/truckt-stop-input.interface';
import { MapboxService } from '@module/broker/service/mapbox.service';
import {
  TruckStopLDeliveryAddressInfo,
  TruckStopLoad
} from '@module/transform-layer/interface/truck-stop/truck-stop-output.transformer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const xml2js = require('xml2js');

@Injectable()
export class TruckStopBrokerService {
  private truckStopConfig: {
    userName: string;
    password: string;
    integrationId: number;
    urlWebServices: string;
    urlSoapAction: string;
  };
  private readonly parser: any;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private mapboxService: MapboxService
  ) {
    this.truckStopConfig = this.configService.get('broker.truck_stop');
    this.parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      tagNameProcessors: [xml2js.processors.stripPrefix],
      attrNameProcessors: [xml2js.processors.stripPrefix]
    });
  }

  generateSearchRequest = (input: TruckStopInput, requestName: string): string => {
    const integrationId = this.truckStopConfig.integrationId;
    const password = this.truckStopConfig.password;
    const userName = this.truckStopConfig.userName;
    let filterPickupDate = '';
    if (input.pickupDates?.length > 0) {
      input.pickupDates.forEach(pickupDate => {
        filterPickupDate += `<arr:dateTime>${
          pickupDate ? pickupDate : '0001-01-01'
        }</arr:dateTime>`;
      });
    }
    const xmlString = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:v12="http://webservices.truckstop.com/v12"
        xmlns:web="http://schemas.datacontract.org/2004/07/WebServices"
        xmlns:web1="http://schemas.datacontract.org/2004/07/WebServices.Searching"
        xmlns:truc="http://schemas.datacontract.org/2004/07/Truckstop2.Objects"
        xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
            <soapenv:Header/>
            <soapenv:Body>
                <v12:${requestName}>
                    <v12:searchRequest>
                        <web:IntegrationId>${integrationId}</web:IntegrationId>
                        <web:Password>${password}</web:Password>
                        <web:UserName>${userName}</web:UserName>
                        <web1:Criteria>
                            <web1:DestinationCity>${input.destination.city}</web1:DestinationCity>
                            <web1:DestinationCountry>${
                              input.destination.country
                            }</web1:DestinationCountry>
                               <web1:DestinationLatitude>${
                                 input.destination.latitude
                                   ? parseInt(String(input.destination.latitude))
                                   : 0
                               }</web1:DestinationLatitude>
                            <web1:DestinationLongitude>${
                              input.origin.longitude ? parseInt(String(input.origin.longitude)) : 0
                            }</web1:DestinationLongitude>
                            <web1:DestinationRange>${
                              input.destination.range
                            }</web1:DestinationRange>
                            <web1:DestinationState>${
                              input.destination.state
                            }</web1:DestinationState>
                            <web1:EquipmentType>${input.equipmentType}</web1:EquipmentType>
                            <web1:LoadType>${input.loadType}</web1:LoadType>
                            <web1:OriginCity>${input.origin.city}</web1:OriginCity>
                            <web1:OriginCountry>${input.origin.country}</web1:OriginCountry>
                            <web1:OriginLatitude>${
                              input.origin.latitude ? parseInt(String(input.origin.latitude)) : 0
                            }</web1:OriginLatitude>
                            <web1:OriginLongitude>${
                              input.origin.longitude ? parseInt(String(input.origin.longitude)) : 0
                            }</web1:OriginLongitude>
                            <web1:OriginRange>${input.origin.range}</web1:OriginRange>
                            <web1:OriginState>${input.origin.state}</web1:OriginState>
                            <web1:PageNumber>0</web1:PageNumber>
                            <web1:PageSize>50</web1:PageSize>
                            <web1:PickupDates>
                                ${filterPickupDate}
                            </web1:PickupDates>
                            <web1:SortDescending>false</web1:SortDescending>
                        </web1:Criteria>
                    </v12:searchRequest>
                </v12:${requestName}>
            </soapenv:Body>
        </soapenv:Envelope>`;

    return xmlString;
  };

  async handleRequest(xmlRequest, apiName) {
    return this.httpService.post(this.truckStopConfig.urlWebServices, xmlRequest, {
      headers: {
        'Content-Type': 'text/xml',
        SOAPAction: `${this.truckStopConfig.urlSoapAction}/${apiName}`
      }
    });
  }

  async searchAvailableLoads(input: TruckStopInput): Promise<any> {
    try {
      const xmlStringRequest = this.generateSearchRequest(input, 'GetLoadSearchResults');
      const request = await this.handleRequest(xmlStringRequest, 'GetLoadSearchResults');
      const res = await firstValueFrom(request);
      const result: any[] =
        (await new Promise((resolve, reject) => {
          this.parser.parseString(res.data, function (err, result) {
            const response =
              result.Envelope.Body.GetLoadSearchResultsResponse.GetLoadSearchResultsResult;
            if (response.Errors?.Error) {
              const errorMessage = response.Errors?.Error.ErrorMessage;
              Logging.error(`[TruckStop] Search Available Loads got error`, errorMessage);
              reject(errorMessage);
            }
            const searchItems = response.SearchResults.LoadSearchItem;
            resolve(searchItems);
          });
        })) || [];

      return result;
    } catch (err) {
      if (err.response.data) {
        Logging.error('[TruckStop] Search Available Loads got error', err.response.data);
      } else {
        Logging.error(`[TruckStop] Search Available Loads got error`, err);
      }
      throw new BadRequestException('TS001');
    }
  }

  async searchMultipleDetailsLoads(input: TruckStopInput): Promise<any> {
    const xmlStringRequest = this.generateSearchRequest(input, 'GetMultipleLoadDetailResults');
    const request = await this.handleRequest(xmlStringRequest, 'GetMultipleLoadDetailResults');
    try {
      const res = await firstValueFrom(request);
      const result: any[] =
        (await new Promise((resolve, reject) => {
          this.parser.parseString(res.data, function (error, result) {
            const response =
              result.Envelope.Body.GetMultipleLoadDetailResultsResponse
                .GetMultipleLoadDetailResultsResult;
            if (response.Errors.Error) {
              const errorMessage = response.Errors.Error.ErrorMessage;
              Logging.error(
                `[TruckStop] Search Multiple Details Available Loads got error`,
                errorMessage
              );
              reject(errorMessage);
            }
            const searchItems = response.DetailResults.MultipleLoadDetailResult;

            resolve(searchItems);
          });
        })) || [];

      return Promise.all(
        result.map(async item => {
          const input: TruckStopLDeliveryAddressInfo = {
            originCity: item.OriginCity,
            originCountry: item.OriginState,
            originState: item.OriginCountry,
            destinationCity: item.DestinationCity,
            destinationCountry: item.DestinationState,
            destinationState: item.DestinationCountry
          };
          const deliveryInfo = await this.mapboxService.transformInfoTruckStop(input);
          console.log(deliveryInfo);

          return { ...item, ...deliveryInfo };
        })
      );
    } catch (err) {
      if (err.response?.data) {
        Logging.error(
          '[TruckStop] Search Multiple Details Available Loads got error',
          err.response.data
        );
      } else {
        Logging.error('[TruckStop] Search Multiple Details Available Loads got error', err);
      }
      throw new BadRequestException('TS002');
    }
  }
  // async getLoadDetail(loadId: number): Promise<CoyoteLoadDetailResponse> {
  //   return res.data;
  // }
}
