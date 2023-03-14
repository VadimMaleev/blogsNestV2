import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import {
  NewPasswordInputModelType,
  UserCreateInputModelType,
} from '../types/input.models';
import { CreateDeviceDto, CreateUserDto, RecoveryCodeDto } from '../types/dto';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UsersRepository } from '../users/users.repo';
import { EmailAdapter } from '../adapters/email-adapter';
import { UsersQueryRepository } from '../users/users.query.repo';
import { RecoveryCodeRepository } from '../recovery.codes/recovery.code.repo';
import { UserDocument } from '../users/users.schema';
import { JWTService } from '../application/jwt.service';
import { randomUUID } from 'crypto';
import { DevicesRepository } from '../devices/devices.repository';
import { DevicesQueryRepository } from '../devices/devices.query.repository';
import { JwtRepository } from './jwt.repository';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailAdapter: EmailAdapter,
    protected usersQueryRepository: UsersQueryRepository,
    protected recoveryCodeRepository: RecoveryCodeRepository,
    protected jwtService: JWTService,
    protected devicesRepository: DevicesRepository,
    protected devicesQueryRepository: DevicesQueryRepository,
    protected jwtRepository: JwtRepository,
  ) {}

  async generateHash(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async createUser(user: UserCreateInputModelType) {
    const hash = await this.generateHash(user.password);
    const newUser = new CreateUserDto(
      uuidv4(),
      user.login,
      user.email,
      hash,
      new Date(),
      uuidv4(),
      add(new Date(), { hours: 3 }),
      false,
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
    };
  }

  async checkCredential(loginOrEmail: string, password: string) {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );
    if (!user) return null;
    const isCompare = await bcrypt.compare(password, user.passwordHash);
    return isCompare ? user : null;
  }

  async passwordRecovery(userId: string, email: string) {
    const code = uuidv4();
    const recoveryCode = new RecoveryCodeDto(
      code,
      add(new Date(), { hours: 3 }),
      userId,
    );
    await this.recoveryCodeRepository.createRecoveryCode(recoveryCode);
    await this.emailAdapter.passwordRecovery(code, email);
  }

  async newPassword(inputModel: NewPasswordInputModelType): Promise<boolean> {
    const code = await this.recoveryCodeRepository.findCode(
      inputModel.recoveryCode,
    );
    if (!code) return false;
    if (code.codeExpirationDate < new Date()) return false;

    const newPasswordHash = await bcrypt.hash(inputModel.newPassword, 10);

    await this.recoveryCodeRepository.deleteCode(inputModel.recoveryCode);
    return await this.usersRepository.updatePassword(
      newPasswordHash,
      code.userId,
    );
  }

  async createToken(user: UserDocument) {
    return this.jwtService.createJWT(user);
  }

  async createRefreshToken(user: UserDocument, ip: string, deviceName: string) {
    const deviceId = randomUUID();
    const refreshToken = await this.jwtService.createRefreshJWT(user, deviceId);
    const lastActiveDate =
      this.jwtService.getLastActiveDateFromRefreshToken(refreshToken);

    const device = new CreateDeviceDto(
      ip,
      deviceName,
      lastActiveDate,
      deviceId,
      user.id,
    );
    await this.devicesRepository.createDevice(device);
    return refreshToken;
  }

  async refreshToken(user: UserDocument, oldRefreshToken: string) {
    const jwtPayload = await this.jwtService.extractPayloadFromToken(
      oldRefreshToken,
    );
    const userId = user.id;
    const deviceId = jwtPayload.deviceId;
    const lastActiveDate = new Date(jwtPayload.iat * 1000).toISOString();
    const device =
      await this.devicesQueryRepository.findDeviceByDeviceAndUserIdAndDate(
        deviceId,
        userId,
        lastActiveDate,
      );
    if (!device) return null;
    const refreshToken = await this.jwtService.createRefreshJWT(user, deviceId);
    const newLastActiveDate =
      this.jwtService.getLastActiveDateFromRefreshToken(refreshToken);
    const isDateUpdated =
      await this.devicesRepository.updateLastActiveDateByDeviceAndUserId(
        deviceId,
        userId,
        newLastActiveDate,
      );
    if (!isDateUpdated) return null;
    await this.jwtRepository.expireRefreshToken(oldRefreshToken);
    return refreshToken;
  }

  async logout(userId: string, oldRefreshToken: string) {
    const jwtPayload = await this.jwtService.extractPayloadFromToken(
      oldRefreshToken,
    );
    const deviceId = jwtPayload.deviceId;
    const lastActiveDate = new Date(jwtPayload.iat * 1000).toISOString();
    await this.jwtRepository.expireRefreshToken(oldRefreshToken);
    return this.devicesRepository.findAndDeleteDeviceByDeviceAndUserIdAndDate(
      userId,
      deviceId,
      lastActiveDate,
    );
  }
}
