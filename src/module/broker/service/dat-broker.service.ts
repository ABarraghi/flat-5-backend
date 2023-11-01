import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import * as dayjs from 'dayjs';
import { Logging } from '@core/logger/logging.service';
import {
  DATGetOrganizationTokenResponse,
  DATGetUserTokenResponse,
  DATMatchResponse,
  DATQueriesResponse,
  DATQueryResponse,
  DATRetrieveAssetsResponse
} from '@module/transform-layer/interface/dat/dat-response.interface';
import {
  DATCreateAssetQueryInput,
  DATGetAssetQueriesInput,
  DATGetAssetQueryDetailInput,
  DATRetrieveAssetsQueryInput
} from '@module/transform-layer/interface/dat/dat-input.interface';

@Injectable()
export class DatBrokerService {
  private datConfig: { host: string; serviceAccountEmail: string; serviceAccountPassword: string };
  private expireTime: string;
  private accessToken: string;
  private orgExpireTime: string;
  private orgAccessToken: string;
  private userLevelUsername = 'noerr_test';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.datConfig = this.configService.get('broker.dat');
  }

  async generateOrganizationAccessToken(): Promise<string> {
    if (!this.orgAccessToken || this.orgExpireTime <= new Date().toISOString()) {
      const url = `https://identity.${this.datConfig.host}/access/v1/token/organization`;
      const request = this.httpService
        .post<DATGetOrganizationTokenResponse>(
          url,
          {
            username: this.datConfig.serviceAccountEmail,
            password: this.datConfig.serviceAccountPassword
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        .pipe(
          catchError(e => {
            Logging.error('[DAT Service] Get Organization Token got error', e);
            throw new BadRequestException('DAT001');
          })
        );
      const res = await firstValueFrom(request);
      this.orgAccessToken = res.data.accessToken;
      this.orgExpireTime = new Date(res.data.expiresWhen).toISOString();
      console.log(this.orgExpireTime);
    }

    return `Bearer ${this.orgAccessToken}`;
  }

  private async generateAccessToken(): Promise<string> {
    const now = dayjs();
    if (!this.accessToken || this.expireTime <= now.toISOString()) {
      const url = `https://identity.${this.datConfig.host}/access/v1/token/user`;
      const request = this.httpService
        .post<DATGetUserTokenResponse>(
          url,
          {
            username: this.userLevelUsername
          },
          {
            headers: {
              Authorization: await this.generateOrganizationAccessToken()
            }
          }
        )
        .pipe(
          catchError(e => {
            Logging.error('[Dat Service] Get User Level Token got error', e);
            throw new BadRequestException('DAT002');
          })
        );
      const res = await firstValueFrom(request);
      this.accessToken = res.data.accessToken;
      this.expireTime = new Date(res.data.expiresWhen).toISOString();
      console.log(this.expireTime);
    }
    console.log(this.accessToken);

    return `Bearer ${this.accessToken}`;
  }

  async createAssetQuery(input: DATCreateAssetQueryInput): Promise<DATQueryResponse> {
    console.log(22222);
    const url = `https://freight.${this.datConfig.host}/search/v3/queries`;
    const request = this.httpService
      .post<DATQueryResponse>(url, input, {
        headers: {
          Authorization: await this.generateAccessToken()
        },
        params: new URLSearchParams({
          page: '1',
          pageSize: '50'
        })
      })
      .pipe(
        catchError(e => {
          Logging.error('[DAT Service] Create Asset Query got error', e);
          throw new BadRequestException('DAT003');
        })
      );
    const res = await firstValueFrom(request);

    return res.data;
  }

  async getAssetQueriesByUser(input: DATGetAssetQueriesInput): Promise<DATQueriesResponse> {
    const url = `https://freight.${this.datConfig.host}/search/v3/queries`;
    const request = this.httpService
      .get<DATQueriesResponse>(url, {
        headers: {
          Authorization: await this.generateAccessToken()
        },
        params: new URLSearchParams(input as any)
      })
      .pipe(
        catchError(e => {
          Logging.error('[DAT Service] Get Asset Queries By User got error', e);
          throw new BadRequestException('DAT004');
        })
      );
    const res = await firstValueFrom(request);

    return res.data;
  }

  async getAssetQueryDetail(input: DATGetAssetQueryDetailInput): Promise<DATQueryResponse> {
    const url = `https://freight.${this.datConfig.host}/search/v3/queries/${input.queryId}`;
    const request = this.httpService
      .get<DATQueryResponse>(url, {
        headers: {
          Authorization: await this.generateAccessToken()
        }
      })
      .pipe(
        catchError(e => {
          Logging.error('[DAT Service] Get Asset Queries Detail got error', e);
          throw new BadRequestException('DAT005');
        })
      );
    const res = await firstValueFrom(request);

    return res.data;
  }

  async retrieveAssetQueryResults(
    queryId: string,
    input: DATRetrieveAssetsQueryInput
  ): Promise<DATRetrieveAssetsResponse> {
    const url = `https://freight.${this.datConfig.host}/search/v3/queryMatches/${queryId}`;
    const request = this.httpService
      .get<DATRetrieveAssetsResponse>(url, {
        headers: {
          Authorization: await this.generateAccessToken()
        },
        params: new URLSearchParams(input as any)
      })
      .pipe(
        catchError(e => {
          Logging.error('[DAT Service] Retrieve Asset Query Results got error', e);
          throw new BadRequestException('DAT006');
        })
      );
    const res = await firstValueFrom(request);

    return res.data;
  }

  async retrieveDetailOfPreviousQueriedAsset(matchId: string): Promise<DATMatchResponse> {
    const url = `https://freight.${this.datConfig.host}/search/v3/matchDetails/${matchId}`;
    const request = this.httpService
      .get<DATMatchResponse>(url, {
        headers: {
          Authorization: await this.generateAccessToken()
        }
      })
      .pipe(
        catchError(e => {
          Logging.error(
            '[DAT Service] Retrieve Details of a Previously Queried Asset got error',
            e
          );
          throw new BadRequestException('DAT007');
        })
      );
    const res = await firstValueFrom(request);

    return res.data;
  }
}
