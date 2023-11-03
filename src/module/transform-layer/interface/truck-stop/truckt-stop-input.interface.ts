export type CoyoteUnits = 'Miles' | 'Kilometers';
export type TruckStopEquipmentTypes =
  | '2F'
  | 'ANIM'
  | 'ANY'
  | 'AUTO'
  | 'B-TR'
  | 'BDMP'
  | 'BEAM'
  | 'BELT'
  | 'BOAT'
  | 'CH'
  | 'CONG'
  | 'CONT'
  | 'CV'
  | 'DA'
  | 'DD'
  | 'DDE'
  | 'DUMP'
  | 'ENDP'
  | 'F'
  | 'FA'
  | 'FEXT'
  | 'FINT'
  | 'FO'
  | 'FRV'
  | 'FSD'
  | 'FSDV'
  | 'FV'
  | 'FVR'
  | 'FVV'
  | 'FVVR'
  | 'FWS'
  | 'HOPP'
  | 'HS'
  | 'HTU'
  | 'LAF'
  | 'LB'
  | 'LBO'
  | 'LDOT'
  | 'LIVE'
  | 'MAXI'
  | 'MBHM'
  | 'PNEU'
  | 'PO'
  | 'R'
  | 'RFV'
  | 'RGN'
  | 'RGNE'
  | 'RINT'
  | 'ROLL'
  | 'RPD'
  | 'RV'
  | 'RVF'
  | 'SD'
  | 'SDL'
  | 'SDO'
  | 'SDRG'
  | 'SPEC'
  | 'SV'
  | 'TANK'
  | 'V'
  | 'V-OT'
  | 'VA'
  | 'VB'
  | 'VCAR'
  | 'VF'
  | 'VFR'
  | 'VINT'
  | 'IX'
  | 'VIVR'
  | 'VLG'
  | 'VM'
  | 'VR'
  | 'VRDD'
  | 'VRF'
  | 'X'
  | 'VVR'
  | 'WALK';

export type LoadType = 'Nothing' | 'Full' | 'All' | 'Partial';

// Van 78,46,26,72,73,38,39,66,71,41,43,44,58,45,47,49,50,57,51,52,54,55
// FLatbed 1,9,75,12,59,13,14,15,18,22,27
// Refer 31,69,34,35,36,70
// Specialized 2,3,4,79,77,5,6,7,8,9,75,10,11,19,23,24,28,29,32,33,40,42
// Hot Shot 2,3,4,79,77,5,6,7,8,9,75,10,11,19,23,24,28,29,32,33,40,42

export class LocationInfo {
  city: string;
  country: string;
  range: number;
  state: string;
  latitude: number;
  longitude: number;
}

export class TruckStopInput {
  origin: LocationInfo;
  destination: LocationInfo;
  equipmentType: TruckStopEquipmentTypes;
  // equipmentType: string;
  loadType: LoadType;
  pickupDate: string;
}

// export class CoyoteBookLoadSimpleInput {
//   carrierId: number;
//   loadId: number;
// }
//
// export class CoyoteBookLoadInput {
//   carrierId: number;
//   load: CoyoteLoad;
//
//   constructor(data: { carrierId: number; load: CoyoteLoad }) {
//     this.carrierId = data.carrierId;
//     this.load = data.load;
//   }
// }
