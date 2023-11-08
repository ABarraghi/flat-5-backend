import { GeoCoordinates } from '@module/transform-layer/interface/flat-5/load.interface';

export class Loc {
  static distance(origin: GeoCoordinates, destination: GeoCoordinates): number {
    const R = 6371; // Radius of the Earth in kilometers

    // Convert latitude and longitude from degrees to radians
    const radLat1 = (origin.latitude * Math.PI) / 180;
    const radLon1 = (origin.longitude * Math.PI) / 180;
    const radLat2 = (destination.latitude * Math.PI) / 180;
    const radLon2 = (destination.longitude * Math.PI) / 180;

    // Haversine formula
    const dLat = radLat2 - radLat1;
    const dLon = radLon2 - radLon1;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance
    return R * c;
  }

  static kilometersToMiles(kilometers: number): number {
    const milesPerKilometer = 0.621371; // 1 kilometer is approximately 0.621371 miles

    return kilometers * milesPerKilometer;
  }

  static milesToKilometers(miles: number): number {
    const kilometersPerMile = 1.60934; // 1 mile is approximately 1.60934 kilometers

    return miles * kilometersPerMile;
  }

  static metersToMiles(meters: number) {
    return meters * 0.000621371192;
  }
  static milesToMeters(miles: number) {
    return miles * 1609.344;
  }
}
