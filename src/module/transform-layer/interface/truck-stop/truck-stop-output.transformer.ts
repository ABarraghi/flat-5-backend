export type TruckStopGeoCoordinates = {
  latitude: number;
  longitude: number;
};

export type TruckStopAddress = {
  line1: string;
  line2: string | null;
  line3: string | null;
  postalCode: string;
  cityName: string;
  stateProvinceCode: string;
  countryCode: string;
};

export type TruckStopDateTimeUtc = string; // You can use a more specific type for date/time if needed

export type TruckStopCurrency = {
  value: number;
  currencyType: string;
};

export type TruckStopWeight = {
  value: number;
  unit: string;
};

export type TruckStopCommodity = {
  description: string;
  weight: TruckStopWeight;
};

export type TruckStopAppointment = {
  facilityOpenDateTimeUtc: TruckStopDateTimeUtc;
  facilityCloseDateTimeUtc: TruckStopDateTimeUtc;
  appointmentStartDateTimeUtc: TruckStopDateTimeUtc;
  appointmentEndDateTimeUtc: TruckStopDateTimeUtc;
};

export type TruckStopFacility = {
  name: string;
  address: TruckStopAddress;
  geoCoordinates: TruckStopGeoCoordinates;
  timeZoneOffset: string;
};

export type TruckStopStopDetails = {
  commodities: TruckStopCommodity[];
  stopAttributes: Record<string, boolean>; // Use a more specific type if possible
  stopNotes: string | null;
  workType: string;
  genericAttributes: string[]; // Use a more specific type if possible
};

type TruckStopStop = {
  sequence: number;
  stopType: string;
  facility: TruckStopFacility;
  appointment: TruckStopAppointment;
  stopDetails: TruckStopStopDetails;
};

export type TruckStopLoadAttributes = Record<string, boolean>; // Use a more specific type if possible

export type TruckStopEquipmentAttribute = {
  value: number;
  unit: string;
};

export type TruckStopEquipment = {
  equipmentHeight: TruckStopEquipmentAttribute;
  equipmentLength: TruckStopEquipmentAttribute;
  equipmentType: string;
  equipmentWidth: TruckStopEquipmentAttribute;
  equipmentAttributes: TruckStopLoadAttributes;
  genericAttributes: string[]; // Use a more specific type if possible
};

export type TruckStopLoadDistance = {
  value: number;
  unit: string;
};

type Temperature = {
  value: number;
  unit: string;
};

export type TruckStopLoadDetails = {
  rate: TruckStopCurrency;
  mode: string;
  equipment: TruckStopEquipment;
  loadDistance: TruckStopLoadDistance;
  weight: TruckStopWeight;
  temperatureSettings: {
    preCoolTemperature: Temperature;
    maximumTemperature: Temperature;
    minimumTemperature: Temperature;
  };
  loadAttributes: TruckStopLoadAttributes;
  genericAttributes: string[]; // Use a more specific type if possible
};

export type TruckStopLoad = {
  loadId: number;
  loadDetails: TruckStopLoadDetails;
  s;
  stops: TruckStopStop[];
};

export type TruckStopAuthenticationResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type TruckStopSearchLoadResponse = {
  loads: TruckStopLoad[];
};

export type TruckStopLoadDetailResponse = TruckStopLoad;
