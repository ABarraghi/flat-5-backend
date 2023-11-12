export type DATGetOrganizationTokenResponse = {
  expiresWhen: string;
  accessToken: string;
};
export type DATGetUserTokenResponse = {
  expiresWhen: string;
  accessToken: string;
};

export type DATEquipmentType =
  | 'AC'
  | 'C'
  | 'CI'
  | 'CR'
  | 'DD'
  | 'LA'
  | 'DT'
  | 'F'
  | 'FA'
  | 'BT'
  | 'F2'
  | 'FZ'
  | 'FH'
  | 'MX'
  | 'FS'
  | 'FT'
  | 'FM'
  | 'FD'
  | 'FR'
  | 'HB'
  | 'LB'
  | 'MV'
  | 'NU'
  | 'PO'
  | 'R'
  | 'RA'
  | 'R2'
  | 'RZ'
  | 'RN'
  | 'RL'
  | 'RM'
  | 'RG'
  | 'SD'
  | 'ST'
  | 'TA'
  | 'TN'
  | 'TS'
  | 'TT'
  | 'V'
  | 'VA'
  | 'VS'
  | 'VC'
  | 'V2'
  | 'VZ'
  | 'VH'
  | 'VI'
  | 'VN'
  | 'VG'
  | 'VL'
  | 'OT'
  | 'VB'
  | 'V3'
  | 'VV'
  | 'VM'
  | 'VT'
  | 'VF'
  | 'VR'
  | 'IR'
  | 'RV'
  | 'FC'
  | 'RP'
  | 'VW'
  | 'LR'
  | 'VP'
  | 'SR'
  | 'CV'
  | 'FO'
  | 'LO'
  | 'CN'
  | 'FN'
  | 'SN'
  | 'SB';

export type DATEquipmentClass = 'B' | 'C' | 'D' | 'F' | 'K' | 'N' | 'O' | 'R' | 'S' | 'T' | 'V' | 'Z';

export type DATState =
  | 'AB'
  | 'AG'
  | 'AK'
  | 'AL'
  | 'AS'
  | 'AZ'
  | 'AR'
  | 'BC'
  | 'BJ'
  | 'BS'
  | 'CA'
  | 'CH'
  | 'CI'
  | 'CL'
  | 'CO'
  | 'CP'
  | 'CT'
  | 'CU'
  | 'DC'
  | 'DE'
  | 'DF'
  | 'DG'
  | 'EM'
  | 'FL'
  | 'GA'
  | 'GJ'
  | 'GR'
  | 'GU'
  | 'HG'
  | 'HI'
  | 'IA'
  | 'ID'
  | 'IL'
  | 'IN'
  | 'JA'
  | 'KS'
  | 'KY'
  | 'LA'
  | 'MA'
  | 'MB'
  | 'MD'
  | 'ME'
  | 'MH'
  | 'MI'
  | 'MN'
  | 'MO'
  | 'MR'
  | 'MS'
  | 'MT'
  | 'NA'
  | 'NB'
  | 'NC'
  | 'ND'
  | 'NE'
  | 'NF'
  | 'NH'
  | 'NJ'
  | 'NL'
  | 'NM'
  | 'NY'
  | 'NT'
  | 'NS'
  | 'NU'
  | 'NV'
  | 'OA'
  | 'OH'
  | 'OK'
  | 'ON'
  | 'OR'
  | 'PA'
  | 'PE'
  | 'PQ'
  | 'PR'
  | 'PU'
  | 'QA'
  | 'QR'
  | 'RI'
  | 'SC'
  | 'SD'
  | 'SI'
  | 'SK'
  | 'SL'
  | 'SO'
  | 'TA'
  | 'TL'
  | 'TM'
  | 'TN'
  | 'TX'
  | 'UT'
  | 'VA'
  | 'VI'
  | 'VL'
  | 'VT'
  | 'WA'
  | 'WV'
  | 'WI'
  | 'WY'
  | 'YC'
  | 'YT'
  | 'ZT';

export type DATZone = 'Z0' | 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6' | 'Z7' | 'Z8' | 'Z9' | 'ZC' | 'ZE' | 'ZW' | 'ZM';

export type DATPlace = {
  city?: string;
  stateProv?: DATState;
  latitude?: number;
  longitude?: number;
  county?: string;
  postalCode?: string;
};

