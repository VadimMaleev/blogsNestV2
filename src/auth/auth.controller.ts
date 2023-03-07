import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { UsersQueryRepository } from '../users/users.query.repo';
import { AuthService } from './auth.service';
import {
  EmailInputModelType,
  LoginInputModelType,
  NewPasswordInputModelType,
  UserCreateInputModelType,
} from '../types/input.models';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../guards/jwt.auth.guard';
import { JwtRefreshAuthGuard } from '../guards/jwt.refresh.auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected authService: AuthService,
    protected usersService: UsersService,
  ) {}

  @Post('registration')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  async registration(@Body() userInputModel: UserCreateInputModelType) {
    const userEmail = await this.usersQueryRepository.findUserByEmail(
      userInputModel.email,
    );
    if (userEmail)
      throw new BadRequestException([
        { message: 'user does exist', field: 'email' },
      ]);

    const userLogin = await this.usersQueryRepository.findUserByLogin(
      userInputModel.login,
    );
    if (userLogin)
      throw new BadRequestException([
        { message: 'user does exist', field: 'login' },
      ]);

    return await this.authService.createUser(userInputModel);
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  async confirmation(@Body() input: { code: string }) {
    const result = await this.usersService.confirmUser(input.code);
    if (!result)
      throw new BadRequestException([
        { message: 'confirm code error', field: 'code' },
      ]);
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  async emailResending(@Body() inputModel: EmailInputModelType) {
    const user = await this.usersQueryRepository.findUserByEmail(
      inputModel.email,
    );
    if (user && user.isConfirmed) {
      throw new BadRequestException([
        {
          message: 'user confirmed now',
          field: 'email',
        },
      ]);
    }

    if (!user) {
      throw new BadRequestException([
        {
          message: 'email does not exist',
          field: 'email',
        },
      ]);
    }

    await this.usersService.createNewConfirmationCode(
      user.id,
      inputModel.email,
    );
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async login(
    @Body() inputModel: LoginInputModelType,
    @Request() req,
    @Res({ passthrough: true }) res,
  ) {
    const user = await this.authService.checkCredential(
      inputModel.loginOrEmail,
      inputModel.password,
    );
    if (!user) throw new UnauthorizedException();
    const accessToken = await this.authService.createToken(user);
    const refreshToken = await this.authService.createRefreshToken(
      user,
      req.ip,
      req.headers['user-agent'],
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: accessToken };
  }

  @Post('password-recovery')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  async passwordRecovery(@Body() inputModel: EmailInputModelType) {
    const user = await this.usersQueryRepository.findUserByEmail(
      inputModel.email,
    );
    if (!user) return HttpCode(204);
    await this.authService.passwordRecovery(user.id, inputModel.email);
  }

  @Post('new-password')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  async newPassword(@Body() inputModel: NewPasswordInputModelType) {
    const result = await this.authService.newPassword(inputModel);
    if (!result)
      throw new BadRequestException([
        {
          message: 'confirm code error',
          field: 'recoveryCode',
        },
      ]);
  }

  @Post('refresh-token')
  @HttpCode(200)
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(@Request() req, @Res({ passthrough: true }) res) {
    const user = req.user;
    const oldRefreshToken = req.cookies.refreshToken;
    const accessToken = await this.authService.createToken(user);
    const refreshToken = await this.authService.refreshToken(
      user,
      oldRefreshToken,
    );
    if (!refreshToken) throw new UnauthorizedException();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: accessToken };
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtRefreshAuthGuard)
  async logout(@Request() req) {
    const user = req.user;
    const oldRefreshToken = req.cookies.refreshToken;
    const isLogout = await this.authService.logout(user.id, oldRefreshToken);
    if (!isLogout) throw new UnauthorizedException();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async aboutMe(@Request() req) {
    return {
      email: req.user.email,
      login: req.user.login,
      userId: req.user.id,
    };
  }
}
