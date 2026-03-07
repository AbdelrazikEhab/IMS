import { createParamDecorator } from '@nestjs/common';
export const TenantId = createParamDecorator((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
});
//# sourceMappingURL=tenant-id.decorator.js.map