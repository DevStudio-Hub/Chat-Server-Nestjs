import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedRequest } from 'src/common/utils/interface/userId.interface';
import { SearchService } from './search.service';
import { JwtService } from '@nestjs/jwt';

@Controller('search')
export class SearchController {
  constructor(
    private searchService: SearchService,
    private jwtService: JwtService
  ) {}
  @Get('Users')
  searchUsers(@Query('Users') userQuery: string, @Req() req: Request) {
    const UserId = (req as AuthenticatedRequest).userId;

    return this.searchService.searchUsers(userQuery, UserId);
  }

  @Get('UserInfo')
  searhUserInfo(@Query('userId') userId: string) {
    return this.searchService.SearchUserInfo(userId);
  }
}
