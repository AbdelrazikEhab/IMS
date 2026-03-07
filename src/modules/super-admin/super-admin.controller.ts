import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminService } from './super-admin.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../shared/types/request.type';
import {
  UpdateTenantStatusDto,
  UpdateTenantPlanDto,
  ToggleFeatureDto,
} from './dto/super-admin.dto';

@ApiTags('Super Admin')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@Controller({ path: 'super-admin', version: '1' })
export class SuperAdminController {
  constructor(private readonly adminService: SuperAdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform-wide stats' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('tenants')
  listTenants(@Query('status') status?: string, @Query('plan') plan?: string) {
    return this.adminService.listTenants({ status, plan });
  }

  @Get('tenants/:id')
  getTenant(@Param('id') id: string) {
    return this.adminService.getTenant(id);
  }

  @Patch('tenants/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTenantStatusDto) {
    return this.adminService.updateTenantStatus(id, dto);
  }

  @Patch('tenants/:id/plan')
  updatePlan(@Param('id') id: string, @Body() dto: UpdateTenantPlanDto) {
    return this.adminService.updateTenantPlan(id, dto);
  }

  @Post('tenants/:id/impersonate')
  impersonate(
    @Param('id') tenantId: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.impersonate(tenantId, admin.id);
  }

  @Get('tenants/:id/features')
  getFeatures(@Param('id') id: string) {
    return this.adminService.getTenant(id).then((t) => t.features);
  }

  @Patch('tenants/:id/features')
  toggleFeature(@Param('id') id: string, @Body() dto: ToggleFeatureDto) {
    return this.adminService.toggleFeature(id, dto);
  }

  @Get('users')
  listUsers(
    @Query('role') role?: UserRole,
    @Query('tenantId') tenantId?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers({ role, tenantId, search });
  }
}
