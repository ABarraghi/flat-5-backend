import { ApiBrokers } from '@module/broker/interface/flat-5/common.interface';

export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

export type Stop = {
  address?: any;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: GeoCoordinates;
  appointment?: {
    startTime?: string;
    endTime?: string;
  };
};

export class LoadInterface {
  broker: ApiBrokers;
  loadId: string;
  pickupStop: Stop;
  deliveryStop: Stop;
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
