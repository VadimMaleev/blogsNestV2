import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserCreateInputModelType } from '../types/input.models';
import { UsersService } from './users.service';
import { UsersQueryDto } from '../types/dto';
import { UsersQueryRepository } from './users.query.repo';
import { BasicAuthGuard } from '../guards/basic.auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getUsers(@Query() query: UsersQueryDto) {
    return this.usersQueryRepository.getUsers(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  async createUser(@Body() UserInputModel: UserCreateInputModelType) {
    return this.usersService.createUser(UserInputModel);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    const isDeleted = await this.usersService.deleteUser(id);
    if (!isDeleted) throw new NotFoundException('User not found');
    return isDeleted;
  }
}
