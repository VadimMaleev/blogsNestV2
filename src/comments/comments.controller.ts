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
import { ExtractUserIdFromHeadersUseCase } from '../helpers/extract.userId.from.headers';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsService: CommentsService,
    protected extractUserIdFromHeadersUseCase: ExtractUserIdFromHeadersUseCase,
  ) {}

  @Get(':id')
  async getCommentById(@Param('id') id: string, @Request() req) {
    let userId: string | null = null;
    if (req.headers.authorization) {
      userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    }
    return this.commentsQueryRepository.getCommentById(id, userId);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteCommentById(@Param('id') id: string, @Request() req) {
    const comment = await this.commentsQueryRepository.findCommentById(id);
    if (!comment) throw new NotFoundException();
    if (comment.userId !== req.user.id)
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
    const comment = await this.commentsQueryRepository.findCommentById(id);
    if (!comment) throw new NotFoundException();
    if (comment.userId !== req.user.id)
      throw new HttpException('Not your own', 403);

    const isUpdated = await this.commentsService.updateComment(
      id,
      inputModel.content,
    );
    if (!isUpdated) throw new NotFoundException();
  }
}
