import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('files')
@Index('idx_token', ['token'], { unique: true })
@Index('idx_expiration', ['expirationDate']) // For the US10 cron job
@Index('idx_user', ['user']) // For quick history
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string; // Original name

  @Column({ type: 'varchar', length: 512 })
  path: string; // Absolute path on disk (e.g., /app/uploads/xxx)

  @Column({ type: 'bigint' })
  size: number; // In bytes

  @Column({ type: 'varchar', length: 100 })
  mimetype: string;

  @Column({ type: 'varchar', length: 36, unique: true })
  token: string; // UUID v4 for the public link

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null; // Hash bcrypt, null if no password

  @Column('simple-array', { nullable: true })
  tags: string[] | null; // ex: ['work', 'important']

  @CreateDateColumn({ type: 'timestamp' })
  uploadDate: Date;

  @Column({ type: 'timestamp' })
  expirationDate: Date;

  // Relationship: a file belongs to 0 or 1 user (null = anonymous US07)
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User | null;

  // Practical bonus: download counter
  @Column({ type: 'int', default: 0 })
  downloadCount: number;
}