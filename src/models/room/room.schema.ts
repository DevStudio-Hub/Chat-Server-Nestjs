import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false }) // Embedded document ke liye
export class Participant {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop()
  lastSeen: Date;

  @Prop({ default: 0 })
  unreadCount: number;

  @Prop({ required: true })
  userProfile: string;

  @Prop({ required: true })
  username: string;
}

const ParticipantSchema = SchemaFactory.createForClass(Participant);

@Schema({ timestamps: true })
export class UserRoom extends Document {
  @Prop({ required: true, unique: true })
  roomId: string;

  @Prop({ type: [ParticipantSchema] })
  participants: Participant[];

  @Prop({
    type: {
      text: { type: String },
      sentAt: { type: Date },
      sender: { type: Types.ObjectId, ref: 'User' },
    },
    default: null,
  })
  lastMessage: {
    text: string;
    sentAt: Date;
    sender: Types.ObjectId;
  };
}

export const UserRoomSchema = SchemaFactory.createForClass(UserRoom);
export type UserRoomDocument = UserRoom & Document;
export const RoomModel = UserRoom.name;
