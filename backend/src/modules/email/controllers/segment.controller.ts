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
import { SegmentService } from '../services/segment.service';
import {
  CreateSegmentDto,
  UpdateSegmentDto,
  SegmentQueryDto,
  AddContactsToSegmentDto,
  RemoveContactsFromSegmentDto,
} from '../dto/segment.dto';

@ApiTags('Segments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('segments')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create segment' })
  async create(@Body() createDto: CreateSegmentDto, @Req() req: any) {
    return this.segmentService.create(
      createDto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all segments' })
  async findAll(@Query() queryDto: SegmentQueryDto, @Req() req: any) {
    return this.segmentService.findAll(queryDto, req.user.tenantId);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get segment statistics' })
  async getStatistics(@Req() req: any) {
    return this.segmentService.getStatistics(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get segment by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.segmentService.findOne(id, req.user.tenantId);
  }

  @Get(':id/contacts')
  @ApiOperation({ summary: 'Get contacts in segment' })
  async getContacts(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: any,
  ) {
    return this.segmentService.getContacts(id, req.user.tenantId, page, limit);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update segment' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSegmentDto,
    @Req() req: any,
  ) {
    return this.segmentService.update(id, updateDto, req.user.tenantId);
  }

  @Post(':id/contacts')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Add contacts to segment' })
  async addContacts(
    @Param('id') id: string,
    @Body() addDto: AddContactsToSegmentDto,
    @Req() req: any,
  ) {
    return this.segmentService.addContacts(id, addDto, req.user.tenantId);
  }

  @Delete(':id/contacts')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Remove contacts from segment' })
  async removeContacts(
    @Param('id') id: string,
    @Body() removeDto: RemoveContactsFromSegmentDto,
    @Req() req: any,
  ) {
    return this.segmentService.removeContacts(id, removeDto, req.user.tenantId);
  }

  @Post(':id/recalculate')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Recalculate segment contact count' })
  async recalculate(@Param('id') id: string, @Req() req: any) {
    await this.segmentService.updateContactCount(id, req.user.tenantId);
    return { message: 'Segment recalculated successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete segment' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.segmentService.remove(id, req.user.tenantId);
    return { message: 'Segment deleted successfully' };
  }
}
