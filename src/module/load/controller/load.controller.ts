import { Body, Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { LoadService } from '@module/load/service/load.service';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';
import { ApiBrokers, isApiBroker } from '@module/broker/interface/flat-5/common.interface';
import { BookLoadDto } from '@module/load/validation/book-load.dto';
import { AuthGuard } from '@module/auth/auth.guard';

@Controller('loads')
export class LoadController {
  constructor(private readonly loadService: LoadService) {}

  @Post('standard')
  searchStandard(@Body() searchAvailableLoadDto: SearchAvailableLoadDto) {
    return this.loadService.searchStandard(searchAvailableLoadDto);
  }

  @Post('en-route')
  searchEnRoute(@Body() searchAvailableLoadDto: SearchAvailableLoadDto) {
    return this.loadService.searchEnRoute(searchAvailableLoadDto);
  }

  @Post('route-my-truck')
  routeMyTruck(@Body() searchAvailableLoadDto: SearchAvailableLoadDto) {
    return this.loadService.routeMyTruck(searchAvailableLoadDto);
  }

  @Get(':broker/:loadId')
  searchLoadDetail(@Param('broker') broker: ApiBrokers, @Param('loadId') loadId: string) {
    if (isApiBroker(broker)) {
      return this.loadService.getLoadDetail(broker, loadId);
    }

    return;
  }

  @UseGuards(AuthGuard)
  @Post('book')
  bookLoad(@Req() request, @Body() bookLoadDto: BookLoadDto) {
    const userId = request.user.id;

    const bookLoad = {
      ...bookLoadDto,
      user: userId
    };

    return this.loadService.bookLoad(bookLoad);
  }

  @Post('test')
  test(@Body() body: any) {
    // console.log(body);

    return this.loadService.test(body);
  }
}
