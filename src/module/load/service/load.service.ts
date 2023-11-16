import { Injectable } from '@nestjs/common';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { ConfigService } from '@nestjs/config';
import { CoyoteBrokerService } from '@module/broker/coyote/coyote-broker.service';
import { Load, RouteInfo, SearchAvailableLoadsResponse } from '@module/broker/interface/flat-5/load.interface';
import { ApiBrokers } from '@module/broker/interface/flat-5/common.interface';
import { BookLoadDto } from '@module/load/validation/book-load.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Booking } from '@module/load/schema/booking.schema';
import { Model } from 'mongoose';
import { DatBrokerService } from '@module/broker/dat/dat-broker.service';
import { CoyoteInputTransformer } from '@module/broker/coyote/coyote-input.transformer';
import { CoyoteOutputTransformer } from '@module/broker/coyote/coyote-output.transformer';
import { DatInputTransformer } from '@module/broker/dat/dat-input.transformer';
import { DatOutputTransformer } from '@module/broker/dat/dat-output.transformer';
import { TruckStopBrokerService } from '@module/broker/truck-stop/truck-stop-broker.service';
import { TruckStopInput } from '@module/broker/interface/truck-stop/truckt-stop-input.interface';
import { TruckStopOutputTransformer } from '@module/broker/truck-stop/truck-stop-output.transformer';
import { TruckStopInputTransformer } from '@module/broker/truck-stop/truck-stop-input.transformer';
import { Logging } from '@core/logger/logging.service';

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
    private truckStopInputTransformer: TruckStopInputTransformer,
    private truckStopOutputTransformer: TruckStopOutputTransformer,
    private truckStopBrokerService: TruckStopBrokerService,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>
  ) {}

  async searchAvailableLoads(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[] | any> {
    if (searchAvailableLoadDto.stopPoints.length > 2) {
      searchAvailableLoadDto.stopPoints = searchAvailableLoadDto.stopPoints.slice(0, 2);
      // just handle only 2 stop points for now
    }
    const loads: Load[] = [];
    const [coyoteLoads, datLoads, truckStopLoads] = await Promise.all([
      this.searchAvailableLoadCoyote(searchAvailableLoadDto),
      this.searchAvailableLoadDat(searchAvailableLoadDto),
      this.searchAvailableLoadTruckStop(searchAvailableLoadDto)
    ]);
    loads.push(...coyoteLoads, ...datLoads, ...truckStopLoads);

    const searchAvailableLoadsResponse = new SearchAvailableLoadsResponse();
    searchAvailableLoadsResponse.routes = [];
    loads.forEach(load => {
      const routeInfo: RouteInfo = {
        distance: load.distance,
        distanceUnit: load.distanceUnit,
        duration: load.duration,
        durationUnit: load.durationUnit,
        amount: load.amount,
        currency: load.currency,
        description: '',
        returnAt: load.deliveryStop.appointment?.endTime,
        deadhead: load.originDeadhead + load.destinationDeadhead || 0,
        directions: '',
        type: 'standard',
        loads: [load],
        differInfo: null // for now
      };
      searchAvailableLoadsResponse.routes.push(routeInfo);
    });

    return searchAvailableLoadsResponse;
  }

  async searchAvailableLoadCoyote(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[] | any> {
    const loads: Load[] = [];
    if (this.configService.get('broker.coyote.enabled')) {
      const input = this.coyoteInputTransformer.searchAvailableLoads(searchAvailableLoadDto);
      try {
        const coyoteLoads = await this.coyoteBrokerService.searchAvailableLoads(input);
        loads.push(...this.coyoteOutputTransformer.searchAvailableLoads(coyoteLoads));
      } catch (error) {
        Logging.error('[Load Service] Search Available Loads got error', error);
      }
    }

    return loads;
  }

  async searchAvailableLoadDat(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[] | any> {
    const loads: Load[] = [];
    if (this.configService.get('broker.dat.enabled')) {
      const input = this.datInputTransformer.createAssetQuery(searchAvailableLoadDto);
      try {
        const assetQuery = await this.datBrokerService.createAssetQuery(input);
        const datMatches = await this.datBrokerService.retrieveAssetQueryResults(assetQuery.queryId);

        loads.push(...this.datOutputTransformer.searchAvailableLoads(datMatches));
      } catch (error) {
        Logging.error('[Load Service] Search Available Loads got error', error);
      }
    }

    return loads;
  }

  async searchAvailableLoadTruckStop(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[] | any> {
    const loads: Load[] = [];
    if (this.configService.get('broker.truckStop.enabled')) {
      const input = this.truckStopInputTransformer.searchAvailableLoads(searchAvailableLoadDto) as TruckStopInput;
      if (input.destination && input.origin && input.equipmentType) {
        try {
          const truckStopLoads = await this.truckStopBrokerService.searchMultipleDetailsLoads(input);

          // return truckStopLoads;
          loads.push(...(await this.truckStopOutputTransformer.searchAvailableLoads(truckStopLoads)));
        } catch (error) {
          Logging.error('[Load Service] Search Available Loads got error', error);
        }
      }
    }

    return loads;
  }

  async getLoadDetail(broker: ApiBrokers, loadId: string): Promise<Load> {
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
    const res = await this.datBrokerService.retrieveAssetQueryResults(assetQuery.queryId);

    return res;
  }
}