export type DATQueryCriteria = {
  lane: {
    assetType: string;
    equipment: {
      types?: DATEquipmentType[];
      classes?: DATEquipmentClass[];
    };
    origin: {
      place?: DATPlace;
      area?: {
        states: DATState[];
        zones: DATZone[];
      };
      open?: Record<string, never>;
      knownPlaceId?: number;
    };
    destination: {
      place?: DATPlace;
      area?: {
        states: string[];
        zones: string[];
      };
      open?: Record<string, never>;
      knownPlaceId?: number;
    };
  };
  maxAgeMinutes?: number;
  maxOriginDeadheadMiles?: number;
  maxDestinationDeadheadMiles?: number;
  availability?: {
    earliestWhen: string;
    latestWhen: string;
  };
  capacity?: {
    shipment?: {
      fullPartial: string;
      maximumLengthFeet?: number;
      maximumWeightPounds?: number;
    };
    truck?: {
      fullPartial: string;
      availableLengthFeet: number;
      availableWeightPounds: number;
    };
  };
  audience?: {
    includePrivateNetwork: boolean;
    includeLoadBoard: boolean;
  };
  includeOnlyBookable?: boolean;
  includeOnlyHasLength?: boolean;
  includeOnlyHasWeight?: boolean;
  includeOnlyQuickPayable?: boolean;
  includeOnlyFactorable?: boolean;
  includeOnlyAssurable?: boolean;
  includeOnlyNegotiable?: boolean;
  includeOnlyTrackable?: boolean;
  includeTrackableTypes?: string[];
  excludeForeignAssets?: boolean;
  preferredBlockedFilter?: string;
  carrierHomeStates?: DATState[];
  countsOnly?: boolean;
  includeOpenDestinationTrucks?: boolean;
  includeRanked?: boolean;
  includeOnlyTrackingRequired?: string;
  includeCompanies?: string[];
  excludeCompanies?: string[];
};

export type DATDelivery = {
  notify: boolean;
};

export type DATStatus = {
  isLive: boolean;
  isCurrentlySendingLiveMatchNotifications: boolean;
  createdWhen: string;
  lastModifiedWhen: string;
  expiresWhen: string;
  cancelledWhen: string;
  deletedWhen: string;
  owner: {
    userId: number;
  };
};

export type DATDefinition = {
  criteria: DATQueryCriteria;
  delivery: DATDelivery;
};

export type DATQueryResponse = {
  queryId: string;
  definition: DATDefinition;
  status: DATStatus;
};

export type DATQueriesResponse = DATQueryResponse[];

export type DATMatchCounts = {
  preferred: number;
  blocked: number;
  normal: number;
  maxViewable: number;
  privateNetwork: number;
  matchesRemaining: number;
};

export type DATOriginArea = {
  states: string[];
};

export type DATCapacity = {
  truck: {
    fullPartial: string;
    availableLengthFeet: number;
    availableWeightPounds: number;
  };
};

export type DATMatchingAssetInfo = {
  matchingPostingId: string;
  assetType: string;
  equipmentType: string;
  origin: DATPlace;
  destination: {
    place?: DATPlace;
    area?: DATOriginArea;
  };
  capacity: DATCapacity;
};

export type DATAvailability = {
  earliestWhen: string;
  latestWhen: string;
};

export type DATTripLength = {
  miles: number;
  method: 'AIR' | 'ROAD';
};

export type DATPosterContact = {
  phone: string;
};

export type DATPosterInfo = {
  userId: number;
  companyName: string;
  city: string;
  state: string;
  carrierHomeState: string;
  contact: DATPosterContact;
  registryLookupId: string;
  preferredContactMethod: string;
  hasTiaMembership: boolean;
  preferredBlockedStatus: string;
};

export type DATMatchResponse = {
  matchId: string;
  matchingAssetInfo: DATMatchingAssetInfo;
  availability: DATAvailability;
  comments: string;
  originDeadheadMiles: DATTripLength;
  destinationDeadheadMiles: DATTripLength;
  tripLength: DATTripLength;
  isFromPrivateNetwork: boolean;
  isBookable: boolean;
  isQuickPayable: boolean;
  isFactorable: boolean;
  isAssurable: boolean;
  isNegotiable: boolean;
  servicedWhen: string;
  relevanceScore: number;
  posterInfo: DATPosterInfo;
  postingId: string;
  postingExpiresWhen: string;
  isActive: boolean;
  howTrackable: string[];
  loadBoardRateInfo: {
    bookable?: {
      rateUsd: number;
      basis: 'FLAT' | 'PER_MILE';
    };
    nonBookable?: {
      rateUsd: number;
      basis: 'FLAT' | 'PER_MILE';
    };
  };
};

export type DATRetrieveAssetsResponse = {
  matchCounts: DATMatchCounts;
  matches: DATMatchResponse[];
};
