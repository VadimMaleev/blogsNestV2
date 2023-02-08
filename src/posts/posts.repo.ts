import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../types/dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Model } from 'mongoose';
import { PostCreateInputModel } from '../types/input.models';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(newPost: CreatePostDto) {
    await new this.postModel(newPost).save();
  }

  async deletePost(id: string): Promise<boolean> {
    const postInstance = await this.postModel.findOne({ id: id });
    if (!postInstance) return false;
    await postInstance.deleteOne();
    return true;
  }

  async updatePost(
    id: string,
    postInputModel: PostCreateInputModel,
  ): Promise<boolean> {
    const postInstance = await this.postModel.findOne({ id: id });
    if (!postInstance) return false;
    postInstance.title = postInputModel.title;
    postInstance.shortDescription = postInputModel.shortDescription;
    postInstance.content = postInputModel.content;
    postInstance.blogId = postInputModel.blogId;

    await postInstance.save();
    return true;
  }
}
