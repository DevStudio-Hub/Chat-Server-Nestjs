import { IsNotEmpty, IsString } from 'class-validator';

export class OtpVerifyDTO {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}
