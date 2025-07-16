import { Request } from 'express';
import { getMessagesAndRoomsService } from './getMessAndRoom.service';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/common/utils/interface/userId.interface';

@Controller('getMessagesAndRooms')
export class getMessagesAndRoomsController {
  constructor(private newgetMessagesAndRoomsService: getMessagesAndRoomsService) {}
  @Get('GetMessage')
  getMessages(@Query('roomId') roomId: string) {
    return this.newgetMessagesAndRoomsService.getMessage(roomId);
  }
  @Get('GetRooms')
  getRooms(@Req() req: Request) {
    const userId = (req as AuthenticatedRequest).userId;
    return this.newgetMessagesAndRoomsService.getRooms(userId);
  }
}
