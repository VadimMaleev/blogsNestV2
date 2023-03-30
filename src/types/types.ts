//Blogs
export type BlogsForResponse = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

export type BlogsPaginationResponse = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogsForResponse[];
};

//Users

export type UsersForResponse = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export type UsersPaginationResponse = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UsersForResponse[];
};

//Posts

export type PostsForResponse = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: 0;
    dislikesCount: 0;
    myStatus: 'None';
    newestLikes: [];
  };
};

export type PostsPaginationResponse = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostsForResponse[];
};

//Comments

export type CommentsPaginationResponse = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentsForResponse[];
};

export type CommentsForResponse = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
};

//Enums
export enum LikesStatusEnum {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}
