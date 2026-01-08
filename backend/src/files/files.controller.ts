import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Req,
  Query,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { UploadOptionsDto } from './dto/upload-options.dto';
import { UpdateTagsDto } from './dto/update-tags.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateExpirationDto } from './dto/update-expiration.dto';
import type { Request } from 'express';
import { createReadStream } from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // US01: Authenticated upload
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAuth(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: UploadOptionsDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const savedFile = await this.filesService.upload(file, { ...options, user });
    return this.filesService.formatResponse(savedFile, req);
  }

  // US07: Anonymous upload (no guard)
  @Post('upload-anonymous')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAnonymous(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: UploadOptionsDto,
    @Req() req: Request,
  ) {
    const savedFile = await this.filesService.upload(file, options);
    return this.filesService.formatResponse(savedFile, req);
  }

  // US08: Retrieve all user tags
  // PLACEMENT: Before parameterized routes (:token) to avoid conflicts
  @Get('tags')
  @UseGuards(JwtAuthGuard)
  async getTags(@GetUser() user: User) {
    return this.filesService.getUserTags(user.id);
  }

  // US05: History with FILTERS (Search & Tag)
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @GetUser() user: User,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
  ) {
    return this.filesService.getUserHistory(user.id, search, tag);
  }

  // US02: Public Metadata
  @Get(':token/metadata')
  async getMetadata(@Param('token') token: string) {
    return this.filesService.getMetadata(token);
  }

  // US02/US09: Download
  @Post(':token/download')
  async download(
    @Param('token') token: string,
    @Body('password') password?: string,
  ): Promise<StreamableFile> {
    const fileRecord = await this.filesService.getFileByToken(token);
    await this.filesService.checkPassword(fileRecord, password);
    const fileStream = createReadStream(fileRecord.path);
    await this.filesService.incrementDownloadCount(fileRecord.id);
    
    return new StreamableFile(fileStream);
  }

  // US06: Deletion
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @GetUser() user: User) {
    return this.filesService.deleteFile(id, user.id);
  }

  // US08: Update tags
  @Patch(':id/tags')
  @UseGuards(JwtAuthGuard)
  async updateTags(
    @Param('id') id: string,
    @Body() dto: UpdateTagsDto,
    @GetUser() user: User,
  ) {
    return this.filesService.updateTags(id, dto.tags, user.id);
  }

  // US09: Update password post-upload
  @Patch(':id/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
    @GetUser() user: User,
  ) {
    return this.filesService.updatePassword(id, dto.password, user.id);
  }

  // US10: Update expiration post-upload
  @Patch(':id/expiration')
  @UseGuards(JwtAuthGuard)
  async updateExpiration(
    @Param('id') id: string,
    @Body() dto: UpdateExpirationDto,
    @GetUser() user: User,
  ) {
    return this.filesService.updateExpiration(id, dto.expirationDays, user.id);
  }
}