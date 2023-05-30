import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../repositories/blogs/blogs.repo';
import { BlogCreateInputModelType } from '../../types/input.models';
import { BlogsForResponse } from '../../types/types';
import { CreateBlogDto } from '../../types/dto';
import { v4 as uuidv4 } from 'uuid';
import { BlogDocument } from '../../repositories/blogs/blogs.schema';
import { UserDocument } from '../../repositories/users/users.schema';

@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}

  async createBlog(
    blog: BlogCreateInputModelType,
    userId: string,
    login: string,
  ): Promise<BlogsForResponse> {
    const newBlog = new CreateBlogDto(
      uuidv4(),
      blog.name,
      blog.description,
      blog.websiteUrl,
      new Date(),
      false,
      userId,
      login,
    );

    await this.blogsRepository.createBlog(newBlog);
    return {
      id: newBlog.id,
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
      isMembership: newBlog.isMembership,
    };
  }

  async updateBlog(
    id: string,
    inputModel: BlogCreateInputModelType,
    userId: string,
  ): Promise<boolean> {
    return this.blogsRepository.updateBlog(id, inputModel, userId);
  }

  async deleteBlog(id: string, userId: string): Promise<boolean> {
    return this.blogsRepository.deleteBlog(id, userId);
  }

  async bindBlogToUser(blog: BlogDocument, user: UserDocument) {
    return await this.blogsRepository.bindBlogToUser(blog, user);
  }
}
