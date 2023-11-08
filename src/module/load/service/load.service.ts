import { Injectable } from '@nestjs/common';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { ConfigService } from '@nestjs/config';
import { CoyoteBrokerService } from '@module/broker/service/coyote-broker.service';
import { LoadInterface } from '@module/transform-layer/interface/flat-5/load.interface';
import { ApiBrokers } from '@module/transform-layer/interface/flat-5/common.interface';
import { BookLoadDto } from '@module/load/validation/book-load.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Booking } from '@module/load/schema/booking.schema';
import { Model } from 'mongoose';
import { DatBrokerService } from '@module/broker/service/dat-broker.service';
import { CoyoteInputTransformer } from '@module/transform-layer/coyote/coyote-input.transformer';
import { CoyoteOutputTransformer } from '@module/transform-layer/coyote/coyote-output.transformer';
import { DatInputTransformer } from '@module/transform-layer/dat/dat-input.transformer';
import { DatOutputTransformer } from '@module/transform-layer/dat/dat-output.transformer';
import { TruckStopBrokerService } from '@module/broker/service/truck-stop-broker.service';
import {
  TruckStopInput
} from '@module/transform-layer/interface/truck-stop/truckt-stop-input.interface';
import { MapboxService } from '@module/broker/service/mapbox.service';

@Injectable()
export class LoadService {
  constructor(
    private configService: ConfigService,
    private coyoteBrokerService: CoyoteBrokerService,
    private datBrokerService: DatBrokerService,
    private coyoteInputTransformer: CoyoteInputTransformer,
    private coyoteOutputTransformer: CoyoteOutputTransformer,
    private datInputTransformer: DatInputTransformer,
    private datOutputTransformer: DatOutputTransformer,
    private truckStopBrokerService: TruckStopBrokerService,
    private mapboxService: MapboxService,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>
  ) {}

  async searchAvailableLoads(
    searchAvailableLoadDto: SearchAvailableLoadDto
  ): Promise<LoadInterface[] | any> {
    if (searchAvailableLoadDto.stopPoints.length > 2) {
      searchAvailableLoadDto.stopPoints = searchAvailableLoadDto.stopPoints.slice(0, 2);
      // just handle only 2 stop points for now
    }
    const loads: LoadInterface[] = [];
    if (this.configService.get('broker.coyote.enabled')) {
      const input = this.coyoteInputTransformer.searchAvailableLoads(searchAvailableLoadDto);
      const coyoteLoads = await this.coyoteBrokerService.searchAvailableLoads(input);

      loads.push(...this.coyoteOutputTransformer.searchAvailableLoads(coyoteLoads));
    }
    if (this.configService.get('broker.dat.enabled')) {
      const input = this.datInputTransformer.createAssetQuery(searchAvailableLoadDto);
      const assetQuery = await this.datBrokerService.createAssetQuery(input);
      const datMatches = await this.datBrokerService.retrieveAssetQueryResults(assetQuery.queryId);

      loads.push(...this.datOutputTransformer.searchAvailableLoads(datMatches));
    }
    if (this.configService.get('broker.truck_stop.enabled')) {
      const input = this.inputTransformer.transformSearchAvailableLoad(searchAvailableLoadDto, {
        to: 'truck_stop'
      }) as TruckStopInput;
      // const truckStopLoads = await this.truckStopBrokerService.searchAvailableLoads(input);
      const truckStopLoads = await this.truckStopBrokerService.searchMultipleDetailsLoads(input);
      loads.push(
        ...this.outputTransformer.transformSearchAvailableLoads(truckStopLoads, {
          from: 'truck_stop'
        })
      );
    }

    return loads;
  }

  async getLoadDetail(broker: ApiBrokers, loadId: string): Promise<LoadInterface> {
    switch (broker) {
      case 'coyote':
        if (this.configService.get('broker.coyote.enabled')) {
          const input = this.coyoteInputTransformer.getLoadDetail(loadId);

          const coyoteLoadDetail = await this.coyoteBrokerService.getLoadDetail(input);

          return this.coyoteOutputTransformer.getLoadDetail(coyoteLoadDetail);
        }
        break;
      default:
        return;
    }
  }

  async bookLoad(bookLoadDto: BookLoadDto): Promise<any> {
    switch (bookLoadDto.broker) {
      case 'coyote':
        if (this.configService.get('broker.coyote.enabled')) {
          const input = this.coyoteInputTransformer.bookLoad(bookLoadDto.loadId);

          const bookingLoadId = await this.coyoteBrokerService.bookLoad(input);

          const bookingLoad = this.coyoteOutputTransformer.bookLoad(bookingLoadId);
          bookingLoad.loadId = input.loadId.toString();
          bookingLoad.carrierId = input.carrierId.toString();
          bookingLoad.broker = bookLoadDto.broker;

          const createdCat = new this.bookingModel(bookingLoad);
          await createdCat.save();

          return bookingLoad;
        }
        break;
      default:
        return;
    }
  }

  async test(input?: any): Promise<any> {
    const assetQuery = await this.datBrokerService.createAssetQuery(input);
    console.log(assetQuery);
    const res = await this.datBrokerService.retrieveAssetQueryResults(assetQuery.queryId);
    console.log(res);

    return res;
  }
}
