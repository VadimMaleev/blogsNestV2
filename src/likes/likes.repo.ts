import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument } from './likes.schema';
import { Model } from 'mongoose';
import { LikesStatusEnum } from '../types/types';

export class LikesRepository {
  constructor(
    @InjectModel(Like.name) private likesModel: Model<LikeDocument>,
  ) {}

  async likesCount(id: string): Promise<number> {
    return this.likesModel.count({ idOfEntity: id, status: 'Like' });
  }

  async dislikeCount(id: string): Promise<number> {
    return this.likesModel.count({ idOfEntity: id, status: 'Dislike' });
  }

  async getMyStatus(id: string, userId?: string | null): Promise<string> {
    if (!userId) return LikesStatusEnum.None;
    const likeOrDislike = await this.likesModel.findOne({
      idOfEntity: id,
      userId: userId,
    });
    if (!likeOrDislike) return LikesStatusEnum.None;
    return likeOrDislike.status;
  }
}
