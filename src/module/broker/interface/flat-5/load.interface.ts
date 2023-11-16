import { ApiBrokers } from '@module/broker/interface/flat-5/common.interface';

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
};

export class Load {
  broker: ApiBrokers;
  loadId: string;
  pickupStop: Stop;
  deliveryStop: Stop;
  rate: number;
  deadheadRate?: number;
  amount: number;
  currency: string;
  distance: number;
  distanceUnit: string;
  duration: number;
  durationUnit: 'seconds' | 'minutes' | 'hours';
  originDeadhead?: number;
  destinationDeadhead?: number;
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
}

export class BookingLoad {
  constructor(props: { loadId?: string; bookingId: string; carrierId?: string; broker?: string }) {
    this.loadId = props.loadId;
    this.bookingId = props.bookingId;
    this.carrierId = props.carrierId;
    this.broker = props.broker;
  }

  bookingId: string;
  loadId: string;
  carrierId: string;
  broker: string;
}

export class RouteInfo {
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
  type: 'standard' | 'enRoute' | 'routeMyTrucks';
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