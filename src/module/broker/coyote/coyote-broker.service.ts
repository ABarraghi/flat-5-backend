import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CoyoteBookLoadInput,
  CoyoteBookLoadSimpleInput,
  CoyoteInput
} from '@module/broker/interface/coyote/coyote-input.interface';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import * as dayjs from 'dayjs';
import { Logging } from '@core/logger/logging.service';
import {
  CoyoteAuthenticationResponse,
  CoyoteLoadDetailResponse,
  CoyoteSearchLoadResponse
} from '@module/broker/interface/coyote/coyote-response.interface';

@Injectable()
export class CoyoteBrokerService {
  private coyoteConfig: { host: string; apiPrefix: string };
  private expireTime: string;
  private accessToken: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.coyoteConfig = this.configService.get('broker.coyote');
  }

  private async generateAccessToken(): Promise<string> {
    const now = dayjs();
    if (!this.accessToken || this.expireTime <= now.toISOString()) {
      const url = `${this.coyoteConfig.host}/connect/token`;
      const request = this.httpService
        .post<CoyoteAuthenticationResponse>(
          url,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.configService.get('broker.coyote.clientId'),
            client_secret: this.configService.get('broker.coyote.clientSecret')
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )
        .pipe(
          catchError(e => {
            Logging.error('[Coyote Service] Authorization got error', e);
            throw new BadRequestException('CYT001');
          })
        );
      const res = await firstValueFrom(request);
      this.accessToken = res.data.access_token;
      this.expireTime = now.add(res.data.expires_in, 's').toISOString();
    }

    return `Bearer ${this.accessToken}`;
  }

  async searchAvailableLoads(input: CoyoteInput): Promise<CoyoteSearchLoadResponse> {
    const url = `${this.coyoteConfig.host}/${this.coyoteConfig.apiPrefix}/AvailableLoads/search`;
    const request = this.httpService
      .post<CoyoteSearchLoadResponse>(url, input, {
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
          Logging.error('[Coyote Service] Search Available Loads got error', e);
          console.log(e.response.data);
          throw new BadRequestException('CYT002');
        })
      );
    const res = await firstValueFrom(request);

    return res.data;
  }

  async getLoadDetail(loadId: number): Promise<CoyoteLoadDetailResponse> {
    const url = `${this.coyoteConfig.host}/${this.coyoteConfig.apiPrefix}/AvailableLoads/${loadId}`;
    const request = this.httpService
      .get<CoyoteLoadDetailResponse>(url, {
        headers: {
          Authorization: await this.generateAccessToken()
        }
      })
      .pipe(
        catchError(e => {
          Logging.error('[Coyote Service] Get Load Detail got error', e);
          throw new BadRequestException('CYT003');
        })
      );
    const res = await firstValueFrom(request);

    return res.data;
  }

  async bookLoad(input: CoyoteBookLoadSimpleInput): Promise<any> {
    const loadDetail = await this.getLoadDetail(input.loadId);
    const data = new CoyoteBookLoadInput({
      load: loadDetail,
      carrierId: input.carrierId
    });
    const url = `${this.coyoteConfig.host}/${this.coyoteConfig.apiPrefix}/Booking`;
    const request = this.httpService
      .post<any>(url, data, {
        headers: {
          Authorization: await this.generateAccessToken()
        }
      })
      .pipe(
        catchError(e => {
          Logging.error('[Coyote Service] Book Load got error', e);
          throw new BadRequestException('CYT004');
        })
      );
    const res = await firstValueFrom(request);

    return res.data;
  }
}
