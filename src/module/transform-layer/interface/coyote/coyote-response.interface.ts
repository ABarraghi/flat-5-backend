export type CoyoteGeoCoordinates = {
  latitude: number;
  longitude: number;
};

export type CoyoteAddress = {
  line1: string;
  line2: string | null;
  line3: string | null;
  postalCode: string;
  cityName: string;
  stateProvinceCode: string;
  countryCode: string;
};

export type CoyoteDateTimeUtc = string; // You can use a more specific type for date/time if needed

export type CoyoteCurrency = {
  value: number;
  currencyType: string;
};

export type CoyoteWeight = {
  value: number;
  unit: string;
};

export type CoyoteCommodity = {
  description: string;
  weight: CoyoteWeight;
};

export type CoyoteAppointment = {
  facilityOpenDateTimeUtc: CoyoteDateTimeUtc;
  facilityCloseDateTimeUtc: CoyoteDateTimeUtc;
  appointmentStartDateTimeUtc: CoyoteDateTimeUtc;
  appointmentEndDateTimeUtc: CoyoteDateTimeUtc;
};

export type CoyoteFacility = {
  name: string;
  address: CoyoteAddress;
  geoCoordinates: CoyoteGeoCoordinates;
  timeZoneOffset: string;
};

export type CoyoteStopDetails = {
  commodities: CoyoteCommodity[];
  stopAttributes: Record<string, boolean>; // Use a more specific type if possible
  stopNotes: string | null;
  workType: string;
  genericAttributes: string[]; // Use a more specific type if possible
};

type CoyoteStop = {
  sequence: number;
  stopType: string;
  facility: CoyoteFacility;
  appointment: CoyoteAppointment;
  stopDetails: CoyoteStopDetails;
};

export type CoyoteLoadAttributes = Record<string, boolean>; // Use a more specific type if possible

export type CoyoteEquipmentAttribute = {
  value: number;
  unit: string;
};

export type CoyoteEquipment = {
  equipmentHeight: CoyoteEquipmentAttribute;
  equipmentLength: CoyoteEquipmentAttribute;
  equipmentType: string;
  equipmentWidth: CoyoteEquipmentAttribute;
  equipmentAttributes: CoyoteLoadAttributes;
  genericAttributes: string[]; // Use a more specific type if possible
};

export type CoyoteLoadDistance = {
  value: number;
  unit: string;
};

type Temperature = {
  value: number;
  unit: string;
};

export type CoyoteLoadDetails = {
  rate: CoyoteCurrency;
  mode: string;
  equipment: CoyoteEquipment;
  loadDistance: CoyoteLoadDistance;
  weight: CoyoteWeight;
  temperatureSettings: {
    preCoolTemperature: Temperature;
    maximumTemperature: Temperature;
    minimumTemperature: Temperature;
  };
  loadAttributes: CoyoteLoadAttributes;
  genericAttributes: string[]; // Use a more specific type if possible
};

export type CoyoteLoad = {
  loadId: number;
  loadDetails?: CoyoteLoadDetails;
  stops?: CoyoteStop[];
};

export type CoyoteAuthenticationResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type CoyoteSearchLoadResponse = {
  loads: CoyoteLoad[];
};

export type CoyoteLoadDetailResponse = CoyoteLoad;
