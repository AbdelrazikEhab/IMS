import { NotFoundException } from '@nestjs/common';
export class TenantNotFoundException extends NotFoundException {
    constructor(identifier) {
        super({
            error: 'TENANT_NOT_FOUND',
            message: `Tenant '${identifier}' not found`,
        });
    }
}
//# sourceMappingURL=tenant-not-found.exception.js.map