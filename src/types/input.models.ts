import { IsEnum, Length, Matches } from 'class-validator';
import { LikesStatusEnum } from './types';
import { Transform } from 'class-transformer';
import { trimHelper } from '../helpers/trim.helper';

export class BlogCreateInputModelType {
  @Transform(trimHelper)
  @Length(3, 15)
  name: string;

  @Transform(trimHelper)
  @Length(3, 500)
  description: string;

  @Transform(trimHelper)
  @Length(3, 100)
  @Matches(/^https:\/\/([a-zA-Z\d_-]+\.)+[a-zA-Z\d_-]+$/)
  websiteUrl: string;
}

export class UserCreateInputModelType {
  @Transform(trimHelper)
  @Length(3, 10)
  @Matches(/^[a-zA-Z\d_-]*$/)
  login: string;

  @Transform(trimHelper)
  @Length(6, 20)
  password: string;

  @Transform(trimHelper)
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class PostCreateInputModelType {
  @Transform(trimHelper)
  @Length(3, 30)
  title: string;

  @Transform(trimHelper)
  @Length(3, 100)
  shortDescription: string;

  @Transform(trimHelper)
  @Length(3, 1000)
  content: string;

  blogId: string;
}

export class EmailInputModelType {
  @Transform(trimHelper)
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class LoginInputModelType {
  @Transform(trimHelper)
  loginOrEmail: string;

  @Transform(trimHelper)
  @Length(6, 20)
  password: string;
}

export class NewPasswordInputModelType {
  @Transform(trimHelper)
  @Length(6, 20)
  newPassword: string;

  recoveryCode: string;
}

export class CommentCreateInputModel {
  @Transform(trimHelper)
  @Length(20, 300)
  content: string;
}

export class LikeStatusInputModel {
  @IsEnum(LikesStatusEnum)
  likeStatus: string;
}
