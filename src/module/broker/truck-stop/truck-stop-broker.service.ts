import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { Logging } from '@core/logger/logging.service';
import { TruckStopInput } from '@module/broker/interface/truck-stop/truckt-stop-input.interface';
import { TruckStopLoad } from '@module/broker/interface/truck-stop/truck-stop-output.interface';
import * as xml2js from 'xml2js';

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
    private httpService: HttpService
  ) {
    this.truckStopConfig = this.configService.get('broker.truckStop');
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
    let filterOriginal = '';
    let filterDestination = '';
    if (input.pickupDates?.length > 0) {
      input.pickupDates.forEach(pickupDate => {
        filterPickupDate += `<arr:dateTime>${
          pickupDate ? pickupDate : '0001-01-01'
        }</arr:dateTime>\n`;
      });
    }

    // Generate filter for origin point
    if (input.origin.city) {
      filterOriginal += `<web1:OriginCity>${input.origin.city}</web1:OriginCity>\n`;
    }
    if (input.origin.country) {
      filterOriginal += `<web1:OriginCountry>${input.origin.country}</web1:OriginCountry>\n`;
    }
    if (input.origin.latitude && input.origin.longitude) {
      filterOriginal += `<web1:OriginLatitude>${input.origin.latitude}</web1:OriginLatitude>\n
      <web1:OriginLongitude>${input.origin.longitude}</web1:OriginLongitude>\n`;
    }
    filterOriginal += `<web1:OriginRange>${input.origin.range}</web1:OriginRange>\n
    <web1:OriginState>${input.origin.state}</web1:OriginState>\n`;

    // Generate filter for destination point
    if (input.destination.city) {
      filterDestination += `<web1:DestinationCity>${input.destination.city}</web1:DestinationCity>\n`;
    }
    if (input.destination.country) {
      filterDestination += `<web1:DestinationCountry>${input.destination.country}</web1:DestinationCountry>\n`;
    }

    if (input.destination.latitude && input.destination.longitude) {
      filterDestination += `<web1:DestinationLatitude>${input.destination.latitude}</web1:DestinationLatitude>\n
        <web1:DestinationLongitude>${input.destination.longitude}</web1:DestinationLongitude>\n`;
    }

    filterDestination += `<web1:DestinationRange>${input.destination.range}</web1:DestinationRange>\n
    <web1:DestinationState>${input.destination.state}</web1:DestinationState>\n`;

    const xmlString = `<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' 
        xmlns:v12='http://webservices.truckstop.com/v12'
        xmlns:web='http://schemas.datacontract.org/2004/07/WebServices'
        xmlns:web1='http://schemas.datacontract.org/2004/07/WebServices.Searching'
        xmlns:truc='http://schemas.datacontract.org/2004/07/Truckstop2.Objects'
        xmlns:arr='http://schemas.microsoft.com/2003/10/Serialization/Arrays'>
            <soapenv:Header/>
            <soapenv:Body>
                <v12:${requestName}>
                    <v12:searchRequest>
                        <web:IntegrationId>${integrationId}</web:IntegrationId>
                        <web:Password>${password}</web:Password>
                        <web:UserName>${userName}</web:UserName>
                        <web1:Criteria>
                            ${filterDestination}
                            <web1:EquipmentType>${input.equipmentType}</web1:EquipmentType>
                            <web1:LoadType>${input.loadType}</web1:LoadType>
                            ${filterOriginal}
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

  async searchAvailableLoads(input: TruckStopInput): Promise<any> {
    const xmlStringRequest = this.generateSearchRequest(input, 'GetLoadSearchResults');
    const request = this.httpService
      .post(this.truckStopConfig.urlWebServices, xmlStringRequest, {
        headers: {
          'Content-Type': 'text/xml',
          SOAPAction: `${this.truckStopConfig.urlSoapAction}/GetLoadSearchResults`
        }
      })
      .pipe(
        catchError(err => {
          Logging.error(`[TruckStop] Search Available Loads got error`, err.response?.data ?? err);
          throw new BadRequestException('TS001');
        })
      );
    const res = await firstValueFrom(request);
    const result: any[] =
      (await new Promise((resolve, reject) => {
        this.parser.parseString(res.data, function (err, result) {
          const response =
            result.Envelope.Body.GetLoadSearchResultsResponse.GetLoadSearchResultsResult;
          if (err || response.Errors?.Error) {
            const errorMessage = response.Errors?.Error.ErrorMessage;
            Logging.error(`[TruckStop] Search Available Loads got error`, err ?? errorMessage);
            reject(errorMessage);
          }
          const searchItems = response.SearchResults.LoadSearchItem;
          resolve(searchItems);
        });
      })) ?? [];

    return result;
  }

  async searchMultipleDetailsLoads(input: TruckStopInput): Promise<TruckStopLoad[]> {
    const xmlStringRequest = this.generateSearchRequest(input, 'GetMultipleLoadDetailResults');
    console.log('xmlStringRequest: ', xmlStringRequest);
    const request = this.httpService
      .post(this.truckStopConfig.urlWebServices, xmlStringRequest, {
        headers: {
          'Content-Type': 'text/xml',
          SOAPAction: `${this.truckStopConfig.urlSoapAction}/GetMultipleLoadDetailResults`
        }
      })
      .pipe(
        catchError(err => {
          Logging.error(
            `[TruckStop] Search Multiple Details Available Loads got error`,
            err.response?.data ?? err
          );

          return [];
          // throw new BadRequestException('TS002');
        })
      );
    const res = await firstValueFrom(request);
    const jsonResponses: any[] =
      (await new Promise(resolve => {
        this.parser.parseString(res.data, function (error, result) {
          const response =
            result.Envelope.Body.GetMultipleLoadDetailResultsResponse
              .GetMultipleLoadDetailResultsResult;
          if (error || response.Errors.Error) {
            const errorMessage = response.Errors.Error.ErrorMessage;
            Logging.error(
              `[TruckStop] Search Multiple Details Available Loads got error: ${errorMessage}`,
              errorMessage ?? error
            );

            resolve([]);
          }
          let searchItems: any = response.DetailResults.MultipleLoadDetailResult as [];
          if (
            response.DetailResults.MultipleLoadDetailResult &&
            !response.DetailResults.MultipleLoadDetailResult.length
          ) {
            searchItems = [response.DetailResults.MultipleLoadDetailResult];
          }

          resolve(searchItems);
        });
      })) ?? [];

    return jsonResponses;
  }
}
