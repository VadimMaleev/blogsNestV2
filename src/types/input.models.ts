import { IsEnum, Length, Matches } from 'class-validator';
import { LikesStatusEnum } from './types';

export class BlogCreateInputModelType {
  @Length(3, 15)
  name: string;

  @Length(3, 500)
  description: string;

  @Length(3, 100)
  @Matches(/^https:\/\/([a-zA-Z\d_-]+\.)+[a-zA-Z\d_-]+$/)
  websiteUrl: string;
}

export class UserCreateInputModelType {
  @Length(3, 10)
  @Matches(/^[a-zA-Z\d_-]*$/)
  login: string;

  @Length(6, 20)
  password: string;

  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class PostCreateInputModelType {
  @Length(3, 30)
  title: string;

  @Length(3, 100)
  shortDescription: string;

  @Length(3, 1000)
  content: string;

  blogId: string;
}

export class EmailInputModelType {
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class LoginInputModelType {
  loginOrEmail: string;

  @Length(6, 20)
  password: string;
}

export class NewPasswordInputModelType {
  @Length(6, 20)
  newPassword: string;

  recoveryCode: string;
}

export class CommentCreateInputModel {
  @Length(20, 300)
  content: string;
}

export class LikeStatusInputModel {
  @IsEnum(LikesStatusEnum)
  likeStatus: string;
}
