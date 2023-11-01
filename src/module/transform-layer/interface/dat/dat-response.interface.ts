export type DATGetOrganizationTokenResponse = {
  expiresWhen: string;
  accessToken: string;
};
export type DATGetUserTokenResponse = {
  expiresWhen: string;
  accessToken: string;
};

export type DATQueryCriteria = {
  lane: {
    assetType: string;
    equipment: {
      types: string[];
      classes?: string[];
    };
    origin: {
      place: {
        city: string;
        stateProv: string;
        latitude: number;
        longitude: number;
        county?: string;
        postalCode?: string;
      };
      area?: {
        states: string[];
        zones: string[];
      };
      open?: Record<string, never>;
      knownPlaceId?: number;
    };
    destination: {
      place: {
        city: string;
        stateProv: string;
        latitude: number;
        longitude: number;
        county?: string;
        postalCode?: string;
      };
      area?: {
        states: string[];
        zones: string[];
      };
      open?: Record<string, never>;
      knownPlaceId?: number;
    };
  };
  maxAgeMinutes: number;
  maxOriginDeadheadMiles: number;
  maxDestinationDeadheadMiles: number;
  availability: {
    earliestWhen: string;
    latestWhen: string;
  };
  capacity: {
    shipment?: {
      fullPartial: string;
      maximumLengthFeet: number;
      maximumWeightPounds: number;
    };
    truck?: {
      fullPartial: string;
      availableLengthFeet: number;
      availableWeightPounds: number;
    };
  };
  audience: {
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
  carrierHomeStates?: string[];
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
  origin: {
    city: string;
    stateProv: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    area: DATOriginArea;
  };
  capacity: DATCapacity;
};

export type DATAvailability = {
  earliestWhen: string;
  latestWhen: string;
};

export type DATTripLength = {
  miles: number;
  method: string;
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
};

export type DATRetrieveAssetsResponse = {
  matchCounts: DATMatchCounts;
  matches: DATMatchResponse[];
};
