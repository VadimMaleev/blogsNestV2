import { UserCreateInputModelType } from '../../types/input.models';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import add from 'date-fns/add';
import { UsersRepository } from '../../repositories/users/users.repo';
import { CreateUserDto } from '../../types/dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersForResponse } from '../../types/types';
import { UsersQueryRepository } from '../../repositories/users/users.query.repo';
import { EmailAdapter } from '../../adapters/email-adapter';
import { UserDocument } from '../../repositories/users/users.schema';
import { DevicesRepository } from '../public.api/devices/devices.repository';
import { PostsRepository } from '../../repositories/posts/posts.repo';
import { CommentsRepository } from '../../repositories/comments/comments.repo';
import { LikesRepository } from '../../repositories/likes/likes.repo';

@Injectable()
export class UsersService {
  constructor(
    protected authService: AuthService,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected emailAdapter: EmailAdapter,
    protected devicesRepository: DevicesRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    protected likesRepository: LikesRepository,
  ) {}

  async createUser(user: UserCreateInputModelType): Promise<UsersForResponse> {
    const hash = await this.authService.generateHash(user.password);
    const newUser = new CreateUserDto(
      uuidv4(),
      user.login,
      user.email,
      hash,
      new Date(),
      uuidv4(),
      add(new Date(), { hours: 3 }),
      true,
      false,
      null,
      'notBanned',
    );
    await this.usersRepository.createUser(newUser);

    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
      banInfo: {
        isBanned: newUser.isBanned,
        banDate: newUser.banDate,
        banReason: newUser.banReason,
      },
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.usersRepository.deleteUser(id);
  }

  async confirmUser(code: string): Promise<boolean> {
    const user = await this.usersQueryRepository.findUserByCode(code);
    if (!user) return false;
    if (user.isConfirmed) return false;
    if (user.confirmationCode !== code) return false;
    if (user.codeExpirationDate < new Date()) return false;

    return await this.usersRepository.updateConfirmation(user.id);
  }

  async createNewConfirmationCode(userId: string, email: string) {
    const confirmCode = uuidv4();
    const expirationDate = add(new Date(), { hours: 3 });
    await this.usersRepository.updateConfirmCode(
      userId,
      confirmCode,
      expirationDate,
    );
    await this.emailAdapter.sendEmailConfirmationCode(confirmCode, email);
  }

  async banOrUnbanUser(id: string, banStatus: boolean, banReason: string) {
    const user: UserDocument = await this.usersQueryRepository.findUserById(id);
    if (!user) throw new BadRequestException();

    await this.usersRepository.updateBanStatus(user, banStatus, banReason);

    if (banStatus === true) {
      await this.devicesRepository.deleteDevicesForBannedUser(id);
    }

    await this.postsRepository.updateVisibleStatus(id, banStatus);
    await this.commentsRepository.updateVisibleStatus(id, banStatus);
    await this.likesRepository.updateVisibleStatus(id, banStatus);
  }
}
