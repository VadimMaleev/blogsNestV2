import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../guards/jwt.auth.guard';
import { BanUserInputModel } from '../../../types/input.models';
import { UsersService } from '../../../application/services/users.service';
import { LoginQueryDto } from '../../../types/dto';
import { BlogsQueryRepository } from '../../../repositories/blogs/blogs.query.repo';
import { BlogDocument } from '../../../repositories/blogs/blogs.schema';
import { BannedUsersForBlogRepository } from '../../../repositories/users/banned.users.for.blog.repo';

@Controller('bloggers/users')
export class BloggersUsersController {
  constructor(
    protected usersService: UsersService,
    protected blogQueryRepository: BlogsQueryRepository,
    protected bannedUsersForBlogRepository: BannedUsersForBlogRepository,
  ) {}

  @Put(':id/ban')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateUserBanStatusForBlog(
    @Param('id') id: string,
    @Body() inputModel: BanUserInputModel,
    @Request() req,
  ) {
    return this.usersService.updateUserBanStatusForBlog(
      id,
      inputModel.isBanned,
      inputModel.banReason,
      req.user.id,
    );
  }

  @Get('blog/:id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getBannedUsersForBLog(
    @Param('id') id: string,
    @Query() query: LoginQueryDto,
  ) {
    const blog: BlogDocument = await this.blogQueryRepository.getOneBlogById(
      id,
    );
    if (!blog) throw new NotFoundException('Blog Not Found');
    return this.bannedUsersForBlogRepository.getBannedUsersForBlog(
      blog.id,
      query,
    );
  }
}