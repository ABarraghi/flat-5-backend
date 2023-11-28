import { Injectable } from '@nestjs/common';
import { BookingLoad, Load } from '@module/broker/interface/flat-5/load.interface';
import {
  CoyoteAddress,
  CoyoteLoad,
  CoyoteSearchLoadResponse
} from '@module/broker/interface/coyote/coyote-response.interface';
import { Loc } from '@core/util/loc';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';

@Injectable()
export class CoyoteOutputTransformer {
  EQUIPMENT_TYPES = {
    V: 'Van',
    R: 'Reefer',
    F: 'Flatbed'
  };

  searchAvailableLoads(value: CoyoteSearchLoadResponse, searchAvailableLoadDto: SearchAvailableLoadDto): Load[] {
    const loads: Load[] = [];
    if (!value || !value.loads || !value.loads.length) return loads;
    value.loads.forEach(load => {
      const loadModel = new Load();
      loadModel.broker = 'coyote';
      loadModel.loadId = load.loadId.toString();
      loadModel.originDeadhead = null;
      loadModel.destinationDeadhead = null;
      const pickupStop = load.stops.find(stop => stop.stopType === 'Pickup');
      loadModel.pickupStop = {
        address: this.buildAddress(pickupStop.facility.address),
        state: pickupStop.facility.address.stateProvinceCode,
        postalCode: pickupStop.facility.address.postalCode,
        city: pickupStop.facility.address.cityName,
        line1: pickupStop.facility.address.line1,
        line2: pickupStop.facility.address.line2,
        coordinates: {
          latitude: pickupStop.facility.geoCoordinates.latitude,
          longitude: pickupStop.facility.geoCoordinates.longitude
        },
        appointment: {
          startTime: pickupStop.appointment.appointmentStartDateTimeUtc,
          endTime: pickupStop.appointment.appointmentEndDateTimeUtc
        },
        notes: pickupStop.stopDetails.stopNotes
      };
      loadModel.originDeadhead = Loc.distanceInMiles(
        searchAvailableLoadDto.stopPoints[0].location.coordinates,
        loadModel.pickupStop.coordinates
      );
      const deliveryStop = load.stops.find(stop => stop.stopType === 'Delivery');
      if (deliveryStop) {
        loadModel.deliveryStop = {
          address: this.buildAddress(deliveryStop.facility.address),
          coordinates: {
            latitude: deliveryStop.facility.geoCoordinates.latitude,
            longitude: deliveryStop.facility.geoCoordinates.longitude
          },
          appointment: {
            startTime: deliveryStop.appointment.appointmentStartDateTimeUtc,
            endTime: deliveryStop.appointment.appointmentEndDateTimeUtc
          },
          notes: deliveryStop.stopDetails.stopNotes
        };
        loadModel.flyDistance = Loc.distanceInMiles(
          loadModel.pickupStop.coordinates,
          loadModel.deliveryStop.coordinates
        );

        loadModel.destinationDeadhead = Loc.distanceInMiles(
          loadModel.deliveryStop.coordinates,
          searchAvailableLoadDto.stopPoints[1].location.coordinates
        );
      }
      loadModel.amount = load.loadDetails.rate.value;
      loadModel.currency = load.loadDetails.rate.currencyType;
      loadModel.rate =
        load.loadDetails.loadDistance.value && load.loadDetails.rate.value
          ? load.loadDetails.rate.value / load.loadDetails.loadDistance.value
          : -1;
      loadModel.driveDistance = load.loadDetails.loadDistance.value;
      loadModel.distance = loadModel.driveDistance ?? loadModel.flyDistance;
      loadModel.distanceUnit = load.loadDetails.loadDistance.unit;
      // Todo: need to re-calculate duration by business logic
      loadModel.duration = load.loadDetails.loadDistance.value / 60;
      loadModel.durationUnit = 'minutes';
      loadModel.rawLoad = load;
      loadModel.equipmentType = this.EQUIPMENT_TYPES[load.loadDetails.equipment.equipmentType];
      loadModel.length = load.loadDetails.equipment.equipmentLength.value;
      loadModel.lengthUnit = load.loadDetails.equipment.equipmentLength.unit;
      loadModel.height = load.loadDetails.equipment.equipmentHeight.value;
      loadModel.heightUnit = load.loadDetails.equipment.equipmentHeight.unit;
      loadModel.width = load.loadDetails.equipment.equipmentWidth.value;
      loadModel.widthUnit = load.loadDetails.equipment.equipmentWidth.unit;
      loadModel.weight = load.loadDetails.weight.value;
      loadModel.weightUnit = load.loadDetails.weight.unit;

      loads.push(loadModel);
    });

    return loads;
  }

  getLoadDetail(value: CoyoteLoad): Load {
    const loadModel = new Load();
    loadModel.broker = 'coyote';
    loadModel.loadId = value.loadId.toString();
    loadModel.originDeadhead = -1;
    loadModel.destinationDeadhead = -1;
    const pickupStop = value.stops.find(stop => stop.stopType === 'Pickup');
    loadModel.pickupStop = {
      address: this.buildAddress(pickupStop.facility.address),
      coordinates: {
        latitude: pickupStop.facility.geoCoordinates.latitude,
        longitude: pickupStop.facility.geoCoordinates.longitude
      },
      appointment: {
        startTime: pickupStop.appointment.appointmentStartDateTimeUtc,
        endTime: pickupStop.appointment.appointmentEndDateTimeUtc
      }
    };
    const deliveryStop = value.stops.find(stop => stop.stopType === 'Delivery');
    loadModel.deliveryStop = {
      address: this.buildAddress(deliveryStop.facility.address),
      coordinates: {
        latitude: deliveryStop.facility.geoCoordinates.latitude,
        longitude: deliveryStop.facility.geoCoordinates.longitude
      },
      appointment: {
        startTime: deliveryStop.appointment.appointmentStartDateTimeUtc,
        endTime: deliveryStop.appointment.appointmentEndDateTimeUtc
      }
    };

    return loadModel;
  }

  bookLoad(value: any): any {
    return new BookingLoad({ bookingId: value });
  }

  buildAddress(address: CoyoteAddress): string {
    return `
      ${address.line1 ?? ''} ${address.line2 ?? ''} ${address.cityName ?? ''} ${address.stateProvinceCode ?? ''} ${
        address.postalCode ?? ''
      }`
      .replace(/ {2}/g, ' ')
      .trim();
  }
}
