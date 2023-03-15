import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Blog, BlogSchema } from './blogs/blogs.schema';
import { BlogsQueryRepository } from './blogs/blogs.query.repo';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repo';
import { UsersQueryRepository } from './users/users.query.repo';
import { AuthService } from './auth/auth.service';
import { User, UserSchema } from './users/users.schema';
import { Post, PostSchema } from './posts/posts.schema';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repo';
import { PostsQueryRepository } from './posts/posts.query.repo';
import { Comment, CommentSchema } from './comments/comments.shema';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repo';
import { CommentsQueryRepository } from './comments/comments.query.repo';
import { TestingController } from './testing/testing.controller';
import {
  RecoveryCode,
  RecoveryCodeSchema,
} from './recovery.codes/recovery.code.schema';
import { RecoveryCodeRepository } from './recovery.codes/recovery.code.repo';
import { EmailAdapter } from './adapters/email-adapter';
import { JWTService } from './application/jwt.service';
import { AuthController } from './auth/auth.controller';
import { DevicesRepository } from './devices/devices.repository';
import { DevicesQueryRepository } from './devices/devices.query.repository';
import { Device, DeviceSchema } from './devices/devices.schema';
import { ThrottlerModule } from '@nestjs/throttler';
import { DevicesController } from './devices/devices.controller';
import { DevicesService } from './devices/devices.service';
import { JwtBlackList, JwtTokensSchema } from './application/jwt.schema';
import { JwtRepository } from './application/jwt.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.mongooseUri),
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: RecoveryCode.name, schema: RecoveryCodeSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: JwtBlackList.name, schema: JwtTokensSchema },
    ]),
  ],
  controllers: [
    AppController,
    BlogsController,
    UsersController,
    PostsController,
    CommentsController,
    TestingController,
    AuthController,
    DevicesController,
  ],
  providers: [
    AppService,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    RecoveryCodeRepository,
    EmailAdapter,
    JWTService,
    DevicesService,
    DevicesRepository,
    DevicesQueryRepository,
    JwtRepository,
  ],
})
export class AppModule {}
