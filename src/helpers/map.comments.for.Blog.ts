export const mapCommentsForBlog = (obj, userId: string) => {
  let myStatus = 'None';
  let likesCount = 0;
  let dislikeCount = 0;

  obj.likesInfo.forEach((like) => {
    if (like.userId === userId) {
      myStatus = like.status;
    }

    if (like.status === 'like') {
      likesCount += 1;
    }

    if (like.status === 'dislike') {
      dislikeCount += 1;
    }
  });

  return {
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
    likesInfo: {
      likesCount,
      dislikeCount,
      myStatus,
    },
  };
};
