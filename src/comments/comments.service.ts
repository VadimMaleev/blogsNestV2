import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repo';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}
  async deleteCommentById(id: string): Promise<boolean> {
    return await this.commentsRepository.deleteComment(id);
  }
}
