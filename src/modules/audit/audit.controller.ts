import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CursorPaginationDto } from '../../shared/types/pagination.type';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller({ path: 'audit-logs', version: '1' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: "Teacher: view tenant's audit trail" })
  list(@TenantId() tenantId: string, @Query() pagination: CursorPaginationDto) {
    return this.auditService.list(tenantId, pagination);
  }
}
