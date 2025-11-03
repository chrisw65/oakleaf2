import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../user/user.entity';
import { CustomFieldService } from '../services/custom-field.service';
import { CustomField } from '../contact.entity';
import { CreateCustomFieldDto, UpdateCustomFieldDto } from '../dto/custom-field.dto';

@ApiTags('Custom Fields')
@Controller('crm/custom-fields')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomFieldController {
  constructor(private readonly customFieldService: CustomFieldService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new custom field (Admin only)' })
  @ApiResponse({ status: 201, description: 'Custom field created successfully' })
  async create(
    @Body() createCustomFieldDto: CreateCustomFieldDto,
    @CurrentUser() user: any,
  ): Promise<CustomField> {
    return this.customFieldService.create(createCustomFieldDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all custom fields' })
  @ApiResponse({ status: 200, description: 'List of custom fields' })
  async findAll(@CurrentUser() user: any): Promise<CustomField[]> {
    return this.customFieldService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get custom field by ID' })
  @ApiParam({ name: 'id', description: 'Custom field ID' })
  @ApiResponse({ status: 200, description: 'Custom field details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<CustomField> {
    return this.customFieldService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update custom field (Admin only)' })
  @ApiParam({ name: 'id', description: 'Custom field ID' })
  @ApiResponse({ status: 200, description: 'Custom field updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomFieldDto: UpdateCustomFieldDto,
    @CurrentUser() user: any,
  ): Promise<CustomField> {
    return this.customFieldService.update(id, updateCustomFieldDto, user.tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete custom field (Admin only)' })
  @ApiParam({ name: 'id', description: 'Custom field ID' })
  @ApiResponse({ status: 200, description: 'Custom field deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.customFieldService.remove(id, user.tenantId);
    return { message: 'Custom field deleted successfully' };
  }
}
