import {
  CommentsForResponse,
  CommentsPaginationResponse,
} from '../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comments.shema';
import { mapCommentWithLikes } from '../helpers/map.comment.with.likes';
import { PaginationDto } from '../types/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getCommentById(id: string): Promise<CommentsForResponse | null> {
    const comment = await this.commentModel.findOne({ id: id });
    if (!comment) return null;
    return mapCommentWithLikes(comment);
  }

  async getCommentsForPost(
    id: string,
    query: PaginationDto,
  ): Promise<CommentsPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.commentModel
      .find({ postId: id })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .lean();

    const itemsWithLikes = await Promise.all(
      items.map(async (i) => {
        const result: CommentsForResponse = await mapCommentWithLikes(i);
        return result;
      }),
    );
    return {
      pagesCount: Math.ceil(
        (await this.commentModel.count({ postId: id })) / pageSize,
      ),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.commentModel.count({ postId: id }),
      items: itemsWithLikes,
    };
  }
}
