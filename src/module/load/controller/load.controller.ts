import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { LoadService } from '@module/load/service/load.service';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { ApiBrokers, isApiBroker } from '@module/broker/interface/flat-5/common.interface';
import { BookLoadDto } from '@module/load/validation/book-load.dto';

@Controller('loads')
export class LoadController {
  constructor(private readonly loadService: LoadService) {}

  @Post('available')
  searchStandard(
    @Body() searchAvailableLoadDto: SearchAvailableLoadDto,
    @Headers('restrict-business-logic') isRestrictBusinessLogic: string,
    @Headers('allow-empty-loads') allowEmptyLoads: string
  ) {
    if (searchAvailableLoadDto.isRestrictBusinessLogic === undefined) {
      searchAvailableLoadDto.isRestrictBusinessLogic = isRestrictBusinessLogic == 'true';
    }
    if (searchAvailableLoadDto.allowEmptyLoads === undefined) {
      searchAvailableLoadDto.allowEmptyLoads = allowEmptyLoads == 'true';
    }

    return this.loadService.searchStandard(searchAvailableLoadDto);
  }

  @Post('en-route')
  searchEnRoute(@Body() searchAvailableLoadDto: SearchAvailableLoadDto) {
    return this.loadService.searchEnRoute(searchAvailableLoadDto);
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

  @Post('test')
  test(@Body() body: any) {
    // console.log(body);

    return this.loadService.test(body);
  }
}
