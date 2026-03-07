import { NotFoundException } from '@nestjs/common';
export declare class TenantNotFoundException extends NotFoundException {
    constructor(identifier: string);
}
