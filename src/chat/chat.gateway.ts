/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import { BadGatewayException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from 'src/models/users/user.schema';
import { Model } from 'mongoose';
import { Participant, RoomModel, UserRoom } from 'src/models/room/room.schema';
import { Message, MessageModel } from 'src/models/messge/message.schema';

interface jwtType {
  userId: string;
  username: string;
}
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private configService: ConfigService,
    @InjectModel(UserModel) private userModel: Model<User>,
    @InjectModel(RoomModel) private roomModel: Model<UserRoom>,
    @InjectModel(MessageModel) private messsageModel: Model<Message>
  ) {}

  handleConnection(client: Socket) {
    try {
      const rawCookie = client.handshake.headers.cookie;
      if (!rawCookie) {
        client.disconnect();
        return;
      }

      const parsed: Record<string, string> = cookie.parse(rawCookie);

      const token = parsed.token;
      if (!token) {
        client.disconnect();
        return;
      }
      const secret = this.configService.get<string | undefined>('JWT_SECRET');
      if (!secret) {
        throw new BadGatewayException('secret key not find');
      }
      const decoded = jwt.verify(token, secret) as jwtType;

      if (!decoded?.userId) {
        client.disconnect();
        return;
      }
      client.data.userId = decoded.userId;
    } catch (error) {
      console.error('WebSocket connection error:', error.message || error);
      client.disconnect();
    }
  }
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    await client.join(roomId);
  }
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const userId: string = client.data.userId;

    const room = await this.roomModel.findOne({ roomId: data.roomId });

    if (!room) {
      return;
    }
    room.participants = room.participants.map((p: Participant) => {
      if (String(p.user) === String(userId)) {
        return { ...p, unreadCount: 0 };
      }
      return p;
    });

    await room.save();
  }
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; message: string; recever: string }
  ) {
    const senderId = client.data.userId;
    const { roomId, message, recever } = data;
    try {
      const senderUser = await this.userModel.findById(senderId);
      const receiverUser = await this.userModel.findOne({ username: recever });
      if (!receiverUser) {
        return client.emit('error', { message: 'Receiver not found' });
      }
      let room = await this.roomModel.findOne({ roomId });
      if (!room) {
        room = new this.roomModel({
          roomId,
          participants: [
            {
              user: senderUser?._id,
              userProfile: senderUser?.profileURL || '',
              username: senderUser?.username || '',
              unreadCount: 1,
            },
            {
              user: receiverUser._id,
              userProfile: receiverUser.profileURL,
              username: receiverUser.username,
              unreadCount: 0,
            },
          ],
          lastMessage: {
            text: message,
            sentAt: new Date(),
            sender: senderId,
          },
        });
      } else {
        room.lastMessage = {
          text: message,
          sentAt: new Date(),
          sender: senderId,
        };
      }

      const newMsg = new this.messsageModel({
        room: roomId,
        sender: senderId,
        text: message,
        sentAt: new Date(),
        isRead: false,
      });
      await newMsg.save();
      room.participants = room.participants.map((p: Participant) => {
        if (String(p.user) === String(senderId)) {
          return { ...p, unreadCount: (p.unreadCount || 0) + 1 };
        }
        return p;
      });
      await room.save();
      this.server.to(roomId).emit('receiveMessage', {
        roomId,
        sender: senderId,
        text: message,
        sentAt: newMsg.sentAt,
      });

      this.server.emit('roomsUpdated');
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }
}
