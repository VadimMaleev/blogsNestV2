import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { agent as request } from 'supertest';
import { AppModule } from '../src/app.module';

let app: INestApplication;

let token = '';
let userId = '';
let blogId = '';
let postId = '';

const user = {
  login: 'loginTEST',
  email: 'testingbyme@gmail.com',
  password: '123TEST',
};
const loginUser = {
  loginOrEmail: 'loginTEST',
  password: '123TEST',
};
const newBlog = {
  name: 'new blog',
  description: 'new blog',
  websiteUrl: 'testblogs.by',
};
const newPostForBlog = {
  title: 'titlePost',
  shortDescription: 'shortForPost',
  content: 'content for Post',
};
const banUser = {
  isBanned: true,
  banReason: 'ban for test',
};
const unbanUser = {
  isBanned: false,
  banReason: null,
};

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});

describe('check ban unban user and visibility of posts', () => {
  it('delete all data', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/testing/all-data',
    );
    expect(response.status).toBe(204);
  });

  it('should creat new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/sa/users')
      .send(user)
      .set(
        'Authorization',
        'Basic ' + new Buffer('admin:qwerty').toString('base64'),
      );
    userId = response.body.id;
    expect(response).toBeDefined();
    expect(response.status).toBe(201);
    expect(response.body.login).toBe(user.login);
    expect(response.body.email).toBe(user.email);
  });

  describe('login user', () => {
    it('login - should return 200 status', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginUser)
        .set('user-agent', 'test');
      token = response.body.accessToken;
      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
    });
  });

  describe('create new blog', () => {
    it('should create new blog', async () => {
      const response = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .send(newBlog)
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(201);
      blogId = response.body.id;
    });
    it('should create new blog', async () => {
      const response = await request(app.getHttpServer())
        .get('/blogger/blogs')
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(200);
      expect(response.body.items[0].name).toBe(newBlog.name);
    });
  });

  describe('create new post', () => {
    it('should create new post', async () => {
      const response = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blogId}/posts`)
        .send(newPostForBlog)
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(201);
      postId = response.body.id;
    });

    it('should return created post', async () => {
      const response = await request(app.getHttpServer()).get(
        `/posts/${postId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(postId);
      expect(response.body.title).toBe(newPostForBlog.title);
    });
  });

  describe('ban user and check post', () => {
    it('should ban user', async () => {
      const response = await request(app.getHttpServer())
        .put(`/sa/users/${userId}/ban`)
        .set(
          'Authorization',
          'Basic ' + new Buffer('admin:qwerty').toString('base64'),
        )
        .send(banUser);
      expect(response.status).toBe(204);
    });
    it(`shouldn't return created post`, async () => {
      const response = await request(app.getHttpServer()).get(
        `/posts/${postId}`,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('unban user and check post', () => {
    it('should unban user', async () => {
      const response = await request(app.getHttpServer())
        .put(`/sa/users/${userId}/ban`)
        .set(
          'Authorization',
          'Basic ' + new Buffer('admin:qwerty').toString('base64'),
        )
        .send(unbanUser);
      expect(response.status).toBe(204);
    });
    it(`shouldn't return created post`, async () => {
      const response = await request(app.getHttpServer()).get(
        `/posts/${postId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(postId);
      expect(response.body.title).toBe(newPostForBlog.title);
    });
  });
});
