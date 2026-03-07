import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AuthenticatedUser } from '../../shared/types/request.type';
import { UserRole } from '@prisma/client';
import {
  UpdateBrandingDto,
  UpdateTenantSettingsDto,
  CreateEnrollmentCodeDto,
} from './dto/tenant.dto';

@ApiTags('Tenant')
@ApiBearerAuth()
@Controller({ path: 'tenant', version: '1' })
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant info (from subdomain)' })
  async getCurrent(@TenantId() tenantId: string) {
    return this.tenantService.getCurrent(tenantId);
  }

  @Patch('branding')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update platform branding' })
  async updateBranding(
    @TenantId() tenantId: string,
    @Body() dto: UpdateBrandingDto,
  ) {
    return this.tenantService.updateBranding(tenantId, dto);
  }

  @Get('stats')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get tenant statistics' })
  async getStats(@TenantId() tenantId: string) {
    return this.tenantService.getStats(tenantId);
  }

  @Patch('settings')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update tenant settings' })
  async updateSettings(
    @TenantId() tenantId: string,
    @Body() dto: UpdateTenantSettingsDto,
  ) {
    return this.tenantService.updateSettings(tenantId, dto);
  }

  @Get('enrollment-codes')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'List enrollment codes with usage stats' })
  async listCodes(@TenantId() tenantId: string) {
    return this.tenantService.listEnrollmentCodes(tenantId);
  }

  @Post('enrollment-codes')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Generate enrollment code' })
  async createCode(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEnrollmentCodeDto,
  ) {
    return this.tenantService.createEnrollmentCode(tenantId, user.id, dto);
  }

  @Delete('enrollment-codes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Deactivate enrollment code' })
  async deactivateCode(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.tenantService.deactivateEnrollmentCode(tenantId, id);
  }
}
