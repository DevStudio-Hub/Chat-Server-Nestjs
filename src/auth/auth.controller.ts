import { Body, Controller, Post, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserRegisterDTO } from './dto/register.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginUserDTO } from './dto/login.dto';
import { OtpVerifyDTO } from './dto/otpVerify.dto';
import { UpdateBioDTO } from './dto/updateBio.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('Register')
  @UsePipes(new ValidationPipe())
  async register(@Body() userData: UserRegisterDTO, @Res({ passthrough: true }) res: Response) {
    const { token, newUser } = await this.authService.register(userData);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return {
      message: 'User registered successfully',
      isLogin: true,
      user: {
        _id: newUser._id,
        username: newUser.username,
        gender: newUser.gender,
        Age: newUser.Age,
        bio: newUser.bio,
        address: newUser.address,
        fullname: newUser.fullname,
        profileURL: newUser.profileURL,
        email: newUser.email,
      },
    };
  }

  @Post('Login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginUser: LoginUserDTO, @Res({ passthrough: true }) res: Response) {
    const { exitingUser, token } = await this.authService.login(loginUser);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return {
      message: 'User login successfully',
      isLogin: true,
      user: {
        _id: exitingUser._id,
        username: exitingUser.username,
        gender: exitingUser.gender,
        Age: exitingUser.Age,
        bio: exitingUser.bio,
        address: exitingUser.address,
        fullname: exitingUser.fullname,
        profileURL: exitingUser.profileURL,
        email: exitingUser.email,
      },
    };
  }

  @Post('otpVerify')
  @UsePipes(new ValidationPipe())
  async otpVerify(@Body() otpVerifyData: OtpVerifyDTO) {
    const reqData = await this.authService.otpVerify(otpVerifyData);
    return reqData;
  }

  @Post('LogOut')
  LogOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return { success: true, isLogOut: true, message: 'logout successfully' };
  }

  @Post('Update-Bio')
  @UsePipes(new ValidationPipe())
  updateBio(@Body() updateData: UpdateBioDTO, @Req() req: Request) {
    const bioResult = this.authService.updateBio(updateData, req);
    return bioResult;
  }
}
