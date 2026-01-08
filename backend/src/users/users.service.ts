import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const { password, ...result } = user;
    return result as User;
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    if (data.email) {
      const existing = await this.usersRepository.findOne({ where: { email: data.email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already taken');
      }
    }

    delete data.password;
    delete data.id;

    await this.usersRepository.update(userId, data);
    return this.getProfile(userId);
  }
}