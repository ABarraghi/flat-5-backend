import { ApiBrokers } from '@module/broker/interface/flat-5/common.interface';
import { StopPointDto } from '@module/load/validation/search-available-load.dto';

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
  keyByPoints: string;
  stopPoints: StopPointDto[];
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
  stopPoints: StopPointDto[];
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
  type: 'standard' | 'enRoute' | 'routeMyTrucks' | 'notValidYet';
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
