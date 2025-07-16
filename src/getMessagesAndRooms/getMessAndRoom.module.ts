import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GetUserIdMiddleware } from 'src/middlewares/getUserId.middleware';
import { ModelsModule } from 'src/models/modules/models.module';
import { getMessagesAndRoomsController } from './getMessAndRoom.controller';
import { getMessagesAndRoomsService } from './getMessAndRoom.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ModelsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'root_Chat_App',
        signOptions: { expiresIn: '15h' },
      }),
    }),
  ],
  controllers: [getMessagesAndRoomsController],
  providers: [getMessagesAndRoomsService],
  exports: [getMessagesAndRoomsService],
})
export class getMessagesAndRoomsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserIdMiddleware).forRoutes('getMessagesAndRooms/GetRooms');
  }
}
