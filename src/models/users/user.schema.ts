import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ default: '' })
  fullname: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  Age: string;

  @Prop({ default: '' })
  bio: string;

  @Prop()
  profileURL: string;

  @Prop({ default: false })
  isVerify: boolean;

  @Prop({ default: '', type: String })
  otp: string | null;

  @Prop({ default: null, type: Date })
  otpExpire: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
export const UserModel = User.name;
