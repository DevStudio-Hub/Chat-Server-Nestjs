import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserModel } from 'src/models/users/user.schema';

@Injectable()
export class SearchService {
  constructor(@InjectModel(UserModel) private userModel: Model<User>) {}
  async searchUsers(query: string, userId: string) {
    try {
      if (query.length < 2) {
        return;
      }
      const users = await this.userModel
        .find({
          username: { $regex: query, $options: 'i' },
          _id: { $ne: userId },
        })
        .limit(10)
        .select('username profileURL _id');
      return {
        users,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('server error');
    }
  }

  async SearchUserInfo(userId: string) {
    try {
      const user = await this.userModel
        .findOne({ _id: userId })
        .select('username fullname address gender Age bio profileURL _id');
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Server error');
    }
  }
}
