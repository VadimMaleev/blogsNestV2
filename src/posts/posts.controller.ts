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
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  CommentCreateInputModel,
  LikeStatusInputModel,
  PostCreateInputModelType,
} from '../types/input.models';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repo';
import { PaginationDto } from '../types/dto';
import { CommentsQueryRepository } from '../comments/comments.query.repo';
import { JwtAuthGuard } from '../guards/jwt.auth.guard';
import { CommentsService } from '../comments/comments.service';
import { ExtractUserIdFromHeadersUseCase } from '../helpers/extract.userId.from.headers';
import { BasicAuthGuard } from '../guards/basic.auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsService: CommentsService,
    protected extractUserIdFromHeadersUseCase: ExtractUserIdFromHeadersUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() postInputModel: PostCreateInputModelType) {
    return this.postsService.createPost(postInputModel);
  }

  @Get(':id')
  async getPostById(
    @Param('id')
    id: string,
    @Request() req,
  ) {
    let userId: string | null = null;
    if (req.headers.authorization) {
      userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    }
    const post = await this.postsQueryRepository.getPostById(id, userId);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  @Get()
  async getPosts(@Query() query: PaginationDto, @Request() req) {
    let userId: string | null = null;
    if (req.headers.authorization) {
      userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    }
    return this.postsQueryRepository.getPosts(query, userId);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async deletePost(@Param('id') id: string) {
    const isDeleted = await this.postsService.deletePost(id);
    if (!isDeleted) throw new NotFoundException('Post not found');
    return isDeleted;
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
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
    @Request() req,
  ) {
    let userId: string | null = null;
    if (req.headers.authorization) {
      userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    }
    const post = await this.postsQueryRepository.findPostById(id);
    if (!post) throw new NotFoundException('Post not found');
    return this.commentsQueryRepository.getCommentsForPost(id, query, userId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Body() inputModel: CommentCreateInputModel,
    @Param('id') id: string,
    @Request() req,
  ) {
    const post = await this.postsQueryRepository.findPostById(id);
    if (!post) throw new NotFoundException();
    return await this.commentsService.createComment(
      id,
      inputModel.content,
      req.user.id,
      req.user.login,
    );
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async addLikeStatusForPost(
    @Body() inputModel: LikeStatusInputModel,
    @Param('id') id: string,
    @Request() req,
  ) {
    const post = await this.postsQueryRepository.findPostById(id);
    if (!post) throw new NotFoundException();
    const userId: string | null =
      await this.extractUserIdFromHeadersUseCase.execute(req);
    await this.postsService.makeLikeOrUnlike(id, userId, inputModel.likeStatus);
  }
}
