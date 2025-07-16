import { IsString } from 'class-validator';

export class UpdateBioDTO {
  @IsString()
  Age: string;
  @IsString()
  bio: string;
  @IsString()
  address: string;
  @IsString()
  fullname: string;
}
