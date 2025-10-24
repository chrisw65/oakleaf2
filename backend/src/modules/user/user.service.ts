import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './user.entity';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  tenantId?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  status?: UserStatus;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists for this tenant
    let existing;
    if (createUserDto.tenantId) {
      existing = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
          tenantId: createUserDto.tenantId,
        },
      });
    } else {
      existing = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });
    }

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: createUserDto.password,
      role: createUserDto.role || UserRole.USER,
    });

    // Hash password via BeforeInsert hook
    const savedUser = await this.userRepository.save(user);

    // Remove sensitive data
    savedUser.passwordHash = undefined;
    return savedUser;
  }

  async findAll(tenantId?: string): Promise<User[]> {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return this.userRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['tenant'],
    });
  }

  async findOne(id: string, tenantId?: string): Promise<User> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const user = await this.userRepository.findOne({
      where,
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string, tenantId?: string): Promise<User | null> {
    if (tenantId) {
      return this.userRepository.findOne({
        where: { email, tenantId },
        relations: ['tenant'],
      });
    }

    return this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });
  }

  async findByEmailWithPassword(email: string, tenantId?: string): Promise<User | null> {
    if (tenantId) {
      return this.userRepository.findOne({
        where: { email, tenantId },
        select: ['id', 'email', 'passwordHash', 'role', 'status', 'isActive', 'tenantId'],
      });
    }

    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'role', 'status', 'isActive', 'tenantId'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, tenantId?: string): Promise<User> {
    const user = await this.findOne(id, tenantId);

    // Check email uniqueness if being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      let existing;
      if (user.tenantId) {
        existing = await this.userRepository.findOne({
          where: {
            email: updateUserDto.email,
            tenantId: user.tenantId,
          },
        });
      } else {
        existing = await this.userRepository.findOne({
          where: {
            email: updateUserDto.email,
          },
        });
      }
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateLastLogin(userId: string, ip: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });
  }

  async setEmailVerified(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      emailVerified: true,
      status: UserStatus.ACTIVE,
      emailVerificationToken: undefined,
    });
  }

  async setPasswordResetToken(userId: string, token: string): Promise<void> {
    await this.userRepository.update(userId, {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour
    });
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findOne(userId);
    user.passwordHash = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await this.userRepository.save(user);
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    const user = await this.findOne(id, tenantId);
    await this.userRepository.softRemove(user);
  }
}
