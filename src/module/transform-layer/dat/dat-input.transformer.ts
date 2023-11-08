import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { Injectable } from '@nestjs/common';
import { DATCreateAssetQueryInput } from '@module/transform-layer/interface/dat/dat-input.interface';
import {
  DATQueryCriteria,
  DATState
} from '@module/transform-layer/interface/dat/dat-response.interface';
import { Loc } from '@core/util/loc';
import * as dayjs from 'dayjs';

@Injectable()
export class DatInputTransformer {
  createAssetQuery(value: SearchAvailableLoadDto): DATCreateAssetQueryInput {
    const criteria: DATQueryCriteria = {
      lane: {
        assetType: 'TRUCK',
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
      maxOriginDeadheadMiles: 150,
      maxDestinationDeadheadMiles: 150
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
        earliestWhen: dayjs(value.stopPoints[0].stopDate.from).startOf('day').format(),
        latestWhen: dayjs(value.stopPoints[0].stopDate.from).endOf('day').format()
      };
      if (value.stopPoints[0].stopDate.to) {
        criteria.availability.latestWhen = dayjs(value.stopPoints[0].stopDate.to)
          .endOf('day')
          .format();
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
    const input: DATCreateAssetQueryInput = {
      criteria
    };

    return input;
  }
}
