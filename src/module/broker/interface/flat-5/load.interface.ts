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
