import { CoyoteGeoCoordinates } from '@module/transform-layer/interface/coyote/coyote-response.interface';

export type CoyoteUnits = 'Miles' | 'Kilometers';
export type CoyoteEquipmentTypes =
  | 'V'
  | 'R'
  | 'F'
  | 'VR'
  | 'C'
  | 'SD'
  | 'DF'
  | 'DD'
  | 'SS'
  | 'FT'
  | 'E'
  | 'T'
  | 'B'
  | 'Z'
  | 'M'
  | 'Q'
  | 'P'
  | 'CNRU'
  | 'CPPU'
  | 'CSXU'
  | 'EMHU'
  | 'EMPU'
  | 'EMWU'
  | 'EPTY'
  | 'PACU'
  | 'W'
  | 'G'
  | 'K'
  | 'DR'
  | 'H'
  | 'FWS'
  | 'BT'
  | 'ZS'
  | 'XM'
  | 'MV'
  | 'MF'
  | 'FM'
  | 'DV'
  | 'LALL'
  | 'SDL'
  | 'A'
  | 'BL'
  | 'RC'
  | 'HS'
  | 'GM'
  | 'GS'
  | 'FS'
  | 'SDS'
  | 'RTC'
  | 'RTB'
  | 'WFB'
  | 'PO'
  | 'DDT'
  | 'DDB'
  | 'DDF'
  | 'SFB'
  | 'SFC'
  | 'RBC'
  | 'FB'
  | 'FBT'
  | 'FBX'
  | 'SKC'
  | 'LL'
  | 'LLS'
  | 'LLX'
  | 'TKC'
  | 'TKF'
  | 'IM'
  | 'IMF';

export type CoyoteMode = 'LTL' | 'TL' | 'TL_LTL';

export class CoyoteStopLocationInfo {
  location: CoyoteGeoCoordinates;
  deadheadRadius?: {
    value: number; //integer
    unit: CoyoteUnits;
  };
  appointment?: {
    appointmentStartDateTime: string; // datetime string
    appointmentEndDateTime: string;
  };
}

export class CoyoteInput {
  origin: CoyoteStopLocationInfo;
  destination?: CoyoteStopLocationInfo;
  equipmentType: CoyoteEquipmentTypes;
  mode: CoyoteMode;
}
