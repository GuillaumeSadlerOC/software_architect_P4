import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from '../entities/file.entity';
import { User } from '../entities/user.entity';
import { TasksService } from './tasks.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [

    TypeOrmModule.forFeature([File, User]),
    forwardRef(() => AuthModule),

    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 1024,
      },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, TasksService],
  exports: [FilesService],
})
export class FilesModule {}