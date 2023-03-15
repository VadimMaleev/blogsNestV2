import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repo';
import { v4 as uuidv4 } from 'uuid';
import { CreateCommentDto } from '../types/dto';
import { CommentsForResponse } from '../types/types';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}
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
}
