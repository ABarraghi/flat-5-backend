import { Injectable } from '@nestjs/common';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { ConfigService } from '@nestjs/config';
import { CoyoteBrokerService } from '@module/broker/service/coyote-broker.service';
import { InputTransformer } from '@module/transform-layer/input.transformer';
import { LoadInterface } from '@module/transform-layer/interface/flat-5/load.interface';
import { OutputTransformer } from '@module/transform-layer/output.transformer';

@Injectable()
export class LoadService {
  constructor(
    private configService: ConfigService,
    private coyoteBrokerService: CoyoteBrokerService
  ) {}

  async searchAvailableLoads(
    searchAvailableLoadDto: SearchAvailableLoadDto
  ): Promise<LoadInterface[]> {
    const loads: LoadInterface[] = [];
    if (this.configService.get('broker.coyote.enabled')) {
      const coyoteLoads = await this.coyoteBrokerService.searchAvailableLoads(
        InputTransformer.transformToCoyote(searchAvailableLoadDto)
      );
      loads.push(
        ...coyoteLoads.loads.map(load => OutputTransformer.transform(load, { from: 'coyote' }))
      );
    }

    return loads;
  }
}
