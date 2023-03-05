import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersQueryRepository } from '../users/users.query.repo';
import { JWTService } from '../application/jwt.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshAuthGuard implements CanActivate {
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected jwtService: JWTService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const refreshTokenFromCookie = req.cookies.refreshToken;
    if (!refreshTokenFromCookie) throw new UnauthorizedException();

    const payload = await this.jwtService.extractPayloadFromToken(
      refreshTokenFromCookie,
    );
    if (!payload) throw new UnauthorizedException();

    const user = await this.usersQueryRepository.findUserById(payload.userId);
    if (!user) throw new UnauthorizedException();
    req.user = user;
    return true;
  }
}