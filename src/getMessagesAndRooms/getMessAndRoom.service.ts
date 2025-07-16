import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageModel } from 'src/models/messge/message.schema';
import { RoomModel, UserRoom } from 'src/models/room/room.schema';

@Injectable()
export class getMessagesAndRoomsService {
  constructor(
    @InjectModel(MessageModel) private messageModel: Model<Message>,
    @InjectModel(RoomModel) private roomModel: Model<UserRoom>
  ) {}
  async getMessage(roomId: string) {
    if (!roomId) {
      throw new BadGatewayException('Wrong get message req please provide uuser id');
    }
    try {
      const messages = await this.messageModel.find({ room: roomId });
      return messages;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('internal server error');
    }
  }

  async getRooms(userId: string) {
    if (!userId) {
      throw new BadRequestException('olease provode userid');
    }
    try {
      const rooms = await this.roomModel.find({ 'participants.user': new Types.ObjectId(userId) });

      return rooms;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('internal server error');
    }
  }
}
