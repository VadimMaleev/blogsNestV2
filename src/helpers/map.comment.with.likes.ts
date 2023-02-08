import { CommentsForResponse } from '../types/types';

export const mapCommentWithLikes = async (
  comment,
): Promise<CommentsForResponse> => ({
  id: comment.id,
  content: comment.content,
  commentatorInfo: {
    userId: comment.userId,
    userLogin: comment.userLogin,
  },
  createdAt: comment.createdAt,
  likesInfo: {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: 'None',
  },
});
