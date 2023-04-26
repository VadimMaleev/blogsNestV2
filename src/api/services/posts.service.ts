import { HttpException, Injectable } from '@nestjs/common';
import {
  PostCreateFromBlogInputModelType,
  PostCreateInputModelType,
} from '../../types/input.models';
import { BlogsQueryRepository } from '../../repositories/blogs/blogs.query.repo';
import { CreatePostDto, UriParamsForBloggersApi } from '../../types/dto';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../repositories/posts/posts.repo';
import { PostsForResponse } from '../../types/types';
import { plugForCreatingPosts } from '../../helpers/plug.for.creating.posts.and.comments';
import { UsersQueryRepository } from '../../repositories/users/users.query.repo';
import { LikesRepository } from '../../repositories/likes/likes.repo';
import { BlogDocument } from '../../repositories/blogs/blogs.schema';

@Injectable()
export class PostsService {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postRepository: PostsRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected likesRepository: LikesRepository,
  ) {}

  async createPost(
    postInputModel: PostCreateInputModelType,
  ): Promise<PostsForResponse | null> {
    const blog = await this.blogsQueryRepository.getOneBlogById(
      postInputModel.blogId,
    );

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
    postInputModel: PostCreateFromBlogInputModelType,
    blog: BlogDocument,
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

  async deletePost(params: UriParamsForBloggersApi, userId: string) {
    const blogForPost: BlogDocument =
      await this.blogsQueryRepository.getOneBlogById(params.blogId);
    if (blogForPost.userId !== userId)
      throw new HttpException('Not your own', 403);
    return this.postRepository.deletePost(params.postId);
  }

  async updatePost(
    postId: string,
    postInputModel: PostCreateInputModelType,
    blogId: string,
    userId: string,
  ) {
    const blogForPost: BlogDocument =
      await this.blogsQueryRepository.getOneBlogById(blogId);
    if (blogForPost.userId !== userId)
      throw new HttpException('Not your own', 403);
    return this.postRepository.updatePost(postId, postInputModel);
  }

  async makeLikeOrUnlike(id: string, userId: string, likeStatus: string) {
    const user = await this.usersQueryRepository.findUserById(userId);
    return this.likesRepository.makeLikeOrUnlike(
      id,
      userId,
      user.login,
      likeStatus,
    );
  }
}
