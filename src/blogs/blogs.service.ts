import { BlogsRepository } from './blogs.repo';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Model } from 'mongoose';
import { BlogCreateInputModelType } from '../types/input.models';
import { BlogsForResponse } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { CreateBlogDto } from '../types/dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    protected blogsRepository: BlogsRepository,
  ) {}

  async createBlog(blog: BlogCreateInputModelType): Promise<BlogsForResponse> {
    const newBlog = new CreateBlogDto(
      uuidv4(),
      blog.name,
      blog.description,
      blog.websiteUrl,
      new Date(),
    );

    await this.blogsRepository.createBlog(newBlog);
    return {
      id: newBlog.id,
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
    };
  }

  async deleteBlog(id: string): Promise<boolean> {
    return this.blogsRepository.deleteBlog(id);
  }

  async updateBlog(
    id: string,
    inputModel: BlogCreateInputModelType,
  ): Promise<boolean> {
    return this.blogsRepository.updateBlog(id, inputModel);
  }
}
