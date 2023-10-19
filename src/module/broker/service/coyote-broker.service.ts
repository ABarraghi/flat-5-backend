import { BadRequestException, Injectable } from '@nestjs/common';
import { CoyoteInput } from '@module/transform-layer/interface/coyote/coyote-input.interface';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import * as dayjs from 'dayjs';
import { Logging } from '@core/logger/logging.service';
import {
  CoyoteAuthenticationResponse,
  CoyoteSearchLoadResponse
} from '@module/transform-layer/interface/coyote/coyote-response.interface';

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
            Logging.error('Coyote Authorization got error', e);
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
          Logging.error('[Coyote] Search Available Loads got error', e);
          throw new BadRequestException('CYT002');
        })
      );
    const res = await firstValueFrom(request);

    return res.data;
  }
}
