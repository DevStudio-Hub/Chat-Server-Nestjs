import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }
  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const mailerOptions = {
      from: this.configService.get<string>('SMTP_USER'),
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    };
    try {
      await this.transporter.sendMail(mailerOptions);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}
