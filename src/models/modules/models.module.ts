import { MessageModel, MessageSchema } from './../messge/message.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '../users/user.schema';
import { RoomModel, UserRoomSchema } from '../room/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel, schema: UserSchema },
      { name: RoomModel, schema: UserRoomSchema },
      { name: MessageModel, schema: MessageSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ModelsModule {}
