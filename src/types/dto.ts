//Query
export class PaginationDto {
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
}

export class BlogsQueryDto extends PaginationDto {
  searchNameTerm: string;
}

export class UsersQueryDto extends PaginationDto {
  searchLoginTerm: string;
  searchEmailTerm: string;
}

//Create
export class CreateBlogDto {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: Date,
    public isMembership: boolean,
  ) {}
}

export class CreateUserDto {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public passwordHash: string,
    public createdAt: Date,
    public confirmationCode: string,
    public codeExpirationDate: Date,
    public isConfirmed: boolean,
  ) {}
}

export class CreatePostDto {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: Date,
  ) {}
}

export class CreateCommentDto {
  constructor(
    public id: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public createdAt: Date,
    public postId: string,
  ) {}
}

export class RecoveryCodeDto {
  constructor(
    public code: string,
    public codeExpirationDate: Date,
    public userId: string,
  ) {}
}

export class CreateDeviceDto {
  constructor(
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public deviceId: string,
    public userId: string,
  ) {}
}
