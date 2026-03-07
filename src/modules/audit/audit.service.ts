import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuditAction, AuditEntity, UserRole } from '@prisma/client';
import {
  CursorPaginationDto,
  decodeCursor,
  encodeCursor,
} from '../../shared/types/pagination.type';

export interface AuditLogData {
  tenantId?: string;
  actorId?: string;
  actorRole?: UserRole;
  action: AuditAction;
  entityType: AuditEntity;
  entityId?: string;
  url?: string; // Original request URL for entity resolution
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  ipAddress: string;
  userAgent?: string;
  requestId?: string;
  impersonatedBy?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(data: AuditLogData) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return await (this.prisma.auditLog as any).create({
        data: {
          tenant_id: data.tenantId,
          actor_id: data.actorId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          actor_role: data.actorRole,
          action: data.action,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          entity_type: data.entityType,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          entity_id: data.entityId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          old_values: data.oldValues,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          new_values: data.newValues,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          metadata: data.metadata,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          request_id: data.requestId,
          impersonated_by: data.impersonatedBy,
        },
      });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const message = (error?.message as string) || String(error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const stack = error?.stack as string;
      this.logger.error(`Failed to write audit log: ${message}`, stack);
    }
  }

  async list(tenantId: string | null, pagination: CursorPaginationDto) {
    const limit = pagination.limit ?? 50;
    const where: any = {};
    if (tenantId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.tenant_id = tenantId;
    }

    if (pagination.cursor) {
      const { date, id } = decodeCursor(pagination.cursor);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.OR = [
        { created_at: { lt: new Date(date) } },
        { created_at: new Date(date), id: { lt: id } },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const logs = (await (this.prisma.auditLog as any).findMany({
      where,
      take: limit + 1,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      include: {
        actor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    })) as any[];

    const hasMore = logs.length > limit;
    const items = hasMore ? logs.slice(0, limit) : logs;
    const lastItem = items[items.length - 1];

    return {
      data: items,
      pagination: {
        nextCursor:
          hasMore && lastItem
            ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              encodeCursor(lastItem.created_at as Date, lastItem.id as string)
            : null,
        hasMore,
      },
    };
  }
}
