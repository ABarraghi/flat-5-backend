import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LoadService } from '@module/load/service/load.service';
import { SearchAvailableLoadDto } from '@module/load/validation/search-available-load.dto';

@Controller('loads')
export class LoadController {
  constructor(private readonly loadService: LoadService) {}

  @Post('available')
  searchAvailableLoads(@Body() searchAvailableLoadDto: SearchAvailableLoadDto) {
    return this.loadService.searchAvailableLoads(searchAvailableLoadDto);
  }

  @Get(':loadId')
  searchLoadDetail(@Param('loadId') _loadId: string) {
    // return this.loadService.searchAvailableLoads();
  }
}
