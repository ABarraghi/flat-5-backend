import { Injectable } from '@nestjs/common';
import { SearchAvailableLoadDto, StopPointDto } from '@module/load/validation/search-available-load.dto';
import { ConfigService } from '@nestjs/config';
import { CoyoteBrokerService } from '@module/broker/coyote/coyote-broker.service';
import {
  FindLoadContext,
  LinkedLoad,
  Load,
  RouteInfo,
  SearchAvailableLoadsResponse
} from '@module/broker/interface/flat-5/load.interface';
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
  count = 0;
  defaultRadius = 100;

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

  async searchAvailableLoadsBetween2Points(
    searchAvailableLoadDto: SearchAvailableLoadDto,
    loadKeyByPoints: string = null
  ): Promise<Load[] | any> {
    if (searchAvailableLoadDto.stopPoints.length > 2) {
      searchAvailableLoadDto.stopPoints = searchAvailableLoadDto.stopPoints.slice(0, 2);
    }
    if (!loadKeyByPoints) {
      loadKeyByPoints =
        searchAvailableLoadDto.stopPoints[0].location.coordinates.latitude.toString() +
        '_' +
        searchAvailableLoadDto.stopPoints[0].location.coordinates.longitude.toString() +
        '_' +
        searchAvailableLoadDto.stopPoints[1].location.coordinates.latitude.toString() +
        '_' +
        searchAvailableLoadDto.stopPoints[1].location.coordinates.longitude.toString();
    }
    const loads: Load[] = [];
    let brokers = [];
    if (searchAvailableLoadDto.brokers) {
      if (searchAvailableLoadDto.brokers.includes('coyote')) {
        brokers.push(this.searchAvailableLoadCoyote(searchAvailableLoadDto));
      }
      if (searchAvailableLoadDto.brokers.includes('dat')) {
        brokers.push(this.searchAvailableLoadDat(searchAvailableLoadDto));
      }
      if (searchAvailableLoadDto.brokers.includes('truck_stop')) {
        brokers.push(this.searchAvailableLoadTruckStop(searchAvailableLoadDto));
      }
    } else {
      brokers = [
        this.searchAvailableLoadCoyote(searchAvailableLoadDto),
        this.searchAvailableLoadDat(searchAvailableLoadDto),
        this.searchAvailableLoadTruckStop(searchAvailableLoadDto)
      ];
    }
    const [coyoteLoads, datLoads, truckStopLoads] = await Promise.all(brokers);
    loads.push(...(coyoteLoads ?? []), ...(datLoads ?? []), ...(truckStopLoads ?? []));
    loads.forEach(load => {
      load.keyByPoints = loadKeyByPoints;
      load.stopPoints = searchAvailableLoadDto.stopPoints.slice();
    });

    return loads;
  }

  async searchAvailableLoads(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[][] | any> {
    const loadsInEachDistance: Load[][] = [];
    for (let i = 0; i < searchAvailableLoadDto.stopPoints.length - 1; i++) {
      if (!searchAvailableLoadDto.stopPoints[i].hadLoad) {
        const stopPoints = [searchAvailableLoadDto.stopPoints[i], searchAvailableLoadDto.stopPoints[i + 1]];
        const loads = await this.searchAvailableLoadsBetween2Points({
          ...searchAvailableLoadDto,
          stopPoints
        });

        loadsInEachDistance.push(loads);
      }
    }

    return loadsInEachDistance;
  }

  async searchStandard(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<SearchAvailableLoadsResponse | any> {
    const searchAvailableLoadsResponse = new SearchAvailableLoadsResponse();
    searchAvailableLoadsResponse.routes = [];

    const loadsInEachDistance: Load[][] = await this.searchAvailableLoads(searchAvailableLoadDto);
    let validLoadsInEachDistance = loadsInEachDistance;
    if (!searchAvailableLoadDto.isReturnOrigin) {
      validLoadsInEachDistance = this.filterLoadsForStandardSearching(loadsInEachDistance);
    }

    const routes: RouteInfo[] = [];
    const loadsForRoutes: Load[][] = generateCombinations(validLoadsInEachDistance);
    for (const loadsForRoute of loadsForRoutes) {
      if (loadsForRoute.length === 0) continue;
      const routeInfo: RouteInfo = {
        stopPoints: searchAvailableLoadDto.stopPoints,
        flyDistance: 0,
        driveDistance: 0,
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
      for (let i = 0; i < searchAvailableLoadDto.stopPoints.length; i++) {
        if (searchAvailableLoadDto.stopPoints[i + 1]) {
          routeInfo.flyDistance += Loc.distanceInMiles(
            searchAvailableLoadDto.stopPoints[i].location.coordinates,
            searchAvailableLoadDto.stopPoints[i + 1].location.coordinates
          );
        }
      }
      loadsForRoute.forEach(load => {
        routeInfo.driveDistance +=
          load.destinationDeadhead + load.destinationDeadhead + load.driveDistance ?? load.flyDistance ?? 0;
        routeInfo.distance += routeInfo.driveDistance || routeInfo.flyDistance;
        routeInfo.duration += load.duration;
        routeInfo.amount += load.amount;
        routeInfo.deadhead += load.originDeadhead + load.destinationDeadhead;
      });
      routes.push(routeInfo);
    }

    searchAvailableLoadsResponse.routes = routes;

    return searchAvailableLoadsResponse;
  }

  async searchEnRoute(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<SearchAvailableLoadsResponse | any> {
    const searchAvailableLoadsResponse = new SearchAvailableLoadsResponse();
    searchAvailableLoadsResponse.routes = [];

    searchAvailableLoadDto.stopPoints.forEach(stopPoint => {
      stopPoint.radius *= 1.7;
    });
    const loadsInEachDistance: Load[][] = await this.searchAvailableLoads(searchAvailableLoadDto);
    const reversedRadiusStopPoints = searchAvailableLoadDto.stopPoints.map(stopPoint => {
      stopPoint.radius /= 1.7;

      return stopPoint;
    });

    const loadsForRoutes: Load[][] = generateCombinations(loadsInEachDistance);
    for (const loadsForRoute of loadsForRoutes) {
      if (loadsForRoute.length === 0) continue;
      const routeInfo: RouteInfo = {
        stopPoints: searchAvailableLoadDto.stopPoints,
        flyDistance: 0,
        driveDistance: 0,
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

      for (let i = 0; i < searchAvailableLoadDto.stopPoints.length; i++) {
        if (searchAvailableLoadDto.stopPoints[i + 1]) {
          routeInfo.flyDistance += Loc.distanceInMiles(
            searchAvailableLoadDto.stopPoints[i].location.coordinates,
            searchAvailableLoadDto.stopPoints[i + 1].location.coordinates
          );
        }
      }
      loadsForRoute.forEach(load => {
        load.type = 'standard';
        // Todo: need to recalculate these distance
        routeInfo.driveDistance +=
          load.destinationDeadhead + load.destinationDeadhead + load.driveDistance ?? load.flyDistance ?? 0;
        routeInfo.distance += routeInfo.driveDistance || routeInfo.flyDistance;
        routeInfo.duration += load.duration;
        routeInfo.amount += load.amount;
        routeInfo.deadhead += load.originDeadhead + load.destinationDeadhead;
        load.stopPoints = reversedRadiusStopPoints;

        if (searchAvailableLoadDto.isReturnOrigin) {
          load.type = 'enRoute';
          routeInfo.type = 'enRoute';
        } else {
          if (this.isEnRouteLoad(load)) {
            load.type = 'enRoute';
            routeInfo.type = 'enRoute';
          } else if (!this.isStandardLoad(load)) {
            routeInfo.type = 'notValidYet';
            load.type = 'invalid';
          }
        }
      });
      if (routeInfo.type === 'enRoute') {
        // Should: double check this logic
        // distance is too long more than standard
        if (routeInfo.distance > routeInfo.flyDistance * 1.5) {
          continue;
        }
        searchAvailableLoadsResponse.routes.push(routeInfo);
      }
    }

    return searchAvailableLoadsResponse;
  }

  async findLoadsForRouteMyTruck(
    searchAvailableLoadDto: SearchAvailableLoadDto,
    findLoadContext?: FindLoadContext
  ): Promise<LinkedLoad[] | any> {
    if (!findLoadContext) {
      findLoadContext = new FindLoadContext({
        stopPoints: searchAvailableLoadDto.stopPoints,
        loadKeyByPoints:
          searchAvailableLoadDto.stopPoints[0].location.coordinates.latitude.toString() +
          '_' +
          searchAvailableLoadDto.stopPoints[0].location.coordinates.longitude.toString() +
          '_' +
          searchAvailableLoadDto.stopPoints[1].location.coordinates.latitude.toString() +
          '_' +
          searchAvailableLoadDto.stopPoints[1].location.coordinates.longitude.toString()
      });
    }
    const targetStopPoint = findLoadContext.stopPoints[1];
    const targetDate = dayjs(targetStopPoint.stopDate.to);
    const newSearchAvailableLoadDto = {
      ...searchAvailableLoadDto,
      stopPoints: [
        findLoadContext.stopPoints[0],
        findLoadContext.isLastStop
          ? findLoadContext.stopPoints[1]
          : {
              ...findLoadContext.stopPoints[1],
              isOpen: true
            }
      ]
    };
    const loads = await this.searchAvailableLoadsBetween2Points(newSearchAvailableLoadDto);
    const validLoads = loads.filter(load => {
      if (load.deliveryStop && load.deliveryStop.appointment && load.deliveryStop.appointment.endTime) {
        const deliveryDate = dayjs(load.deliveryStop.appointment.endTime);
        const remainingDays = targetDate.diff(deliveryDate, 'day');
        const remainingDistance = remainingDays * 600;

        const distanceToTargetPoint = Loc.distanceInMiles(
          targetStopPoint.location.coordinates,
          load.deliveryStop.coordinates
        );
        if (findLoadContext.isLastStop) {
          // less than 50 miles to go home

          return remainingDistance < 50;
        }

        return distanceToTargetPoint < remainingDistance;
      } else {
        // if (load.deliveryStop && load.deliveryStop.coordinates) {
        // just assuming that driver can drive 600 miles per day
        const distanceForThisLoad = load.originDeadhead + load.driveDistance + load.destinationDeadhead;
        const daysForThisLoad = Math.round(distanceForThisLoad / 600);
        const remainingDays = findLoadContext.remainingDays - daysForThisLoad;
        const remainingDistance = remainingDays * 600;

        const distanceToTargetPoint = Loc.distanceInMiles(
          targetStopPoint.location.coordinates,
          load.deliveryStop.coordinates
        );
        if (findLoadContext.isLastStop) {
          // less than 50 miles to go home

          return remainingDistance < 50;
        }

        return distanceToTargetPoint < remainingDistance;
      }
    });
    console.log(validLoads.length);
    let count = 0;
    const result = [];
    for (const load of validLoads) {
      const maxFor = searchAvailableLoadDto.brokers.includes('dat') ? 1 : 4;
      if (count > maxFor) {
        break;
      }
      count++;
      const nextLoads = new LinkedLoad();
      nextLoads.current = load;
      nextLoads.next = [];
      let next = [];
      const newStopPoint: StopPointDto = {
        location: {
          coordinates: load.deliveryStop.coordinates
        },
        radius: 100
      };
      let remainingDistance = 0;
      let remainingDays = 0;
      let newFindLoadContext = null;
      let deliveryDate = null;
      if (load.deliveryStop && load.deliveryStop.appointment && load.deliveryStop.appointment.endTime) {
        newStopPoint['stopDate'] = {
          from: load.deliveryStop.appointment.endTime,
          to: dayjs(load.deliveryStop.appointment.endTime).add(1, 'day').format()
        };
        deliveryDate = dayjs(load.deliveryStop.appointment.endTime);
        remainingDays = targetDate.diff(deliveryDate, 'day');
        remainingDistance = remainingDays * 600;
        newFindLoadContext = new FindLoadContext({
          ...findLoadContext,
          stopPoints: [newStopPoint, targetStopPoint],
          remainingDays: remainingDays,
          remainingDistance: remainingDistance
        });
      } else {
        // if (load.deliveryStop && load.deliveryStop.coordinates) {
        // just assuming that driver can drive 600 miles per day
        const distanceForThisLoad = load.originDeadhead + load.driveDistance + load.destinationDeadhead;
        const daysForThisLoad = Math.round(distanceForThisLoad / 600);
        const remainingDays = findLoadContext.remainingDays - daysForThisLoad;
        const remainingDistance = remainingDays * 600;
        newStopPoint.location.city = load.deliveryStop.city;
        newStopPoint.location.state = load.deliveryStop.state;
        newFindLoadContext = new FindLoadContext({
          ...findLoadContext,
          totalDistance: findLoadContext.totalDistance + distanceForThisLoad,
          totalDays: findLoadContext.totalDays + distanceForThisLoad,
          stopPoints: [newStopPoint, targetStopPoint],
          remainingDays: remainingDays,
          remainingDistance: remainingDistance
        });
      }
      next = await this.findLoadsForRouteMyTruck(searchAvailableLoadDto, newFindLoadContext);
      if (next && !next.length && !newFindLoadContext?.isLastStop) {
        newFindLoadContext.isLastStop = true;

        next = await this.findLoadsForRouteMyTruck(searchAvailableLoadDto, newFindLoadContext);
      }
      nextLoads.next = next;

      result.push(nextLoads);
    }

    return result;
  }

  async routeMyTruck(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[][] | any> {
    const searchAvailableLoadsResponse = new SearchAvailableLoadsResponse();
    this.count = 0;
    searchAvailableLoadDto.stopPoints.forEach(stopPoint => {
      stopPoint.radius = this.defaultRadius;
    });
    if (!searchAvailableLoadDto.brokers || searchAvailableLoadDto.brokers.length > 1) {
      searchAvailableLoadDto.brokers = ['coyote'];
    } else if (searchAvailableLoadDto.brokers.includes('truck_stop')) {
      return [];
    }
    const linkedLoads = await this.findLoadsForRouteMyTruck(searchAvailableLoadDto);

    function generatePaths(node: LinkedLoad, path: Load[] = []): Load[][] {
      path = path.concat(node.current);

      if (!node.next || node.next.length === 0) {
        return [path]; // Reached a leaf node, return the path
      }

      let paths: Load[][] = [];
      for (const child of node.next) {
        paths = paths.concat(generatePaths(child, path.slice())); // Recursively generate paths for each child
      }

      return paths;
    }

    if (!linkedLoads) {
      searchAvailableLoadsResponse.routes = [];

      return searchAvailableLoadsResponse;
    }
    const loadsForRoutes = linkedLoads.flatMap(linkedLoad => generatePaths(linkedLoad));

    const routes: RouteInfo[] = [];
    for (const loadsForRoute of loadsForRoutes) {
      if (loadsForRoute.length === 0) continue;
      const routeInfo: RouteInfo = {
        stopPoints: searchAvailableLoadDto.stopPoints,
        flyDistance: 0,
        driveDistance: 0,
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
        type: 'routeMyTruck',
        loads: loadsForRoute,
        differInfo: null // for now
      };
      for (let i = 0; i < searchAvailableLoadDto.stopPoints.length; i++) {
        if (searchAvailableLoadDto.stopPoints[i + 1]) {
          routeInfo.flyDistance += Loc.distanceInMiles(
            searchAvailableLoadDto.stopPoints[i].location.coordinates,
            searchAvailableLoadDto.stopPoints[i + 1].location.coordinates
          );
        }
      }
      loadsForRoute.forEach(load => {
        load.type = 'routeMyTruck';
        routeInfo.driveDistance +=
          load.destinationDeadhead + load.destinationDeadhead + load.driveDistance ?? load.flyDistance ?? 0;
        routeInfo.distance += routeInfo.driveDistance || routeInfo.flyDistance;
        routeInfo.duration += load.duration;
        routeInfo.amount += load.amount;
        routeInfo.deadhead += load.originDeadhead + load.destinationDeadhead;
      });
      routes.push(routeInfo);
    }
    searchAvailableLoadsResponse.routes = routes;

    return searchAvailableLoadsResponse;
  }

  isInsideSearchingRadius(load: Load): boolean {
    // Todo: Need to compare unit, for now, just use miles
    const distance1 = Loc.distanceInMiles(load.pickupStop.coordinates, load.stopPoints[0].location.coordinates);
    const distance2 = Loc.distanceInMiles(load.deliveryStop.coordinates, load.stopPoints[1].location.coordinates);

    return distance1 < load.stopPoints[0].radius && distance2 < load.stopPoints[1].radius;
  }

  isStandardLoad(load: Load): boolean {
    return (
      this.isInsideSearchingRadius(load) &&
      this.validateLoadByDeadheadMiles(load) &&
      this.validateLoadByMilesPerDay(load)
    );
  }

  isEnRouteLoad(load: Load): boolean {
    return !this.isInsideSearchingRadius(load) && this.validateLoadIsBetween2Points(load);
  }

  async searchAvailableLoadCoyote(searchAvailableLoadDto: SearchAvailableLoadDto): Promise<Load[] | any> {
    const loads: Load[] = [];
    if (this.configService.get('broker.coyote.enabled')) {
      const input = this.coyoteInputTransformer.searchAvailableLoads(searchAvailableLoadDto);
      try {
        const coyoteLoads = await this.coyoteBrokerService.searchAvailableLoads(input);
        loads.push(...this.coyoteOutputTransformer.searchAvailableLoads(coyoteLoads, searchAvailableLoadDto));
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

        loads.push(...this.datOutputTransformer.searchAvailableLoads(datMatches, searchAvailableLoadDto));
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

          loads.push(
            ...(await this.truckStopOutputTransformer.searchAvailableLoads(truckStopLoads, searchAvailableLoadDto))
          );
        } catch (error) {
          Logging.error('[Load Service - Truckstop] Search Available Loads got error', error);
        }
      }
    }

    return loads;
  }

  filterLoadsForStandardSearching(loadsInEachDistance: Load[][]): Load[][] {
    // filter loads not valid for standard
    let validLoadsInEachDistance: Load[][] = [];
    for (const loadsInDistance of loadsInEachDistance) {
      const validLoadsInDistance = loadsInDistance.filter(load => {
        return loadsInDistance.length && this.isStandardLoad(load);
      });
      if (validLoadsInDistance.length) {
        validLoadsInEachDistance.push(validLoadsInDistance);
      } else {
        // if not have any valid loads in this distance => no route
        validLoadsInEachDistance = [];
        break;
      }
    }

    return validLoadsInEachDistance;
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
    distance = Loc.kilometersToMiles(
      Loc.distance(load.stopPoints[0].location.coordinates, load.stopPoints[1].location.coordinates)
    );

    return deadheadMiles / distance < this.maximumDeadheadMilesRate;
  }

  validateLoadByMilesPerDay(load: Load): boolean {
    // Todo: count distance by mapbox (real route)
    const distance = Loc.kilometersToMiles(
      Loc.distance(load.stopPoints[0].location.coordinates, load.stopPoints[1].location.coordinates)
    );
    const hoursDifference = dayjs(load.stopPoints[1].stopDate.from).diff(dayjs(load.stopPoints[0].stopDate.to), 'hour');
    const milesPerDay = (distance / hoursDifference) * 24;

    return milesPerDay <= 600;
  }

  validateLoadIsBetween2Points(load: Load): boolean {
    const distance = Loc.distanceInMiles(
      load.stopPoints[0].location.coordinates,
      load.stopPoints[1].location.coordinates
    );

    const distanceFromPickupToDestination = Loc.distanceInMiles(
      load.pickupStop.coordinates,
      load.stopPoints[1].location.coordinates
    );
    const distanceFromOriginToDelivery = Loc.distanceInMiles(
      load.deliveryStop.coordinates,
      load.stopPoints[0].location.coordinates
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
