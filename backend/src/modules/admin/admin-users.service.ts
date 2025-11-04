import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/user.entity';
import { UpdateUserDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto/admin.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get all users (admin only)
   */
  async getAllUsers(tenantId?: string): Promise<User[]> {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return await this.userRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['tenant'],
    });
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user (admin only)
   */
  async updateUser(userId: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(userId);

    // Check if email is being changed and if it's already taken
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email is already in use');
      }
    }

    Object.assign(user, updateDto);
    return await this.userRepository.save(user);
  }

  /**
   * Promote user to admin
   */
  async promoteToAdmin(userId: string): Promise<User> {
    return await this.updateUserRole(userId, { role: UserRole.ADMIN });
  }

  /**
   * Demote admin to user
   */
  async demoteToUser(userId: string): Promise<User> {
    return await this.updateUserRole(userId, { role: UserRole.USER });
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, updateDto: UpdateUserRoleDto): Promise<User> {
    const user = await this.getUserById(userId);
    user.role = updateDto.role;
    return await this.userRepository.save(user);
  }

  /**
   * Activate/deactivate user
   */
  async updateUserStatus(userId: string, updateDto: UpdateUserStatusDto): Promise<User> {
    const user = await this.getUserById(userId);
    user.isActive = updateDto.isActive;
    return await this.userRepository.save(user);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    await this.userRepository.remove(user);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<User[]> {
    return await this.userRepository.find({
      where: { role },
      order: { createdAt: 'DESC' },
      relations: ['tenant'],
    });
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .where('user.email ILIKE :query', { query: `%${query}%` })
      .orWhere('user.firstName ILIKE :query', { query: `%${query}%` })
      .orWhere('user.lastName ILIKE :query', { query: `%${query}%` })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }
}
