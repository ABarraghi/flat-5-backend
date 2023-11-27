import { Injectable } from '@nestjs/common';
import { Load } from '@module/broker/interface/flat-5/load.interface';
import { DATPlace, DATRetrieveAssetsResponse } from '@module/broker/interface/dat/dat-response.interface';
import { PriceService } from '@module/broker/service/price.service';
import { Loc } from '@core/util/loc';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';

@Injectable()
export class DatOutputTransformer {
  constructor(private readonly priceService: PriceService) {}

  EQUIPMENT_TYPES = {
    V: 'Van',
    R: 'Reefer',
    F: 'Flatbed'
  };

  searchAvailableLoads(value: DATRetrieveAssetsResponse, searchAvailableLoadDto: SearchAvailableLoadDto): Load[] {
    const loads: Load[] = [];
    if (!value || !value.matches || !value.matches.length) return loads;
    value.matches.forEach(match => {
      if (!match.isBookable && match.tripLength.method === 'ROAD') {
        const loadModel = new Load();
        loadModel.broker = 'dat';
        loadModel.loadId = match.matchingAssetInfo.matchingPostingId;
        const pickupStop = match.matchingAssetInfo.origin;
        loadModel.pickupStop = {
          address: this.buildAddress(pickupStop),
          city: pickupStop.city,
          state: pickupStop.stateProv,
          county: pickupStop.county,
          postalCode: pickupStop.postalCode,
          coordinates: {
            latitude: pickupStop.latitude,
            longitude: pickupStop.longitude
          },
          appointment: {
            startTime: match.availability.earliestWhen,
            endTime: match.availability.latestWhen
          }
        };
        const deliveryStop = match.matchingAssetInfo.destination;
        if (deliveryStop && deliveryStop.place) {
          loadModel.deliveryStop = {
            address: this.buildAddress(deliveryStop.place),
            city: deliveryStop.place.city,
            state: deliveryStop.place.stateProv, // maybe multiple states with deliveryStop.area
            county: deliveryStop.place.county,
            postalCode: deliveryStop.place.postalCode,
            coordinates: {
              latitude: deliveryStop.place.latitude,
              longitude: deliveryStop.place.longitude
            }
          };
          loadModel.flyDistance = Loc.distanceInMiles(
            loadModel.pickupStop.coordinates,
            loadModel.deliveryStop.coordinates
          );
        }
        loadModel.originDeadhead =
          match.originDeadheadMiles.miles ??
          Loc.distanceInMiles(
            searchAvailableLoadDto.stopPoints[0].location.coordinates,
            loadModel.pickupStop.coordinates
          );
        loadModel.destinationDeadhead =
          match.destinationDeadheadMiles.miles ?? loadModel.deliveryStop
            ? Loc.distanceInMiles(
                loadModel.deliveryStop.coordinates,
                searchAvailableLoadDto.stopPoints[1].location.coordinates
              )
            : null;
        loadModel.driveDistance = match.tripLength.miles;
        loadModel.distance = loadModel.driveDistance ?? loadModel.flyDistance;
        loadModel.distanceUnit = 'Miles';
        loadModel.rawLoad = match;
        if (match.loadBoardRateInfo) {
          // should remove after have data bookable
          let key = 'nonBookable';
          if (match.isBookable) {
            key = 'bookable';
          }
          // Todo: beside that, have another rate is: privateNetworkRateInfo - need to see what is it later
          if (match.loadBoardRateInfo[key].basis === 'FLAT') {
            loadModel.amount = match.loadBoardRateInfo[key].rateUsd;
            loadModel.rate = match.loadBoardRateInfo[key].rateUsd / match.tripLength.miles;
          } else if (match.loadBoardRateInfo[key].basis === 'PER_MILE') {
            loadModel.rate = match.loadBoardRateInfo[key].rateUsd;
            loadModel.amount = loadModel.rate * match.tripLength.miles;
          }
        } else {
          if (loadModel.distanceUnit === 'Miles') {
            loadModel.rate = this.priceService.loadedMileRate;
            loadModel.deadheadRate = this.priceService.deadHeadRate;
            loadModel.amount = this.priceService.getAmount(loadModel.distance, loadModel.originDeadhead);
          } else {
            loadModel.rate = this.priceService.loadedKilometerRate;
            loadModel.deadheadRate = this.priceService.deadHeadKilometerRate;
            loadModel.amount = this.priceService.getAmount(
              Loc.kilometersToMiles(loadModel.distance),
              Loc.kilometersToMiles(loadModel.originDeadhead)
            );
          }
        }

        // Todo: need to re-calculate duration by business logic
        loadModel.duration = match.tripLength.miles / 60;

        loadModel.shipperInfo = {
          name: match.posterInfo.companyName,
          email: match.posterInfo.contact.email,
          phone: match.posterInfo.contact.phone
        };
        loadModel.equipmentType = this.EQUIPMENT_TYPES[match.matchingAssetInfo.equipmentType];
        loadModel.length = match.maximumLengthFeet;
        loadModel.lengthUnit = 'Feet';
        loadModel.weight = match.maximumWeightPounds;
        loadModel.weightUnit = 'Pounds';
        loads.push(loadModel);
      }
    });

    return loads;
  }

  buildAddress(location: DATPlace): string {
    return `${location.city ?? ''}, ${location.county ?? ''}, ${location.stateProv ?? ''} ${location.postalCode ?? ''}`
      .replace(/ {2}/g, ' ')
      .trim();
  }
}
