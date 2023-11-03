import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { Logging } from '@core/logger/logging.service';
import { TruckStopInput } from '@module/transform-layer/interface/truck-stop/truckt-stop-input.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parseString = require('xml2js').parseString;

@Injectable()
export class TruckStopBrokerService {
  private truckStopConfig: {
    userName: string;
    password: string;
    integrationId: number;
    urlWebServices: string;
    urlSoapAction: string;
  };

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.truckStopConfig = this.configService.get('broker.truck_stop');
  }

  async searchAvailableLoads(input: TruckStopInput): Promise<any> {
    const integrationId = this.truckStopConfig.integrationId;
    const password = this.truckStopConfig.password;
    const userName = this.truckStopConfig.userName;

    const xmlString = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v12="http://webservices.truckstop.com/v12"
        xmlns:web="http://schemas.datacontract.org/2004/07/WebServices"
        xmlns:web1="http://schemas.datacontract.org/2004/07/WebServices.Searching"
        xmlns:truc="http://schemas.datacontract.org/2004/07/Truckstop2.Objects"
        xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
            <soapenv:Header/>
            <soapenv:Body>
                <v12:GetLoadSearchResults>
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
                            <web1:HoursOld>0</web1:HoursOld>
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
                                <arr:dateTime>${
                                  input.pickupDate ? input.pickupDate : '0001-01-01'
                                }</arr:dateTime>
                            </web1:PickupDates>
                           
                            <web1:SortDescending>false</web1:SortDescending>
                        </web1:Criteria>
                    </v12:searchRequest>
                </v12:GetLoadSearchResults>
            </soapenv:Body>
        </soapenv:Envelope>`;
    console.log('this.truckStopConfig.urlWebServices: ', this.truckStopConfig.urlWebServices);
    console.log('this.truckStopConfig.urlSoapAction: ', this.truckStopConfig.urlSoapAction);
    console.log('input ', xmlString);

    const request = this.httpService
      .post(this.truckStopConfig.urlWebServices, xmlString, {
        headers: {
          'Content-Type': 'text/xml',
          SOAPAction: `${this.truckStopConfig.urlSoapAction}/GetLoadSearchResults`
        }
      })
      .pipe(
        catchError(e => {
          Logging.error('[TruckStop] Search Available Loads got error', e);
          throw new BadRequestException('CYT002');
        })
      );

    const res = await firstValueFrom(request);
    console.log('res: ', res);
    console.log('res.data: ', res.data);
    try {
      const resultXml: any[] =
        (await new Promise((resolve, reject) => {
          parseString(res.data, function (err, result) {
            if (
              result['s:Envelope']['s:Body'][0]['GetLoadSearchResultsResponse'][0][
                'GetLoadSearchResultsResult'
              ][0]['Errors'][0]['Error']
            ) {
              const errorMessage =
                result['s:Envelope']['s:Body'][0]['GetLoadSearchResultsResponse'][0][
                  'GetLoadSearchResultsResult'
                ][0]['Errors'][0]['Error'][0]['ErrorMessage'][0];
              console.log('Error Message:', errorMessage);
              reject(errorMessage);
            }
            const searchItems =
              result['s:Envelope']['s:Body'][0]['GetLoadSearchResultsResponse'][0][
                'GetLoadSearchResultsResult'
              ][0]['a:SearchResults'][0]['a:LoadSearchItem'];

            resolve(searchItems);
          });
        })) || [];
      console.log('type of resultXml: ', resultXml.length);

      const result = [];
      for (let i = 0; i < resultXml.length; i++) {
        const item = resultXml[i];
        const parseValue = {};
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const newKey = key.replace('a:', '');
            parseValue[newKey] = item[key][0]; // Assign the value
          }
        }
        result.push(parseValue);
      }

      return result;
    } catch (err) {
      Logging.error(`[TruckStop] Search Available Loads got error`, err);
      throw new BadRequestException('TS002');
    }
  }

  //
  // async getLoadDetail(loadId: number): Promise<CoyoteLoadDetailResponse> {
  //   const url = `${this.coyoteConfig.host}/${this.coyoteConfig.apiPrefix}/AvailableLoads/${loadId}`;
  //   const request = this.httpService
  //     .get<CoyoteLoadDetailResponse>(url, {
  //       headers: {
  //         Authorization: await this.generateAccessToken()
  //       }
  //     })
  //     .pipe(
  //       catchError(e => {
  //         Logging.error('[Coyote] Get Load Detail got error', e);
  //         throw new BadRequestException('CYT003');
  //       })
  //     );
  //   const res = await firstValueFrom(request);
  //
  //   return res.data;
  // }
  //
  // async bookLoad(input: CoyoteBookLoadSimpleInput): Promise<any> {
  //   const loadDetail = await this.getLoadDetail(input.loadId);
  //   const data = new CoyoteBookLoadInput({
  //     load: loadDetail,
  //     carrierId: input.carrierId
  //   });
  //   const url = `${this.coyoteConfig.host}/${this.coyoteConfig.apiPrefix}/Booking`;
  //   const request = this.httpService
  //     .post<any>(url, data, {
  //       headers: {
  //         Authorization: await this.generateAccessToken()
  //       }
  //     })
  //     .pipe(
  //       catchError(e => {
  //         Logging.error('[Coyote] Book Load got error', e);
  //         throw new BadRequestException('CYT004');
  //       })
  //     );
  //   const res = await firstValueFrom(request);
  //
  //   return res.data;
  // }
}
