import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookService } from './book.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { AuthenticatedUser } from '../../shared/types/request.type';
import { UserRole } from '@prisma/client';
import {
  CreateBookDto,
  UpdateBookDto,
  PurchaseBookDto,
  AddReviewDto,
} from './dto/book.dto';
import { CursorPaginationDto } from '../../shared/types/pagination.type';

@ApiTags('Books')
@ApiBearerAuth()
@Controller({ path: 'books', version: '1' })
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @ApiOperation({ summary: 'List published books (public)' })
  list(@TenantId() tenantId: string, @Query() pagination: CursorPaginationDto) {
    return this.bookService.list(tenantId, pagination);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create book' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBookDto,
  ) {
    return this.bookService.create(tenantId, user.id, dto);
  }

  @Get('my-library')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Student's purchased books" })
  myLibrary(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookService.getMyLibrary(tenantId, user.id);
  }

  @Get('sales-report')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Revenue breakdown for book sales' })
  salesReport(@TenantId() tenantId: string) {
    return this.bookService.getSalesReport(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Book detail' })
  findById(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.bookService.findById(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update book (optimistic concurrency)' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return this.bookService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.bookService.delete(tenantId, id);
  }

  @Post(':id/publish')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  publish(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.bookService.publish(tenantId, id);
  }

  @Post(':id/unpublish')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  unpublish(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.bookService.unpublish(tenantId, id);
  }

  @Post(':id/upload-file')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get S3 presigned URL for PDF upload' })
  getUploadUrl(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.bookService.getUploadUrl(tenantId, id);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get paginated reviews' })
  getReviews(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.bookService.getReviews(tenantId, id, pagination);
  }

  @Post(':id/purchase')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Purchase book' })
  purchase(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PurchaseBookDto,
  ) {
    return this.bookService.purchase(tenantId, id, user.id, dto);
  }

  @Get(':id/download')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get signed download URL for purchased book' })
  download(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookService.getDownloadUrl(tenantId, id, user.id);
  }

  @Get(':id/orders')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Teacher: all orders for this book' })
  getOrders(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.bookService.getOrders(tenantId, id);
  }
}
