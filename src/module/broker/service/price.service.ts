import { Injectable } from '@nestjs/common';
import { Loc } from '@core/util/loc';

@Injectable()
export class PriceService {
  public readonly loadedMileRate = 2.5;
  public readonly deadHeadRate = 0.75;
  public readonly loadedKilometerRate = Loc.kilometersToMiles(1) * 2.5;
  public readonly deadHeadKilometerRate = Loc.kilometersToMiles(1) * 0.75;

  getAmount(loadedMile: number, deadHeadMile: number): number {
    return loadedMile * this.loadedMileRate + deadHeadMile * this.deadHeadRate;
  }
}
