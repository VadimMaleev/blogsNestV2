import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../types/dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Model } from 'mongoose';
import { PostCreateInputModelType } from '../types/input.models';

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
    postInputModel: PostCreateInputModelType,
  ): Promise<boolean> {
    const postInstance: PostDocument = await this.postModel.findOne({ id: id });
    if (!postInstance) return false;
    postInstance.updatePost(postInputModel);

    await postInstance.save();
    return true;
  }
}
