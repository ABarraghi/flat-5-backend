export type TruckStopDeliveryAddressInfo = {
  originCity: string;
  originCountry: string;
  originState: string;
  destinationCity: string;
  destinationCountry: string;
  destinationState: string;
};

export type TruckStopDeliveryAddressInfoResponse = {
  originalCoordinates?: number[];
  originalPlaceName?: string;
  destinationCoordinates?: number[];
  destinationPlaceName?: string;
  estimationDistance?: number;
  estimationDurations?: number;
  estimationAmount?: number;
};

export type TruckStopLoad = {
  Age: string;
  Bond: string;
  BondTypeID: string;
  Credit: string;
  DOTNumber: string;
  DeletedId: string;
  DeliveryDate: string;
  DeliveryTime: string;
  DestinationCity: string;
  DestinationCountry: string;
  DestinationDistance: string;
  DestinationState: string;
  DestinationZip: {
    nil: string;
  };
  Distance: string;
  Entered: string;
  Equipment: string;
  EquipmentOptions: {
    'xmlns:b': string;
  };
  EquipmentTypes: {
    'xmlns:b': string;
    Category: string;
    CategoryId: string;
    Code: string;
    Description: string;
    FullLoad: {
      nil: string;
    };
    Id: string;
    IsCategorizable: string;
    IsCombo: string;
    IsTruckPost: string;
    MapToId: string;
    RequiredOption: {
      nil: string;
    };
    WebserviceOnly: string;
  };
  ExperienceFactor: string;
  FuelCost: string;
  HandleName: string;
  HasBonding: string;
  ID: string;
  IsDeleted: string;
  IsFriend: string;
  Length: string;
  LoadType: string;
  MCNumber: string;
  Mileage: string;
  OriginCity: string;
  OriginCountry: string;
  OriginDistance: string;
  OriginState: string;
  PaymentAmount: string;
  PickupDate: string;
  PickupTime: string;
  PointOfContact: string;
  PointOfContactPhone: string;
  PricePerGallon: string;
  Quantity: string;
  SpecInfo: string;
  Stops: string;
  TMCNumber: string;
  TruckCompanyCity: string;
  TruckCompanyEmail: string;
  TruckCompanyFax: string;
  TruckCompanyId: string;
  TruckCompanyName: string;
  TruckCompanyPhone: string;
  TruckCompanyState: string;
  Weight: string;
  Width: string;
} & TruckStopDeliveryAddressInfoResponse;

export type TruckStopAuthenticationResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type TruckStopSearchLoadResponse = {
  loads: TruckStopLoad[];
};

export type TruckStopLoadDetailResponse = TruckStopLoad;
