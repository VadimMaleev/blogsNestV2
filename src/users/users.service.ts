import { UserCreateInputModelType } from '../types/input.models';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';
import add from 'date-fns/add';
import { UsersRepository } from './users.repo';
import { CreateUserDto } from '../types/dto';
import { Injectable } from '@nestjs/common';
import { UsersForResponse } from '../types/types';

@Injectable()
export class UsersService {
  constructor(
    protected authService: AuthService,
    protected usersRepository: UsersRepository,
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
}
