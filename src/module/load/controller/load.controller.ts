import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LoadService } from '@module/load/service/load.service';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { ApiBrokers, isApiBroker } from '@module/transform-layer/interface/flat-5/common.interface';
import { BookLoadDto } from '@module/load/validation/book-load.dto';

@Controller('loads')
export class LoadController {
  constructor(private readonly loadService: LoadService) {}

  @Post('available')
  searchAvailableLoads(@Body() searchAvailableLoadDto: SearchAvailableLoadDto) {
    return this.loadService.searchAvailableLoads(searchAvailableLoadDto);
  }

  @Get(':broker/:loadId')
  searchLoadDetail(@Param('broker') broker: ApiBrokers, @Param('loadId') loadId: string) {
    if (isApiBroker(broker)) {
      return this.loadService.getLoadDetail(broker, loadId);
    }

    return;
  }

  @Post('book')
  bookLoad(@Body() bookLoadDto: BookLoadDto) {
    return this.loadService.bookLoad(bookLoadDto);
  }
}
