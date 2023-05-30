import { Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';

import { GenerateHashUseCase } from './generate.hash.useCase';
import { UsersRepository } from '../repositories/users/users.repo';
import { EmailAdapter } from '../adapters/email-adapter';
import { UserCreateInputModelType } from '../types/input.models';
import { CreateUserDto } from '../types/dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailAdapter: EmailAdapter,
    protected generateHashUseCase: GenerateHashUseCase,
  ) {}

  async execute(user: UserCreateInputModelType) {
    const hash = await this.generateHashUseCase.execute(user.password);
    const newUser = new CreateUserDto(
      uuidv4(),
      user.login,
      user.email,
      hash,
      new Date(),
      uuidv4(),
      add(new Date(), { hours: 3 }),
      false,
      false,
      null,
      'notBanned',
    );
    await this.usersRepository.createUser(newUser);
    await this.emailAdapter.sendEmailConfirmationCode(
      newUser.confirmationCode,
      newUser.email,
    );

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
}
