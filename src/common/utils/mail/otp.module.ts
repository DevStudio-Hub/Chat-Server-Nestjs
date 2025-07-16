import { Module } from '@nestjs/common';
import { MailerService } from './otp.service';

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
