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
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './blogs.query.repo';
import {
  BlogCreateInputModelType,
  PostCreateInputModelType,
} from '../types/input.models';
import { BlogsQueryDto, PaginationDto } from '../types/dto';
import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query.repo';
import { ExtractUserIdFromHeadersUseCase } from '../helpers/extract.userId.from.headers';
import { BasicAuthGuard } from '../guards/basic.auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected extractUserIdFromHeadersUseCase: ExtractUserIdFromHeadersUseCase,
  ) {}

  @Get()
  async getBlogs(@Query() query: BlogsQueryDto) {
    return this.blogsQueryRepository.getBlogs(query);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.getOneBlogById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  @Post()
  @HttpCode(201)
  async createBlog(@Body() blogInputModel: BlogCreateInputModelType) {
    return this.blogsService.createBlog(blogInputModel);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    const isDeleted = await this.blogsService.deleteBlog(id);
    if (!isDeleted) throw new NotFoundException('Blog not found');
    return isDeleted;
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async updateBlog(
    @Param('id') id: string,
    @Body() inputModel: BlogCreateInputModelType,
  ) {
    const isUpdated = await this.blogsService.updateBlog(id, inputModel);
    if (!isUpdated) throw new NotFoundException('Blog not found');
    return isUpdated;
  }

  @Post(':id/posts')
  @HttpCode(201)
  async createPostForBlog(
    @Param('id') id: string,
    @Body() postInputModel: PostCreateInputModelType,
  ) {
    const blog = await this.blogsQueryRepository.getOneBlogById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    return this.postsService.createPostForBlog(postInputModel, blog);
  }

  @Get(':id/posts')
  async getPostsForBlog(
    @Param('id') id: string,
    @Query() query: PaginationDto,
    @Request() req,
  ) {
    let userId: string | null = null;
    if (req.headers.authorization) {
      userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    }
    const blog = await this.blogsQueryRepository.getOneBlogById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    return this.postsQueryRepository.getPostsForBlog(blog, query, userId);
  }
}
