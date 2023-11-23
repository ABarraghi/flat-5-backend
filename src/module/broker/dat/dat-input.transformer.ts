import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { Injectable } from '@nestjs/common';
import { DATCreateAssetQueryInput } from '@module/broker/interface/dat/dat-input.interface';
import { DATQueryCriteria, DATState } from '@module/broker/interface/dat/dat-response.interface';
import { Loc } from '@core/util/loc';
import * as dayjs from 'dayjs';

@Injectable()
export class DatInputTransformer {
  EQUIPMENT_TYPES = {
    dry_van: {
      classes: ['V']
    },
    reefer: {
      classes: ['R']
    },
    flatbed: {
      classes: ['F']
    },
    dry_van_or_reefer: {
      types: ['VR']
    },
    flat_or_van: {
      types: ['VF']
    }
  };

  createAssetQuery(value: SearchAvailableLoadDto): DATCreateAssetQueryInput {
    const criteria: DATQueryCriteria = {
      lane: {
        assetType: 'SHIPMENT',
        equipment: {
          types: ['FR', 'VR', 'VF'],
          classes: ['F', 'R', 'V']
        },
        origin: {
          place: {
            latitude: value.stopPoints[0].location.coordinate.latitude,
            longitude: value.stopPoints[0].location.coordinate.longitude,
            city: value.stopPoints[0].location.city ?? '',
            stateProv: (value.stopPoints[0].location.state ?? '') as DATState,
            county: value.stopPoints[0].location.country ?? '',
            postalCode: value.stopPoints[0].location.postalCode ?? ''
          }
        },
        destination: {
          open: {}
        }
      },
      availability: {
        earliestWhen: dayjs().startOf('day').format(),
        latestWhen: dayjs().endOf('day').format()
      },
      maxOriginDeadheadMiles: 150, // max is 450
      maxDestinationDeadheadMiles: 150, // max is 450
      capacity: {
        shipment: {
          fullPartial: 'FULL'
        }
      }
    };
    if (value.stopPoints[0].radius) {
      criteria.maxOriginDeadheadMiles =
        value.stopPoints[0].unit === 'Miles'
          ? value.stopPoints[0].radius
          : Loc.kilometersToMiles(value.stopPoints[0].radius);
    }
    if (value.stopPoints[0].stopDate) {
      // for pickup date only
      criteria.availability = {
        earliestWhen: value.stopPoints[0].stopDate.from,
        latestWhen: dayjs(value.stopPoints[0].stopDate.from).add(1, 'day').format()
      };
      if (value.stopPoints[0].stopDate.to) {
        criteria.availability.latestWhen = value.stopPoints[0].stopDate.to;
      }
    }
    if (value.stopPoints[1]) {
      criteria.lane.destination = {
        place: {
          latitude: value.stopPoints[1].location.coordinate.latitude,
          longitude: value.stopPoints[1].location.coordinate.longitude,
          city: value.stopPoints[0].location.city ?? '',
          stateProv: (value.stopPoints[0].location.state ?? '') as DATState,
          county: value.stopPoints[0].location.country ?? '',
          postalCode: value.stopPoints[0].location.postalCode ?? ''
        }
      };
      if (value.stopPoints[1].radius) {
        criteria.maxDestinationDeadheadMiles =
          value.stopPoints[1].unit === 'Miles'
            ? value.stopPoints[1].radius
            : Loc.kilometersToMiles(value.stopPoints[1].radius);
      }
    }

    if (value.equipmentType) {
      criteria.lane.equipment = this.EQUIPMENT_TYPES[value.equipmentType];
    }
    const input: DATCreateAssetQueryInput = {
      criteria
    };

    return input;
  }
}
