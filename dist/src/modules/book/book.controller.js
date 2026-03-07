var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookService } from './book.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateBookDto, UpdateBookDto, PurchaseBookDto, } from './dto/book.dto';
import { CursorPaginationDto } from '../../shared/types/pagination.type';
let BookController = class BookController {
    bookService;
    constructor(bookService) {
        this.bookService = bookService;
    }
    list(tenantId, pagination) {
        return this.bookService.list(tenantId, pagination);
    }
    create(tenantId, user, dto) {
        return this.bookService.create(tenantId, user.id, dto);
    }
    myLibrary(tenantId, user) {
        return this.bookService.getMyLibrary(tenantId, user.id);
    }
    salesReport(tenantId) {
        return this.bookService.getSalesReport(tenantId);
    }
    findById(tenantId, id) {
        return this.bookService.findById(tenantId, id);
    }
    update(tenantId, id, dto) {
        return this.bookService.update(tenantId, id, dto);
    }
    delete(tenantId, id) {
        return this.bookService.delete(tenantId, id);
    }
    publish(tenantId, id) {
        return this.bookService.publish(tenantId, id);
    }
    unpublish(tenantId, id) {
        return this.bookService.unpublish(tenantId, id);
    }
    getUploadUrl(tenantId, id) {
        return this.bookService.getUploadUrl(tenantId, id);
    }
    getReviews(tenantId, id, pagination) {
        return this.bookService.getReviews(tenantId, id, pagination);
    }
    purchase(tenantId, id, user, dto) {
        return this.bookService.purchase(tenantId, id, user.id, dto);
    }
    download(tenantId, id, user) {
        return this.bookService.getDownloadUrl(tenantId, id, user.id);
    }
    getOrders(tenantId, id) {
        return this.bookService.getOrders(tenantId, id);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List published books (public)' }),
    __param(0, TenantId()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CursorPaginationDto]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "list", null);
__decorate([
    Post(),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Create book' }),
    __param(0, TenantId()),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, CreateBookDto]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "create", null);
__decorate([
    Get('my-library'),
    Roles(UserRole.STUDENT),
    ApiOperation({ summary: "Student's purchased books" }),
    __param(0, TenantId()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "myLibrary", null);
__decorate([
    Get('sales-report'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Revenue breakdown for book sales' }),
    __param(0, TenantId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "salesReport", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Book detail' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "findById", null);
__decorate([
    Patch(':id'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Update book (optimistic concurrency)' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpdateBookDto]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "update", null);
__decorate([
    Delete(':id'),
    HttpCode(HttpStatus.NO_CONTENT),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "delete", null);
__decorate([
    Post(':id/publish'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "publish", null);
__decorate([
    Post(':id/unpublish'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "unpublish", null);
__decorate([
    Post(':id/upload-file'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Get S3 presigned URL for PDF upload' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "getUploadUrl", null);
__decorate([
    Get(':id/reviews'),
    ApiOperation({ summary: 'Get paginated reviews' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, CursorPaginationDto]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "getReviews", null);
__decorate([
    Post(':id/purchase'),
    Roles(UserRole.STUDENT),
    ApiOperation({ summary: 'Purchase book' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, CurrentUser()),
    __param(3, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, PurchaseBookDto]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "purchase", null);
__decorate([
    Get(':id/download'),
    Roles(UserRole.STUDENT),
    ApiOperation({ summary: 'Get signed download URL for purchased book' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "download", null);
__decorate([
    Get(':id/orders'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Teacher: all orders for this book' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "getOrders", null);
BookController = __decorate([
    ApiTags('Books'),
    ApiBearerAuth(),
    Controller({ path: 'books', version: '1' }),
    __metadata("design:paramtypes", [BookService])
], BookController);
export { BookController };
//# sourceMappingURL=book.controller.js.map