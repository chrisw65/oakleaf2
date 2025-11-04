import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TaskService, CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../services/task.service';
import { Task, TaskPriority } from '../task.entity';

@ApiTags('Tasks')
@Controller('crm/tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.taskService.create(createTaskDto, user.id, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with filters' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('taskType') taskType?: string,
    @Query('contactId') contactId?: string,
    @Query('opportunityId') opportunityId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('createdById') createdById?: string,
    @Query('overdue') overdue?: boolean,
    @Query('dueToday') dueToday?: boolean,
    @Query('dueThisWeek') dueThisWeek?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() user?: any,
  ): Promise<{ data: Task[]; total: number; page: number; limit: number }> {
    const filters: TaskFilterDto = {
      status: status as any,
      priority: priority as any,
      taskType: taskType as any,
      contactId,
      opportunityId,
      assignedToId,
      createdById,
      overdue,
      dueToday,
      dueThisWeek,
      page: page ? parseInt(page.toString(), 10) : 1,
      limit: limit ? parseInt(limit.toString(), 10) : 50,
    };

    return this.taskService.findAll(filters, user.tenantId);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get tasks assigned to current user' })
  @ApiResponse({ status: 200, description: 'List of my tasks' })
  async getMyTasks(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() user?: any,
  ): Promise<{ data: Task[]; total: number; page: number; limit: number }> {
    const filters: TaskFilterDto = {
      assignedToId: user.id,
      status: status as any,
      page: page ? parseInt(page.toString(), 10) : 1,
      limit: limit ? parseInt(limit.toString(), 10) : 50,
    };

    return this.taskService.findAll(filters, user.tenantId);
  }

  @Get('my-stats')
  @ApiOperation({ summary: 'Get task statistics for current user' })
  @ApiResponse({ status: 200, description: 'Task statistics' })
  async getMyStats(@CurrentUser() user: any): Promise<any> {
    return this.taskService.getUserTaskStats(user.id, user.tenantId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming tasks for current user' })
  @ApiResponse({ status: 200, description: 'Upcoming tasks' })
  async getUpcoming(
    @Query('days') days?: number,
    @CurrentUser() user?: any,
  ): Promise<Task[]> {
    return this.taskService.getUpcoming(user.id, user.tenantId, days || 7);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue tasks for current user' })
  @ApiResponse({ status: 200, description: 'Overdue tasks' })
  async getOverdue(@CurrentUser() user: any): Promise<Task[]> {
    return this.taskService.getOverdue(user.id, user.tenantId);
  }

  @Get('due-today')
  @ApiOperation({ summary: 'Get tasks due today for current user' })
  @ApiResponse({ status: 200, description: 'Tasks due today' })
  async getDueToday(@CurrentUser() user: any): Promise<Task[]> {
    return this.taskService.getDueToday(user.id, user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.taskService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.taskService.update(id, updateTaskDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.taskService.remove(id, user.tenantId);
    return { message: 'Task deleted successfully' };
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark task as complete' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task marked as complete' })
  async markComplete(
    @Param('id') id: string,
    @Body('outcome') outcome?: string,
    @CurrentUser() user?: any,
  ): Promise<Task> {
    return this.taskService.markComplete(id, user.tenantId, outcome);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign task to user' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task assigned successfully' })
  async assign(
    @Param('id') id: string,
    @Body('assignedToId') assignedToId: string,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.taskService.assign(id, assignedToId, user.tenantId);
  }

  @Put(':id/priority')
  @ApiOperation({ summary: 'Update task priority' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Priority updated successfully' })
  async updatePriority(
    @Param('id') id: string,
    @Body('priority') priority: TaskPriority,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.taskService.updatePriority(id, priority, user.tenantId);
  }

  @Put(':id/due-date')
  @ApiOperation({ summary: 'Update task due date' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Due date updated successfully' })
  async updateDueDate(
    @Param('id') id: string,
    @Body('dueDate') dueDate: Date,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.taskService.updateDueDate(id, dueDate, user.tenantId);
  }
}
