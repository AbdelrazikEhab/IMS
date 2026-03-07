import { NotFoundException } from '@nestjs/common';

export class TenantNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super({
      error: 'TENANT_NOT_FOUND',
      message: `Tenant '${identifier}' not found`,
    });
  }
}
