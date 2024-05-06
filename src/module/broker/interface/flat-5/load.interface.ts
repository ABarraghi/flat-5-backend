import * as dayjs from 'dayjs';
import { ApiBrokers } from '@module/broker/interface/flat-5/common.interface';
import { StopPointDto } from '@module/load/validation/search-available-load.dto';
import { CoyoteBookingStatusResponse, CoyoteLoadDetails, CoyoteStop } from '../coyote/coyote-response.interface';

export const DISTANCE_UNIT_DEFAULT = 'Miles';
export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

export type Stop = {
  address?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  postalCode?: string;
  coordinates?: GeoCoordinates;
  appointment?: {
    startTime?: string;
    endTime?: string;
  };
  notes?: string;
};

export class Load {
  loadId: string;
  loadDetails: CoyoteLoadDetails;
  stops: CoyoteStop[];
  keyByPoints: string;
  stopPoints: StopPointDto[];
  broker: ApiBrokers;
  pickupStop: Stop;
  deliveryStop: Stop;
  rate: number;
  deadHeadRate?: number;
  amount: number;
  currency: string;
  distance: number;
  driveDistance: number;
  flyDistance: number;
  distanceUnit: string;
  duration: number;
  durationUnit: 'seconds' | 'minutes' | 'hours';
  originDeadhead?: number;
  destinationDeadhead?: number;
  equipmentType: string;
  length: number;
  lengthUnit: string;
  height: number;
  heightUnit: string;
  width: number;
  widthUnit: string;
  weight: number;
  weightUnit: string;
  rawLoad: any;
  metadata?: any;
  brokerInfo: {
    broker: string;
    email?: string;
    phone?: string;
    fax?: string;
  };
  shipperInfo: {
    name?: string;
    email?: string;
    phone?: string;
    fax?: string;
  };
  type: 'standard' | 'enRoute' | 'invalid';
}

export class BookingLoad {
  bookingId: string;
  loadId: string;
  carrierId: string;
  broker: string;

  constructor(props: { loadId?: string; bookingId: string; carrierId?: string; broker?: string }) {
    this.loadId = props.loadId;
    this.bookingId = props.bookingId;
    this.carrierId = props.carrierId;
    this.broker = props.broker;
  }
}

export class RouteInfo {
  stopPoints: StopPointDto[];
  flyDistance?: number;
  driveDistance?: number;
  distance?: number;
  distanceUnit?: string;
  duration?: number;
  durationUnit?: string;
  amount?: number;
  currency?: string;
  description?: string;
  returnAt?: string;
  deadhead?: number;
  directions?: string;
  type: 'standard' | 'enRoute' | 'routeMyTruck' | 'notValidYet';
  differInfo?: {
    distance?: number;
    duration?: number;
    distanceUnit?: string;
    durationUnit?: string;
    amount?: number;
    currency?: string;
    description?: string;
    returnAt?: string;
    deadhead?: number;
    deadheadUnit?: string;
    directions?: string;
    brokers?: string[];
  };
  loads?: Load[];
}

export class SearchAvailableLoadsResponse {
  routes?: RouteInfo[];
  metadata?: any;
}

export class FindLoadContextOptions {
  stopPoints: StopPointDto[];
  numberOfDays?: number;
  maxDistance?: number;
  remainingDistance?: number;
  remainingDays?: number;
  isLastStop?: boolean;
  loadKeyByPoints?: string;
  totalDistance?: number;
  totalDays?: number;
}

export class FindLoadContext {
  stopPoints: StopPointDto[];
  numberOfDays: number;
  maxDistance: number;
  remainingDistance: number;
  remainingDays: number;
  isLastStop: boolean;
  loadKeyByPoints: string;
  totalDistance: number;
  totalDays: number;

  constructor(props: FindLoadContextOptions) {
    this.stopPoints = props.stopPoints;
    this.numberOfDays =
      props.numberOfDays ?? dayjs(this.stopPoints[1].stopDate.to).diff(dayjs(this.stopPoints[0].stopDate.from), 'day');
    this.maxDistance = props.maxDistance ?? this.numberOfDays * 600;
    this.remainingDistance = props.remainingDistance ?? this.maxDistance;
    this.remainingDays = props.remainingDays ?? this.numberOfDays;
    this.isLastStop = props.isLastStop ?? false;
    this.loadKeyByPoints = props.loadKeyByPoints ?? null;
    this.totalDistance = props.totalDistance ?? 0;
    this.totalDays = props.totalDays ?? 0;
  }
}

export class LinkedLoad {
  current: Load;
  next: LinkedLoad[];
}

export class BookingStatus {
  loadId: number;
  carrierId: number;
  status: 'InProgress' | 'Booked' | 'Failed';
  validationMessages: string[];

  constructor(props: CoyoteBookingStatusResponse) {
    this.loadId = props.loadId;
    this.carrierId = props.carrierId;
    this.status = props.status;
    this.validationMessages = props.validationMessages;
  }
}
