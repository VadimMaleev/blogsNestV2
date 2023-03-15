import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostCreateInputModelType } from '../types/input.models';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repo';
import { PaginationDto } from '../types/dto';
import { CommentsQueryRepository } from '../comments/comments.query.repo';
import { JwtAuthGuard } from '../guards/jwt.auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Post()
  @HttpCode(201)
  async createPost(@Body() postInputModel: PostCreateInputModelType) {
    return this.postsService.createPost(postInputModel);
  }

  @Get(':id')
  async getPostById(
    @Param('id')
    id: string,
  ) {
    const post = await this.postsQueryRepository.getPostById(id);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  @Get()
  async getPosts(@Query() query: PaginationDto) {
    return this.postsQueryRepository.getPosts(query);
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    const isDeleted = await this.postsService.deletePost(id);
    if (!isDeleted) throw new NotFoundException('Post not found');
    return isDeleted;
  }

  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() postInputModel: PostCreateInputModelType,
  ) {
    const isUpdated = await this.postsService.updatePost(id, postInputModel);
    if (!isUpdated) throw new NotFoundException('Post not found');
    return isUpdated;
  }

  @Get(':id/comments')
  async getCommentsForPost(
    @Param('id') id: string,
    @Query() query: PaginationDto,
  ) {
    const post = await this.postsQueryRepository.getPostById(id);
    if (!post) throw new NotFoundException('Post not found');
    return this.commentsQueryRepository.getCommentsForPost(id, query);
  }
}
