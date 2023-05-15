import { HttpException, Injectable } from '@nestjs/common';
import {
  PostCreateFromBlogInputModelType,
  PostUpdateInputModelType,
} from '../../types/input.models';
import { BlogsQueryRepository } from '../../repositories/blogs/blogs.query.repo';
import { CreatePostDto, UriParamsForBloggersApi } from '../../types/dto';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../repositories/posts/posts.repo';
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

  async createPostForBlog(
    postInputModel: PostCreateFromBlogInputModelType,
    blog: BlogDocument,
    userId: string,
  ) {
    const newPost = new CreatePostDto(
      uuidv4(),
      postInputModel.title,
      postInputModel.shortDescription,
      postInputModel.content,
      blog.id,
      blog.name,
      new Date(),
      userId,
      true,
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
    postInputModel: PostUpdateInputModelType,
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
