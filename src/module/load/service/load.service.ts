import { Injectable } from '@nestjs/common';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { ConfigService } from '@nestjs/config';
import { CoyoteBrokerService } from '@module/broker/service/coyote-broker.service';
import { InputTransformer } from '@module/transform-layer/input.transformer';
import {
  BookingLoad,
  LoadInterface
} from '@module/transform-layer/interface/flat-5/load.interface';
import { OutputTransformer } from '@module/transform-layer/output.transformer';
import { ApiBrokers } from '@module/transform-layer/interface/flat-5/common.interface';
import {
  CoyoteBookLoadSimpleInput,
  CoyoteInput
} from '@module/transform-layer/interface/coyote/coyote-input.interface';
import { BookLoadDto } from '@module/load/validation/book-load.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Booking } from '@module/load/schema/booking.schema';
import { Model } from 'mongoose';
import { Loc } from '@core/util/loc';

@Injectable()
export class LoadService {
  constructor(
    private configService: ConfigService,
    private coyoteBrokerService: CoyoteBrokerService,
    private inputTransformer: InputTransformer,
    private outputTransformer: OutputTransformer,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>
  ) {}

  async searchAvailableLoads(
    searchAvailableLoadDto: SearchAvailableLoadDto
  ): Promise<LoadInterface[]> {
    const distance = Loc.distance(searchAvailableLoadDto.from, searchAvailableLoadDto.to);
    searchAvailableLoadDto.distance = distance;
    searchAvailableLoadDto.unit = 'Kilometers';
    const loads: LoadInterface[] = [];
    if (this.configService.get('broker.coyote.enabled')) {
      const input = this.inputTransformer.transformSearchAvailableLoad(searchAvailableLoadDto, {
        to: 'coyote'
      }) as CoyoteInput;
      const coyoteLoads = await this.coyoteBrokerService.searchAvailableLoads(input);

      loads.push(
        ...this.outputTransformer.transformSearchAvailableLoads(coyoteLoads, {
          from: 'coyote'
        })
      );
    }

    let filterLoads = loads.filter(load => {
      const distance1 = Loc.distance(load.pickupStop.coordinates, searchAvailableLoadDto.from);
      const distance2 = Loc.distance(load.pickupStop.coordinates, searchAvailableLoadDto.to);
      const distance3 = Loc.distance(load.deliveryStop.coordinates, searchAvailableLoadDto.from);
      const distance4 = Loc.distance(load.deliveryStop.coordinates, searchAvailableLoadDto.to);

      return (
        distance1 <= distance &&
        distance2 <= distance &&
        distance3 <= distance &&
        distance4 <= distance
      );
    });

    if (!filterLoads.length) {
      filterLoads = loads.filter(load => {
        const distance1 = Loc.distance(load.pickupStop.coordinates, searchAvailableLoadDto.from);
        const distance2 = Loc.distance(load.pickupStop.coordinates, searchAvailableLoadDto.to);

        return distance1 <= distance && distance2 <= distance;
      });
    }

    if (filterLoads.length) {
      return filterLoads;
    }

    return loads;
  }

  async getLoadDetail(broker: ApiBrokers, loadId: string): Promise<LoadInterface> {
    switch (broker) {
      case 'coyote':
        if (this.configService.get('broker.coyote.enabled')) {
          const input = this.inputTransformer.transformGetLoadDetail(loadId, {
            to: 'coyote'
          }) as number;

          const coyoteLoadDetail = await this.coyoteBrokerService.getLoadDetail(input);

          return this.outputTransformer.transformGetLoadDetail(coyoteLoadDetail, {
            from: 'coyote'
          });
        }
        break;
      default:
        return;
    }
  }

  async bookLoad(bookLoadDto: BookLoadDto): Promise<any> {
    switch (bookLoadDto.broker) {
      case 'coyote':
        if (this.configService.get('broker.coyote.enabled')) {
          const input = this.inputTransformer.transformBookLoad(bookLoadDto.loadId, {
            to: 'coyote'
          }) as CoyoteBookLoadSimpleInput;

          const bookingLoadId = await this.coyoteBrokerService.bookLoad(input);

          const bookingLoad = this.outputTransformer.transformBookLoad(bookingLoadId, {
            from: 'coyote'
          }) as BookingLoad;
          bookingLoad.loadId = input.loadId.toString();
          bookingLoad.carrierId = input.carrierId.toString();
          bookingLoad.broker = bookLoadDto.broker;

          const createdCat = new this.bookingModel(bookingLoad);
          await createdCat.save();

          return bookingLoad;
        }
        break;
      default:
        return;
    }
  }
}
