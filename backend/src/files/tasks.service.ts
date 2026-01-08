import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { File } from '../entities/file.entity';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(@InjectRepository(File) private fileRepo: Repository<File>) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiration() {
    const now = new Date();
    this.logger.log('Starting daily expiration task...');

    const expiredFiles = await this.fileRepo.find({
      where: { expirationDate: LessThan(now) },
    });

    if (expiredFiles.length === 0) {
      this.logger.log('No expired files found.');
      return;
    }

    this.logger.log(`Found ${expiredFiles.length} expired files.`);

    for (const file of expiredFiles) {
      try {
        if (file.path && existsSync(file.path)) {
          await fs.unlink(file.path);
          this.logger.log(`Physical file deleted: ${file.path}`);
        }

        await this.fileRepo.remove(file);
        this.logger.log(`Expired file deleted from DB: ${file.id} - ${file.filename}`);
      } catch (error) {
        this.logger.error(`Failed to process expired file ${file.id}:`, error);
      }
    }

    this.logger.log('Daily expiration task completed.');
  }
}