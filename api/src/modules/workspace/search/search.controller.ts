import { Controller, Get, Query, Request } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('workspace/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Request() req: any, @Query('q') query: string) {
    const tenantId = req.user.tenantId;
    return this.searchService.search(tenantId, query);
  }
}
