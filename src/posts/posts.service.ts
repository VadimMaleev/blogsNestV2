import { BadRequestException, Injectable } from '@nestjs/common';
import { PostCreateInputModelType } from '../types/input.models';
import { BlogsQueryRepository } from '../blogs/blogs.query.repo';
import { CreatePostDto } from '../types/dto';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from './posts.repo';
import { BlogsForResponse, PostsForResponse } from '../types/types';
import { plugForCreatingPosts } from '../helpers/plug.for.creating.posts.and.comments';

@Injectable()
export class PostsService {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postRepository: PostsRepository,
  ) {}

  async createPost(
    postInputModel: PostCreateInputModelType,
  ): Promise<PostsForResponse | null> {
    const blog = await this.blogsQueryRepository.getOneBlogById(
      postInputModel.blogId,
    );
    if (!blog)
      throw new BadRequestException([
        {
          message: 'bad blogId',
          field: 'blogId',
        },
      ]);

    const newPost = new CreatePostDto(
      uuidv4(),
      postInputModel.title,
      postInputModel.shortDescription,
      postInputModel.content,
      postInputModel.blogId,
      blog.name,
      new Date(),
    );
    await this.postRepository.createPost(newPost);
    return plugForCreatingPosts(newPost);
  }

  async createPostForBlog(
    postInputModel: PostCreateInputModelType,
    blog: BlogsForResponse,
  ) {
    const newPost = new CreatePostDto(
      uuidv4(),
      postInputModel.title,
      postInputModel.shortDescription,
      postInputModel.content,
      blog.id,
      blog.name,
      new Date(),
    );
    await this.postRepository.createPost(newPost);
    return plugForCreatingPosts(newPost);
  }

  async deletePost(id: string) {
    return this.postRepository.deletePost(id);
  }

  async updatePost(id: string, postInputModel: PostCreateInputModelType) {
    return this.postRepository.updatePost(id, postInputModel);
  }
}
