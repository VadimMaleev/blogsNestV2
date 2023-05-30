import { Injectable } from '@nestjs/common';
import { JWTService } from '../application/jwt.service';
import { JwtRepository } from '../application/jwt.repository';
import { DevicesRepository } from '../repositories/devices/devices.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    protected jwtService: JWTService,
    protected devicesRepository: DevicesRepository,

    protected jwtRepository: JwtRepository,
  ) {}

  async execute(userId: string, oldRefreshToken: string) {
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
