import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, LessThan, MoreThan } from 'typeorm';
import { Task, TaskStatus, TaskPriority, TaskType } from '../task.entity';

export interface CreateTaskDto {
  title: string;
  description?: string;
  taskType?: TaskType;
  priority?: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  estimatedDuration?: number;
  contactId?: string;
  opportunityId?: string;
  assignedToId?: string;
  hasReminder?: boolean;
  reminderDate?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  taskType?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  assignedToId?: string;
  hasReminder?: boolean;
  reminderDate?: Date;
  metadata?: Record<string, any>;
  outcome?: string;
}

export interface TaskFilterDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  taskType?: TaskType;
  contactId?: string;
  opportunityId?: string;
  assignedToId?: string;
  createdById?: string;
  overdue?: boolean;
  dueToday?: boolean;
  dueThisWeek?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  /**
   * Create a new task
   */
  async create(
    createTaskDto: CreateTaskDto,
    createdById: string,
    tenantId: string,
  ): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdById,
      tenantId,
      status: TaskStatus.TODO,
    });

    return await this.taskRepository.save(task);
  }

  /**
   * Find tasks with filtering and pagination
   */
  async findAll(
    filters: TaskFilterDto,
    tenantId: string,
  ): Promise<{ data: Task[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const query = this.taskRepository
      .createQueryBuilder('task')
      .where('task.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.contact', 'contact')
      .leftJoinAndSelect('task.opportunity', 'opportunity');

    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      query.andWhere('task.priority = :priority', { priority: filters.priority });
    }

    if (filters.taskType) {
      query.andWhere('task.taskType = :taskType', { taskType: filters.taskType });
    }

    if (filters.contactId) {
      query.andWhere('task.contactId = :contactId', { contactId: filters.contactId });
    }

    if (filters.opportunityId) {
      query.andWhere('task.opportunityId = :opportunityId', {
        opportunityId: filters.opportunityId,
      });
    }

    if (filters.assignedToId) {
      query.andWhere('task.assignedToId = :assignedToId', {
        assignedToId: filters.assignedToId,
      });
    }

    if (filters.createdById) {
      query.andWhere('task.createdById = :createdById', {
        createdById: filters.createdById,
      });
    }

    if (filters.overdue) {
      query.andWhere('task.dueDate < :now', { now: new Date() });
      query.andWhere('task.status != :completed', { completed: TaskStatus.COMPLETED });
    }

    if (filters.dueToday) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      query.andWhere('task.dueDate BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    if (filters.dueThisWeek) {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      query.andWhere('task.dueDate BETWEEN :startWeek AND :endWeek', {
        startWeek: startOfWeek,
        endWeek: endOfWeek,
      });
    }

    query
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.dueDate', 'ASC', 'NULLS LAST')
      .skip(skip)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a single task by ID
   */
  async findOne(id: string, tenantId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, tenantId },
      relations: ['createdBy', 'assignedTo', 'contact', 'opportunity'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  /**
   * Update a task
   */
  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    tenantId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, tenantId);

    // If marking as completed, set completedAt
    if (updateTaskDto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      task.completedAt = new Date();
    }

    // If uncompleting a task, clear completedAt
    if (updateTaskDto.status !== TaskStatus.COMPLETED && task.status === TaskStatus.COMPLETED) {
      task.completedAt = null;
    }

    Object.assign(task, updateTaskDto);

    return await this.taskRepository.save(task);
  }

  /**
   * Delete a task
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const task = await this.findOne(id, tenantId);
    await this.taskRepository.remove(task);
  }

  /**
   * Mark task as complete
   */
  async markComplete(
    id: string,
    tenantId: string,
    outcome?: string,
  ): Promise<Task> {
    const task = await this.findOne(id, tenantId);

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    if (outcome) {
      task.outcome = outcome;
    }

    return await this.taskRepository.save(task);
  }

  /**
   * Assign task to user
   */
  async assign(
    id: string,
    assignedToId: string,
    tenantId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, tenantId);
    task.assignedToId = assignedToId;
    return await this.taskRepository.save(task);
  }

  /**
   * Update task priority
   */
  async updatePriority(
    id: string,
    priority: TaskPriority,
    tenantId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, tenantId);
    task.priority = priority;
    return await this.taskRepository.save(task);
  }

  /**
   * Update task due date
   */
  async updateDueDate(
    id: string,
    dueDate: Date,
    tenantId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, tenantId);
    task.dueDate = dueDate;
    return await this.taskRepository.save(task);
  }

  /**
   * Get task statistics for a user
   */
  async getUserTaskStats(
    userId: string,
    tenantId: string,
  ): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    dueToday: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const tasks = await this.taskRepository.find({
      where: { assignedToId: userId, tenantId },
    });

    const now = new Date();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const pending = tasks.filter((t) => t.status !== TaskStatus.COMPLETED).length;
    const overdue = tasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== TaskStatus.COMPLETED,
    ).length;
    const dueToday = tasks.filter(
      (t) => t.dueDate && t.dueDate >= startOfDay && t.dueDate <= endOfDay,
    ).length;

    const byPriority: Record<string, number> = {};
    const byType: Record<string, number> = {};

    tasks.forEach((task) => {
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      byType[task.taskType] = (byType[task.taskType] || 0) + 1;
    });

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      dueToday,
      byPriority,
      byType,
    };
  }

  /**
   * Get upcoming tasks for a user
   */
  async getUpcoming(
    userId: string,
    tenantId: string,
    days: number = 7,
  ): Promise<Task[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await this.taskRepository.find({
      where: {
        assignedToId: userId,
        tenantId,
        status: TaskStatus.TODO,
        dueDate: Between(new Date(), endDate),
      },
      relations: ['contact', 'opportunity'],
      order: {
        dueDate: 'ASC',
      },
    });
  }

  /**
   * Get overdue tasks for a user
   */
  async getOverdue(
    userId: string,
    tenantId: string,
  ): Promise<Task[]> {
    return await this.taskRepository.find({
      where: {
        assignedToId: userId,
        tenantId,
        status: TaskStatus.TODO,
        dueDate: LessThan(new Date()),
      },
      relations: ['contact', 'opportunity'],
      order: {
        dueDate: 'ASC',
        priority: 'DESC',
      },
    });
  }

  /**
   * Get tasks due today for a user
   */
  async getDueToday(
    userId: string,
    tenantId: string,
  ): Promise<Task[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await this.taskRepository.find({
      where: {
        assignedToId: userId,
        tenantId,
        dueDate: Between(startOfDay, endOfDay),
      },
      relations: ['contact', 'opportunity'],
      order: {
        priority: 'DESC',
        dueDate: 'ASC',
      },
    });
  }

  /**
   * Get tasks that need reminders sent
   */
  async getTasksNeedingReminders(): Promise<Task[]> {
    const now = new Date();

    return await this.taskRepository.find({
      where: {
        hasReminder: true,
        reminderSent: false,
        reminderDate: LessThan(now),
        status: TaskStatus.TODO,
      },
      relations: ['assignedTo', 'contact', 'opportunity'],
    });
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(id: string): Promise<void> {
    await this.taskRepository.update(id, { reminderSent: true });
  }
}
