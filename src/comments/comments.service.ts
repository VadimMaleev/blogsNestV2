import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repo';
import { v4 as uuidv4 } from 'uuid';
import { CreateCommentDto } from '../types/dto';
import { CommentsForResponse } from '../types/types';
import { UsersQueryRepository } from '../users/users.query.repo';
import { LikesRepository } from '../likes/likes.repo';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected likesRepository: LikesRepository,
  ) {}
  async deleteCommentById(id: string): Promise<boolean> {
    return await this.commentsRepository.deleteComment(id);
  }

  async createComment(
    postId: string,
    content: string,
    userId: string,
    login: string,
  ): Promise<CommentsForResponse> {
    const newComment = new CreateCommentDto(
      uuidv4(),
      content,
      userId,
      login,
      new Date(),
      postId,
    );
    return await this.commentsRepository.createComment(newComment);
  }

  async updateComment(id: string, content: string): Promise<boolean> {
    return await this.commentsRepository.updateComment(id, content);
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
