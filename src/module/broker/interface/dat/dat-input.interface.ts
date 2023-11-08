import { DATQueryCriteria } from '@module/broker/interface/dat/dat-response.interface';

export type DATGetTokenOrganizationInput = {
  username: string;
  password: string;
};

export type DATGetTokenUserInput = {
  username: string;
};

export type DATCreateAssetQueryInput = {
  criteria: DATQueryCriteria;
};

export type DATGetAssetQueriesInput = {
  limit: number; // 1-100
  offset: number; // 0-99
  assetType: 'SHIPMENT' | 'TRUCK';
  includeExpired: boolean;
  includeDeleted: boolean;
};

export type DATGetAssetQueryDetailInput = {
  queryId: string;
};

export enum DATRetrieveAssetOrderBy {
  ASC_Age = 'asc(age)',
  DESC_Age = 'desc(age)',
  ASC_Destination = 'asc(destination)',
  DESC_Destination = 'desc(destination)',
  ASC_DestinationDeadhead = 'asc(destinationDeadhead)',
  DESC_DestinationDeadhead = 'desc(destinationDeadhead)',
  ASC_Origin = 'asc(origin)',
  DESC_Origin = 'desc(origin)',
  ASC_OriginDeadhead = 'asc(originDeadhead)',
  DESC_OriginDeadhead = 'desc(originDeadhead)',
  ASC_IsBookable = 'asc(isBookable)',
  DESC_IsBookable = 'desc(isBookable)',
  ASC_IsNegotiable = 'asc(isNegotiable)',
  DESC_IsNegotiable = 'desc(isNegotiable)',
  ASC_IsPrivateNetwork = 'asc(isPrivateNetwork)',
  DESC_IsPrivateNetwork = 'desc(isPrivateNetwork)',
  ASC_Length = 'asc(length)',
  DESC_Length = 'desc(length)',
  ASC_Weight = 'asc(weight)',
  DESC_Weight = 'desc(weight)',
  ASC_Availability = 'asc(availability)',
  DESC_Availability = 'desc(availability)',
  ASC_CreditScore = 'asc(creditScore)',
  DESC_CreditScore = 'desc(creditScore)',
  ASC_DaysToPay = 'asc(daysToPay)',
  DESC_DaysToPay = 'desc(daysToPay)',
  ASC_TripLength = 'asc(tripLength)',
  DESC_TripLength = 'desc(tripLength)',
  ASC_Rate = 'asc(rate)',
  DESC_Rate = 'desc(rate)',
  ASC_CompanyName = 'asc(companyName)',
  DESC_CompanyName = 'desc(companyName)',
  ASC_CarrierHomeStates = 'asc(carrierHomeStates)',
  DESC_CarrierHomeStates = 'desc(carrierHomeStates)',
  ASC_PresentationDate = 'asc(presentationDate)',
  DESC_PresentationDate = 'desc(presentationDate)',
  ASC_EstimatedRatePerMile = 'asc(estimatedRatePerMile)',
  DESC_EstimatedRatePerMile = 'desc(estimatedRatePerMile)'
}

export type DATRetrieveAssetsQueryInput = {
  includeOnlyHasLength: boolean;
  includeOnlyHasWeight: boolean;
  includeOnlyBookable: boolean;
  includeOnlyFactorable: boolean;
  includeOnlyQuickPayable: boolean;
  includeOnlyAssurable: boolean;
  maxAgeMinutes: number;
  maxOriginDeadheadMiles: number;
  maxDestinationDeadheadMiles: number;
  orderBy: DATRetrieveAssetOrderBy;
  excludePostingIds: string[];
  staticView: 'ALL' | 'JUST_COUNT';
  limit: number;
  cursor: string;
  fullPartial: 'FULL' | 'BOTH' | 'PARTIAL';
  earliestAvailability: string; // string is a date
  latestAvailability: string; // string is a date
  includePrivateNetwork: boolean;
  includeLoadBoard: boolean;
  preferredBlockedFilter: 'PREFERRED_ONLY' | 'BLOCKED_ONLY' | 'PREFERRED_AND_NORMAL';
  excludeForeignAssets: boolean;
  includeOnlyNegotiable: boolean;
  includeOpenDestinationTrucks: boolean;
  includeRanked: boolean;
  availableLengthFeet: number;
  availableWeightPounds: number;
  maximumLengthFeet: number;
  maximumWeightPounds: number;
  includeOnlyTrackable: boolean;
  includeTrackableTypes: ('ANY' | 'DONT_CARE' | 'MOBILE' | 'NONE')[];
  includeOnlyTrackingRequired: string;
  includeCompanies: string[];
  excludeCompanies: string[];
};
