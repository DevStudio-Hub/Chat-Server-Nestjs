import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ConfigModule } from '@nestjs/config';
import { ModelsModule } from 'src/models/modules/models.module';

@Module({
  imports: [ConfigModule, ModelsModule],
  providers: [ChatGateway],
})
export class ChatModule {}
