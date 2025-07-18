import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerModule } from 'src/common/utils/mail/otp.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GetUserIdMiddleware } from 'src/middlewares/getUserId.middleware';
import { ModelsModule } from 'src/models/modules/models.module';

@Module({
  imports: [
    ModelsModule,
    MailerModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'root_Chat_App',
        signOptions: { expiresIn: '15d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserIdMiddleware).forRoutes('auth/Update-Bio');
  }
}
