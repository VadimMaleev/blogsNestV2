export const mapCommentsForBlog = (obj) => ({
  id: obj.id,
  content: obj.content,
  commentatorInfo: {
    userId: obj.userId,
    userLogin: obj.userLogin,
  },
  createdAt: obj.createdAt,
  postInfo: {
    id: obj.postInfo.id,
    title: obj.postInfo.title,
    blogId: obj.postInfo.blogId,
    blogName: obj.postInfo.blogName,
  },
});
