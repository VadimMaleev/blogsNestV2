import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from './blogs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogCreateInputModelType } from '../types/input.models';
import { CreateBlogDto } from '../types/dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createBlog(newBlog: CreateBlogDto) {
    await new this.blogModel(newBlog).save();
  }

  async deleteBlog(id: string): Promise<boolean> {
    const blogInstance = await this.blogModel.findOne({ id: id });
    if (!blogInstance) return false;
    await blogInstance.deleteOne();
    return true;
  }

  async updateBlog(
    id: string,
    inputModel: BlogCreateInputModelType,
  ): Promise<boolean> {
    const blogInstance = await this.blogModel.findOne({ id: id });
    if (!blogInstance) return false;
    blogInstance.name = inputModel.name;
    blogInstance.description = inputModel.description;
    blogInstance.websiteUrl = inputModel.websiteUrl;

    await blogInstance.save();
    return true;
  }
}
