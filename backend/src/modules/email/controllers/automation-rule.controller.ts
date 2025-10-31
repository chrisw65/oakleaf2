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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '../../user/user.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AutomationRuleService } from '../services/automation-rule.service';
import {
  CreateAutomationRuleDto,
  UpdateAutomationRuleDto,
  AutomationRuleQueryDto,
} from '../dto/automation-rule.dto';

@ApiTags('Automation Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('automation-rules')
export class AutomationRuleController {
  constructor(private readonly automationRuleService: AutomationRuleService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create automation rule' })
  async create(@Body() createDto: CreateAutomationRuleDto, @Req() req: any) {
    return this.automationRuleService.create(
      createDto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all automation rules' })
  async findAll(@Query() queryDto: AutomationRuleQueryDto, @Req() req: any) {
    return this.automationRuleService.findAll(queryDto, req.user.tenantId);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get automation rule statistics' })
  async getStatistics(@Req() req: any) {
    return this.automationRuleService.getStatistics(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get automation rule by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.automationRuleService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update automation rule' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAutomationRuleDto,
    @Req() req: any,
  ) {
    return this.automationRuleService.update(id, updateDto, req.user.tenantId);
  }

  @Post(':id/toggle')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Toggle automation rule status' })
  async toggleStatus(@Param('id') id: string, @Req() req: any) {
    return this.automationRuleService.toggleStatus(id, req.user.tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete automation rule' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.automationRuleService.remove(id, req.user.tenantId);
    return { message: 'Automation rule deleted successfully' };
  }
}
