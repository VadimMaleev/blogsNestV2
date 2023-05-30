import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../repositories/users/users.query.repo';

@Injectable()
export class CheckCredentialsUseCase {
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async execute(loginOrEmail: string, password: string) {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );
    if (!user) return null;
    const isCompare = await bcrypt.compare(password, user.passwordHash);
    return isCompare ? user : null;
  }
}
