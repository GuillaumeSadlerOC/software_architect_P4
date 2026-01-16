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
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiConsumes, 
  ApiBody, 
  ApiQuery 
} from '@nestjs/swagger';
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

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // US01: Authenticated upload
  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload a file (Logged-in user)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File and options',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        password: { type: 'string' },
        expirationDays: { type: 'integer', default: 7 },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
  })
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
  @ApiOperation({ summary: 'Upload a file (Public / Anonymous)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        password: { type: 'string' },
        expirationDays: { type: 'integer', default: 7 },
      },
    },
  })
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve all unique tags of the user' })
  async getTags(@GetUser() user: User) {
    return this.filesService.getUserTags(user.id);
  }

  // US05: History with FILTERS (Search & Tag)
  @Get('history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'File history with filters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by exact tag' })
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
  @ApiOperation({ summary: 'Retrieve public metadata via the Token' })
  async getMetadata(@Param('token') token: string) {
    return this.filesService.getMetadata(token);
  }

  // US02/US09: Download
  @Post(':token/download')
  @ApiOperation({ summary: 'Download the file (possibly with a password)' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { password: { type: 'string' } } 
    } 
  })
  @ApiResponse({ status: 200, description: 'Stream of the binary file' })
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a file permanently' })
  async delete(@Param('id') id: string, @GetUser() user: User) {
    return this.filesService.deleteFile(id, user.id);
  }

  // US08: Update tags
  @Patch(':id/tags')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update the tags' })
  async updateTags(
    @Param('id') id: string,
    @Body() dto: UpdateTagsDto,
    @GetUser() user: User,
  ) {
    return this.filesService.updateTags(id, dto.tags, user.id);
  }

  // US09: Update password post-upload
  @Patch(':id/password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set or change the password' })
  async updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
    @GetUser() user: User,
  ) {
    return this.filesService.updatePassword(id, dto.password, user.id);
  }

  // US10: Update expiration post-upload
  @Patch(':id/expiration')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change the expiry date' })
  async updateExpiration(
    @Param('id') id: string,
    @Body() dto: UpdateExpirationDto,
    @GetUser() user: User,
  ) {
    return this.filesService.updateExpiration(id, dto.expirationDays, user.id);
  }
}