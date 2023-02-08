export type BlogCreateInputModelType = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type UserCreateInputModelType = {
  login: string;
  password: string;
  email: string;
};

export type PostCreateInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
