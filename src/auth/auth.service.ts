import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserModel } from 'src/models/users/user.schema';
import { UserRegisterDTO } from './dto/register.dto';
import { MailerService } from 'src/common/utils/mail/otp.service';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDTO } from './dto/login.dto';
import { OtpVerifyDTO } from './dto/otpVerify.dto';
import { UpdateBioDTO } from './dto/updateBio.dto';
import { Request } from 'express';
import { AuthenticatedRequest } from 'src/common/utils/interface/userId.interface';
import { female, male } from './utils/sendProfile/sendProfile';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private userModel: Model<User>,
    private mailerService: MailerService,
    private jwtService: JwtService
  ) {}
  async register(user: UserRegisterDTO) {
    const exitingUser = await this.userModel.findOne({ username: user.username });
    if (exitingUser) {
      throw new BadRequestException('User is already exists');
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const isMailSent = await this.mailerService.sendOtpEmail(user.email, otp);

    if (!isMailSent) {
      throw new BadRequestException('OTP not sent');
    }
    try {
      const hashedPassword = await hash(user.password, 10);
      const otpExpire = Date.now() + 10 * 60 * 1000;
      const boyProfileURL = await male();
      const girlProfileURL = await female();

      const newUser = new this.userModel({
        ...user,
        password: hashedPassword,
        otp,
        otpExpire,
        profileURL: user.gender === 'male' ? boyProfileURL : girlProfileURL,
      });

      await newUser.save();
      const token = await this.jwtService.signAsync({
        userId: newUser._id,
        username: newUser.username,
      });

      return { token, newUser };
    } catch (error) {
      console.error('Error while registering user:', error);
      throw new BadRequestException('Error while registering user');
    }
  }

  async login(user: LoginUserDTO) {
    try {
      const exitingUser = await this.userModel
        .findOne({ username: user.username })
        .select('+password');

      if (!exitingUser) {
        throw new BadRequestException('User is not exit');
      }

      const isValidPassword = await compare(user.password, exitingUser.password);
      if (!isValidPassword) {
        throw new UnauthorizedException('Wrong Password');
      }

      const payload = {
        userId: exitingUser._id,
        username: exitingUser.username,
      };
      const token = await this.jwtService.signAsync(payload);
      return { exitingUser, token };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error while login user:', error);
      throw new BadRequestException('Error while login user');
    }
  }

  async otpVerify(userData: OtpVerifyDTO) {
    try {
      const { otp, username } = userData;

      const user = await this.userModel.findOne({ username: username });
      if (!user) {
        throw new BadRequestException('User Is Not Exit Please check username');
      }
      if (user.otp !== otp) {
        throw new BadRequestException('Invalid Otp Please check');
      }
      if (user.otpExpire && user.otpExpire.getTime() < Date.now()) {
        user.otp = null;
        user.otpExpire = null;
        await user.save();
        throw new BadRequestException('Otp Is Expire Please Try Agian');
      }

      if (!user.isVerify) {
        user.isVerify = true;
      }

      user.otp = null;
      user.otpExpire = null;
      await user.save();

      return {
        success: true,
        message: 'OTP verified successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error while login user:', error);
      throw new BadRequestException('Error while otp register');
    }
  }

  async updateBio(userData: UpdateBioDTO, req: Request) {
    const userId = (req as AuthenticatedRequest).userId;

    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new BadRequestException('User is not avalible');
      }
      user.Age = userData.Age;
      user.bio = userData.bio;
      user.address = userData.address;
      user.fullname = userData.fullname;

      await user.save();

      return {
        success: true,
        message: 'Bio updated successfully',
        data: {
          username: user.username,
          bio: user.bio,
          address: user.address,
          fullname: user.fullname,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Error while bio update');
    }
  }
}
