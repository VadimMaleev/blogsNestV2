import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BannedUserForBlog,
  BannedUsersForBlogDocument,
} from './banned.users.for.blog.schema';
import { Model } from 'mongoose';
import { BannedUserForBlogDto, LoginQueryDto } from '../../types/dto';
import { mapBannedUsersForBlog } from '../../helpers/map.banned.users.for.blog';
import { BannedUsersForBlogResponse } from '../../types/types';

@Injectable()
export class BannedUsersForBlogRepository {
  constructor(
    @InjectModel(BannedUserForBlog.name)
    private bannedUserForBlogModel: Model<BannedUsersForBlogDocument>,
  ) {}

  async addUser(bannedUser: BannedUserForBlogDto) {
    await new this.bannedUserForBlogModel(bannedUser).save();
  }

  async deleteUser(userId: string) {
    const userInstance = await this.bannedUserForBlogModel.findOne({
      userId: userId,
    });
    if (!userId) return false;
    await userInstance.deleteOne();
    return true;
  }

  async getBannedUsersForBlog(
    blogId: string,
    query: LoginQueryDto,
  ): Promise<BannedUsersForBlogResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';
    const login: string = query.searchLoginTerm || '';

    const queryFetch = {};
    if (login) {
      queryFetch['userLogin'] = { $regex: `(?i)(${login})` };
    }

    const items = await this.bannedUserForBlogModel
      .find({
        blogId: blogId,
        ...queryFetch,
      })
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const itemsForResponse = items.map(mapBannedUsersForBlog);

    return {
      pagesCount: Math.ceil(
        (await this.bannedUserForBlogModel.count(queryFetch)) / pageSize,
      ),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.bannedUserForBlogModel.count(queryFetch),
      items: itemsForResponse,
    };
  }
}
