import { ApiBrokers } from '@module/transform-layer/interface/flat-5/common.interface';

export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

export type Stop = {
  address: any;
  coordinates: GeoCoordinates;
  appointment: {
    appointmentStartDateTimeUtc: string;
    appointmentEndDateTimeUtc: string;
  };
};

export class LoadInterface {
  broker: ApiBrokers;
  loadId: string;
  pickupStop: Stop;
  deliveryStop: Stop;
}

export class BookingLoad {
  constructor(props: {
    loadId?: string;
    bookingId: string;
    carrierId?: string;
    broker?: string;
  }) {
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
