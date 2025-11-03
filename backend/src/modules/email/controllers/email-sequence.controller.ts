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
import { EmailSequenceService } from '../services/email-sequence.service';
import {
  CreateEmailSequenceDto,
  UpdateEmailSequenceDto,
  EmailSequenceQueryDto,
  EnrollContactsDto,
  AddSequenceStepDto,
  UpdateSequenceStepDto,
} from '../dto/email-sequence.dto';

@ApiTags('Email Sequences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('email/sequences')
export class EmailSequenceController {
  constructor(private readonly emailSequenceService: EmailSequenceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create email sequence' })
  async create(@Body() createDto: CreateEmailSequenceDto, @Req() req: any) {
    return this.emailSequenceService.create(
      createDto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all email sequences' })
  async findAll(@Query() queryDto: EmailSequenceQueryDto, @Req() req: any) {
    return this.emailSequenceService.findAll(queryDto, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email sequence by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.emailSequenceService.findOne(id, req.user.tenantId);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get sequence statistics' })
  async getStatistics(@Param('id') id: string, @Req() req: any) {
    return this.emailSequenceService.getStatistics(id, req.user.tenantId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update email sequence' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmailSequenceDto,
    @Req() req: any,
  ) {
    return this.emailSequenceService.update(id, updateDto, req.user.tenantId);
  }

  @Post(':id/enroll')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Enroll contacts in sequence' })
  async enrollContacts(
    @Param('id') id: string,
    @Body() enrollDto: EnrollContactsDto,
    @Req() req: any,
  ) {
    return this.emailSequenceService.enrollContacts(id, enrollDto, req.user.tenantId);
  }

  @Post(':id/steps')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Add step to sequence' })
  async addStep(
    @Param('id') id: string,
    @Body() stepDto: AddSequenceStepDto,
    @Req() req: any,
  ) {
    return this.emailSequenceService.addStep(id, stepDto, req.user.tenantId);
  }

  @Put(':id/steps/:stepId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update sequence step' })
  async updateStep(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() updateDto: UpdateSequenceStepDto,
    @Req() req: any,
  ) {
    return this.emailSequenceService.updateStep(id, stepId, updateDto, req.user.tenantId);
  }

  @Delete(':id/steps/:stepId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Delete sequence step' })
  async removeStep(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Req() req: any,
  ) {
    await this.emailSequenceService.removeStep(id, stepId, req.user.tenantId);
    return { message: 'Step deleted successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete email sequence' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.emailSequenceService.remove(id, req.user.tenantId);
    return { message: 'Sequence deleted successfully' };
  }
}
