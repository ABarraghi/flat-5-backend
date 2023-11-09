import { Injectable } from '@nestjs/common';

@Injectable()
export class PriceService {
  private readonly loadedMileRate = 2.5;
  private readonly deadHeadRate = 0.75;

  getAmount(loadedMile: number, deadHeadMile: number): number {
    return loadedMile * this.loadedMileRate + deadHeadMile * this.deadHeadRate;
  }
}
