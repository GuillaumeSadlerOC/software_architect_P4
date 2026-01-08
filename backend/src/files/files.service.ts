import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, ILike } from 'typeorm';
import { File } from '../entities/file.entity';
import { User } from '../entities/user.entity';
import { UploadOptionsDto } from './dto/upload-options.dto';
import { Request } from 'express';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';

const FORBIDDEN_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif', '.vbs', '.vbe',
  '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh', '.ps1', '.ps1xml', '.ps2',
  '.ps2xml', '.psc1', '.psc2', '.reg', '.inf', '.scf', '.lnk', '.dll', '.sys',
];

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,
  ) {}

  async upload(file: Express.Multer.File, options: UploadOptionsDto & { user?: User }) {
    // Security
    if (file.size > 1_000_000_000) throw new BadRequestException('File too large');
    const ext = extname(file.originalname).toLowerCase();
    if (FORBIDDEN_EXTENSIONS.includes(ext)) throw new BadRequestException('Forbidden file type');

    // Password hash
    const hashedPassword = options.password ? await bcrypt.hash(options.password, 10) : null;

    // Expiration
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + (options.expirationDays || 7));

    const newFile = this.fileRepo.create({
      filename: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      token: uuidv4(),
      password: hashedPassword,
      tags: options.tags || null,
      expirationDate: expiration,
      user: options.user || null,
    });

    return this.fileRepo.save(newFile);
  }

  async getFileByToken(token: string): Promise<File> {
    const file = await this.fileRepo.findOne({ where: { token } });
    if (!file) throw new NotFoundException('File not found');
    if (new Date() > file.expirationDate) throw new ForbiddenException('File expired');
    return file;
  }

  async getMetadata(token: string) {
    const file = await this.getFileByToken(token);
    return {
      name: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      expirationDate: file.expirationDate,
      hasPassword: !!file.password,
      isExpired: new Date() > file.expirationDate,
      tags: file.tags,
    };
  }

  async checkPassword(file: File, password?: string): Promise<void> {
    if (file.password && (!password || !(await bcrypt.compare(password, file.password)))) {
      throw new ForbiddenException('Invalid password');
    }
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.fileRepo.increment({ id }, 'downloadCount', 1);
  }

  // US05: History (Active files only)
  async getUserHistory(userId: string, search?: string, tag?: string): Promise<File[]> {
    const qb = this.fileRepo.createQueryBuilder('file')
      .where('file.userId = :userId', { userId })
      .andWhere('file.expirationDate > :now', { now: new Date() })
      .addSelect('file.tags'); 

    // Filter by name (case-insensitive)
    if (search) {
      qb.andWhere('file.filename ILIKE :search', { search: `%${search}%` });
    }

    // Filter by tag
    if (tag) {
      qb.andWhere('file.tags LIKE :tag', { tag: `%${tag}%` });
    }

    qb.orderBy('file.uploadDate', 'DESC');
    
    return qb.getMany();
  }

  // US08: Retrieving tags with a counter
  async getUserTags(userId: string) {
    const files = await this.fileRepo.find({
      where: { user: { id: userId } },
      select: ['tags'],
    });

    const tagCounts = new Map<string, number>();
    files.forEach((file) => {
      if (file.tags && Array.isArray(file.tags)) {
        file.tags.forEach((tag) => {
          const cleanTag = tag.trim();
          if (cleanTag) {
            tagCounts.set(cleanTag, (tagCounts.get(cleanTag) || 0) + 1);
          }
        });
      }
    });

    // Transformation into Frontend compatible format [{ label: 'Work', count: 3 }]
    return Array.from(tagCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.fileRepo.findOne({ where: { id, user: { id: userId } } });
    if (!file) throw new NotFoundException('File not found or not owner');
    
    try {
      await fs.unlink(file.path);
    } catch (e) {
      console.warn(`Could not delete file ${file.path}: ${e.message}`);
    }
    await this.fileRepo.remove(file);
  }

  async updateTags(id: string, tags: string[], userId: string) {
    const file = await this.getOwnedFile(id, userId);
    file.tags = tags;
    return this.fileRepo.save(file);
  }

  async updatePassword(id: string, password: string, userId: string) {
    const file = await this.getOwnedFile(id, userId);
    file.password = await bcrypt.hash(password, 10);
    return this.fileRepo.save(file);
  }

  async updateExpiration(id: string, days: number, userId: string) {
    const file = await this.getOwnedFile(id, userId);
    const newExp = new Date();
    newExp.setDate(newExp.getDate() + days);
    file.expirationDate = newExp;
    return this.fileRepo.save(file);
  }

  private async getOwnedFile(id: string, userId: string): Promise<File> {
    const file = await this.fileRepo.findOne({ where: { id, user: { id: userId } } });
    if (!file) throw new NotFoundException('File not found or not owner');
    return file;
  }

  formatResponse(file: File, req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return {
      id: file.id,
      token: file.token,
      filename: file.filename,
      size: file.size,
      expirationDate: file.expirationDate,
      hasPassword: !!file.password,
      url: `${baseUrl}/api/files/${file.token}/download`,
      tags: file.tags || [],
    };
  }
}