import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  NotFoundException,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repo';
import { JwtAuthGuard } from '../guards/jwt.auth.guard';
import { CommentsService } from './comments.service';
import { CommentCreateInputModel } from '../types/input.models';

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
    if (comment.commentatorInfo.userId !== req.user.id)
      throw new HttpException('Not your own', 403);

    const isDeleted = await this.commentsService.deleteCommentById(id);
    if (!isDeleted) throw new NotFoundException();
  }

  @Put('id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Body() inputModel: CommentCreateInputModel,
    @Param('id') id: string,
    @Request() req,
  ) {
    const comment = await this.commentsQueryRepository.getCommentById(id);
    if (!comment) throw new NotFoundException();
    if (comment.commentatorInfo.userId !== req.user.id)
      throw new HttpException('Not your own', 403);

    const isUpdated = await this.commentsService.updateComment(
      id,
      inputModel.content,
    );
    if (!isUpdated) throw new NotFoundException();
  }
}
