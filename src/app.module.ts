import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SearchModule } from './search/search.module';
import { ModelsModule } from './models/modules/models.module';
import { ChatModule } from './chat/chat.module';
import { getMessagesAndRoomsModule } from './getMessagesAndRooms/getMessAndRoom.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot(`mongodb://admin:Astro123@localhost:27017/Service?authSource=admin`),
    SearchModule,
    getMessagesAndRoomsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'root_Chat_App',
        signOptions: { expiresIn: '1h' },
      }),
    }),
    ModelsModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
