import { Injectable } from '@nestjs/common';
import {
  BlogsForResponse,
  PostsForResponse,
  PostsPaginationResponse,
} from '../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Model } from 'mongoose';
import { mapPostWithLikes } from '../helpers/map.post.with.likes';
import { PaginationDto } from '../types/dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getPostById(id: string): Promise<PostsForResponse | null> {
    const post = await this.postModel.findOne({ id: id });
    if (!post) return null;
    return mapPostWithLikes(post);
  }

  async getPosts(query: PaginationDto): Promise<PostsPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.postModel
      .find()
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .lean();
    const itemsWithLikes = await Promise.all(
      items.map(async (i) => {
        const result: PostsForResponse = await mapPostWithLikes(i);
        return result;
      }),
    );
    return {
      pagesCount: Math.ceil((await this.postModel.count({})) / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.postModel.count({}),
      items: itemsWithLikes,
    };
  }

  async getPostsForBlog(
    blog: BlogsForResponse,
    query: PaginationDto,
  ): Promise<PostsPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.postModel
      .find({ blogId: blog.id })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .lean();
    const itemsWithLikes = await Promise.all(
      items.map(async (i) => {
        const result: PostsForResponse = await mapPostWithLikes(i);
        return result;
      }),
    );
    return {
      pagesCount: Math.ceil(
        (await this.postModel.count({ blogId: blog.id })) / pageSize,
      ),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.postModel.count({ blogId: blog.id }),
      items: itemsWithLikes,
    };
  }
}
