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
import { Loc } from '@core/util/loc';
import * as dayjs from 'dayjs';

@Injectable()
export class LoadService {
  maximumDeadheadMilesRate = 0.3;

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

  async searchAvailableLoadsBetween2Points(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[] | any> {
    // console.log(searchAvailableLoadDto.stopPoints[0].stopDate);
    // console.log(searchAvailableLoadDto.stopPoints[1].stopDate);

    // return [];
    if (searchAvailableLoadDto.stopPoints.length > 2) {
      searchAvailableLoadDto.stopPoints = searchAvailableLoadDto.stopPoints.slice(0, 2);
    }
    const loadKeyByPoints =
      searchAvailableLoadDto.stopPoints[0].location.coordinate.latitude.toString() +
      '_' +
      searchAvailableLoadDto.stopPoints[0].location.coordinate.longitude.toString() +
      '_' +
      searchAvailableLoadDto.stopPoints[1].location.coordinate.latitude.toString() +
      '_' +
      searchAvailableLoadDto.stopPoints[1].location.coordinate.longitude.toString();
    const loads: Load[] = [];
    const [coyoteLoads, datLoads, truckStopLoads] = await Promise.all([
      this.searchAvailableLoadCoyote(searchAvailableLoadDto),
      this.searchAvailableLoadDat(searchAvailableLoadDto),
      this.searchAvailableLoadTruckStop(searchAvailableLoadDto)
    ]);
    loads.push(...coyoteLoads, ...datLoads, ...truckStopLoads);
    loads.forEach(load => {
      load.keyByPoints = loadKeyByPoints;
      load.stopPoints = searchAvailableLoadDto.stopPoints;
    });

    loads.filter(load => {
      return this.validateLoadByDeadheadMiles(load) && this.validateLoadByMilesPerDay(load);
    });

    return loads;
  }

  async searchAvailableLoads(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[][] | any> {
    if (searchAvailableLoadDto.returnHome) {
      let stopPoints = searchAvailableLoadDto.stopPoints;
      let reveredStopPoints = [...stopPoints];
      reveredStopPoints.pop();
      reveredStopPoints = reveredStopPoints.reverse();
      stopPoints = [...stopPoints, ...reveredStopPoints];
      searchAvailableLoadDto.stopPoints = stopPoints;
    }
    const preMapLoads: Load[][] = [];
    for (let i = 0; i < searchAvailableLoadDto.stopPoints.length - 1; i++) {
      const stopPoints = [searchAvailableLoadDto.stopPoints[i], searchAvailableLoadDto.stopPoints[i + 1]];
      preMapLoads.push(
        await this.searchAvailableLoadsBetween2Points({
          ...searchAvailableLoadDto,
          stopPoints
        })
      );
    }

    return preMapLoads;
  }

  async searchStandard(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<SearchAvailableLoadsResponse | any> {
    const preMapLoads: Load[][] = await this.searchAvailableLoads(searchAvailableLoadDto);
    const searchAvailableLoadsResponse = new SearchAvailableLoadsResponse();
    searchAvailableLoadsResponse.routes = [];

    const routes: RouteInfo[] = [];
    const loadsForRoutes: Load[][] = generateCombinations(preMapLoads);
    for (const loadsForRoute of loadsForRoutes) {
      if (loadsForRoute.length === 0) continue;
      const routeInfo: RouteInfo = {
        stopPoints: searchAvailableLoadDto.stopPoints,
        distance: 0,
        distanceUnit: loadsForRoute[0].distanceUnit,
        duration: 0,
        durationUnit: loadsForRoute[0].durationUnit,
        amount: 0,
        currency: loadsForRoute[0].currency,
        description: '',
        returnAt: '',
        deadhead: 0,
        directions: '',
        type: 'standard',
        loads: loadsForRoute,
        differInfo: null // for now
      };
      loadsForRoute.forEach(load => {
        routeInfo.distance += load.distance;
        routeInfo.duration += load.duration;
        routeInfo.amount += load.amount;
        routeInfo.deadhead += load.originDeadhead + load.destinationDeadhead;

        if (this.isEnRouteLoad(load)) {
          routeInfo.type = 'enRoute';
        } else if (!this.isStandardLoad(load)) {
          routeInfo.type = 'notValidYet';
        }
      });
      routes.push(routeInfo);
    }

    const searchEnRoutes = await this.searchEnRoute(searchAvailableLoadDto);
    routes.push(...searchEnRoutes.routes);
    searchAvailableLoadsResponse.routes = routes;

    return searchAvailableLoadsResponse;
  }

  async searchEnRoute(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<SearchAvailableLoadsResponse | any> {
    searchAvailableLoadDto.stopPoints.forEach(stopPoint => {
      stopPoint.radius *= 1.5;
    });
    const preMapLoads: Load[][] = await this.searchAvailableLoads(searchAvailableLoadDto);
    const searchAvailableLoadsResponse = new SearchAvailableLoadsResponse();
    searchAvailableLoadsResponse.routes = [];
    const loadsForRoutes: Load[][] = generateCombinations(preMapLoads);
    for (const loadsForRoute of loadsForRoutes) {
      if (loadsForRoute.length === 0) continue;
      const routeInfo: RouteInfo = {
        stopPoints: searchAvailableLoadDto.stopPoints,
        distance: 0,
        distanceUnit: loadsForRoute[0].distanceUnit,
        duration: 0,
        durationUnit: loadsForRoute[0].durationUnit,
        amount: 0,
        currency: loadsForRoute[0].currency,
        description: '',
        returnAt: '',
        deadhead: 0,
        directions: '',
        type: 'standard',
        loads: loadsForRoute,
        differInfo: null // for now
      };
      loadsForRoute.forEach(load => {
        routeInfo.distance += load.distance;
        routeInfo.duration += load.duration;
        routeInfo.amount += load.amount;
        routeInfo.deadhead += load.originDeadhead + load.destinationDeadhead;

        load.stopPoints.forEach(stopPoint => {
          stopPoint.radius /= 1.5;
        });
        if (this.isEnRouteLoad(load)) {
          routeInfo.type = 'enRoute';
        } else if (!this.isStandardLoad(load)) {
          routeInfo.type = 'notValidYet';
        }
      });
      if (routeInfo.type === 'enRoute') {
        searchAvailableLoadsResponse.routes.push(routeInfo);
      }
    }

    return searchAvailableLoadsResponse;
  }

  isStandardLoad(load: Load): boolean {
    // Todo: Need to compare unit, for now, just use miles
    const distance1 = Loc.kilometersToMiles(
      Loc.distance(load.pickupStop.coordinates, load.stopPoints[0].location.coordinate)
    );
    const distance2 = Loc.kilometersToMiles(
      Loc.distance(load.deliveryStop.coordinates, load.stopPoints[1].location.coordinate)
    );

    return distance1 < load.stopPoints[0].radius && distance2 < load.stopPoints[1].radius;
  }

  isEnRouteLoad(load: Load): boolean {
    return !this.isStandardLoad(load) && this.validateLoadIsBetween2Points(load);
  }

  async searchAvailableLoadCoyote(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[] | any> {
    const loads: Load[] = [];
    if (this.configService.get('broker.coyote.enabled')) {
      const input = this.coyoteInputTransformer.searchAvailableLoads(searchAvailableLoadDto);
      try {
        const coyoteLoads = await this.coyoteBrokerService.searchAvailableLoads(input);
        loads.push(...this.coyoteOutputTransformer.searchAvailableLoads(coyoteLoads));
      } catch (error) {
        Logging.error('[Load Service - Coyote] Search Available Loads got error', error);
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
        Logging.error('[Load Service - DAT] Search Available Loads got error', error);
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
          Logging.error('[Load Service - Truckstop] Search Available Loads got error', error);
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

  validateLoadByDeadheadMiles(load: Load): boolean {
    const deadheadMiles = load.originDeadhead + load.destinationDeadhead;
    let distance = 0;
    if (load.distance > 0) {
      distance = load.distance;
    } else {
      // Todo: count distance by mapbox (real route)
      distance = Loc.kilometersToMiles(Loc.distance(load.pickupStop.coordinates, load.deliveryStop.coordinates));
    }

    return deadheadMiles / distance < this.maximumDeadheadMilesRate;
  }

  validateLoadByMilesPerDay(load: Load): boolean {
    // Todo: count distance by mapbox (real route)
    const distance = Loc.kilometersToMiles(Loc.distance(load.pickupStop.coordinates, load.deliveryStop.coordinates));
    const hoursDifference = dayjs(load.stopPoints[1].stopDate.to).diff(dayjs(load.stopPoints[0].stopDate.from), 'hour');
    const milesPerDay = distance / hoursDifference / 24;

    return milesPerDay <= 600;
  }

  validateLoadIsBetween2Points(load: Load): boolean {
    const distance = Loc.kilometersToMiles(
      Loc.distance(load.stopPoints[0].location.coordinate, load.stopPoints[1].location.coordinate)
    );

    const distanceFromPickupToDestination = Loc.kilometersToMiles(
      Loc.distance(load.pickupStop.coordinates, load.stopPoints[1].location.coordinate)
    );
    const distanceFromOriginToDelivery = Loc.kilometersToMiles(
      Loc.distance(load.deliveryStop.coordinates, load.stopPoints[0].location.coordinate)
    );

    return distanceFromPickupToDestination < distance && distanceFromOriginToDelivery < distance;
  }

  async test(input?: any): Promise<any> {
    const assetQuery = await this.datBrokerService.createAssetQuery(input);
    const res = await this.datBrokerService.retrieveAssetQueryResults(assetQuery.queryId);

    return res;
  }
}

function generateCombinations(preMapLoads: Load[][]): Load[][] {
  const finalResults: Load[][] = [];

  function generateCombinationHelper(currentCombination: Load[], index: number): void {
    if (index === preMapLoads.length) {
      finalResults.push([...currentCombination]);

      return;
    }

    // Check if the current array is not empty
    if (preMapLoads[index].length === 0) {
      generateCombinationHelper(currentCombination, index + 1);

      return;
    }

    for (const load of preMapLoads[index]) {
      currentCombination.push(load);
      generateCombinationHelper(currentCombination, index + 1);
      currentCombination.pop();
    }
  }

  generateCombinationHelper([], 0);

  return finalResults;
}
