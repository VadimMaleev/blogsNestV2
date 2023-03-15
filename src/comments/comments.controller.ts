import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  NotFoundException,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repo';
import { JwtAuthGuard } from '../guards/jwt.auth.guard';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsService: CommentsService,
  ) {}

  @Get(':id')
  async getCommentById(@Param('id') id: string) {
    const comment = await this.commentsQueryRepository.getCommentById(id);
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteCommentById(@Param('id') id: string, @Request() req) {
    const comment = await this.commentsQueryRepository.getCommentById(id);
    if (!comment) throw new NotFoundException();
    if (comment.commentatorInfo.userId !== req.userId)
      throw new HttpException('Not your own', 403);

    const isDeleted = await this.commentsService.deleteCommentById(id);
    if (!isDeleted) throw new NotFoundException();
  }
}
