import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './comments.shema';
import { Model } from 'mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async deleteComment(id: string): Promise<boolean> {
    const commentInstance = await this.commentModel.findOne({ id: id });
    if (!commentInstance) return false;

    await commentInstance.deleteOne();
    return true;
  }
}
