import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(email: string, password: string): Promise<User> {
    // Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password (10 rounds)
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = this.usersRepository.create({
      email,
      password_hash,
      email_verified: false, // Will implement verification later
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password_hash',
        'email_verified',
        'created_at',
        'updated_at',
        'last_login',
      ],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'email_verified',
        'created_at',
        'updated_at',
        'last_login',
      ],
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { last_login: new Date() });
  }
}
