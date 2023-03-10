import { UserCreateInputModelType } from '../types/input.models';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';
import add from 'date-fns/add';
import { UsersRepository } from './users.repo';
import { CreateUserDto } from '../types/dto';
import { Injectable } from '@nestjs/common';
import { UsersForResponse } from '../types/types';
import { UsersQueryRepository } from './users.query.repo';
import { EmailAdapter } from '../adapters/email-adapter';

@Injectable()
export class UsersService {
  constructor(
    protected authService: AuthService,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected emailAdapter: EmailAdapter,
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
    );
    await this.usersRepository.createUser(newUser);

    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
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
}
