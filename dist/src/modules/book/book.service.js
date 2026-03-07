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
import { Injectable, NotFoundException, ConflictException, ForbiddenException, } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { encodeCursor, decodeCursor, } from '../../shared/types/pagination.type';
import { BookOutOfStockException } from '../../shared/exceptions/book-out-of-stock.exception';
import { v4 as uuidv4 } from 'uuid';
let BookService = class BookService {
    prisma;
    pdfQueue;
    eventEmitter;
    constructor(prisma, pdfQueue, eventEmitter) {
        this.prisma = prisma;
        this.pdfQueue = pdfQueue;
        this.eventEmitter = eventEmitter;
    }
    async list(tenantId, pagination) {
        const limit = pagination.limit ?? 20;
        const where = {
            tenant_id: tenantId,
            is_published: true,
        };
        if (pagination.cursor) {
            const { date, id } = decodeCursor(pagination.cursor);
            where['OR'] = [
                { created_at: { lt: new Date(date) } },
                { created_at: new Date(date), id: { lt: id } },
            ];
        }
        const books = await this.prisma.book.findMany({
            where,
            take: limit + 1,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            select: {
                id: true,
                title: true,
                slug: true,
                cover_url: true,
                price_cents: true,
                currency: true,
                type: true,
                author: true,
                language: true,
                tags: true,
                created_at: true,
                _count: { select: { orders: true, reviews: true } },
            },
        });
        const hasMore = books.length > limit;
        const items = hasMore ? books.slice(0, limit) : books;
        const lastItem = items[items.length - 1];
        return {
            data: items,
            pagination: {
                nextCursor: hasMore && lastItem
                    ? encodeCursor(lastItem.created_at, lastItem.id)
                    : null,
                hasMore,
            },
        };
    }
    async create(tenantId, teacherId, dto) {
        const existing = await this.prisma.book.findFirst({
            where: { tenant_id: tenantId, slug: dto.slug },
        });
        if (existing)
            throw new ConflictException('Book slug already exists');
        return this.prisma.book.create({
            data: {
                tenant_id: tenantId,
                teacher_id: teacherId,
                title: dto.title,
                slug: dto.slug,
                description: dto.description,
                cover_url: dto.coverUrl,
                type: dto.type ?? 'DIGITAL',
                price_cents: dto.priceCents,
                currency: dto.currency ?? 'EGP',
                author: dto.author,
                pages: dto.pages,
                language: dto.language ?? 'ar',
                tags: dto.tags ?? [],
                stock_quantity: dto.stockQuantity,
            },
        });
    }
    async findById(tenantId, bookId) {
        const book = await this.prisma.book.findFirst({
            where: { id: bookId, tenant_id: tenantId },
            include: {
                reviews: {
                    take: 10,
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!book)
            throw new NotFoundException('Book not found');
        const { file_url, ...safeBook } = book;
        return safeBook;
    }
    async update(tenantId, bookId, dto) {
        const book = await this.prisma.book.findFirst({
            where: { id: bookId, tenant_id: tenantId },
        });
        if (!book)
            throw new NotFoundException('Book not found');
        if (dto.version !== undefined && book.version !== dto.version) {
            throw new ConflictException('Book was modified. Please refresh and retry.');
        }
        return this.prisma.book.update({
            where: { id: bookId },
            data: {
                title: dto.title,
                description: dto.description,
                price_cents: dto.priceCents,
                is_published: dto.isPublished,
                version: { increment: 1 },
            },
        });
    }
    async delete(tenantId, bookId) {
        const book = await this.prisma.book.findFirst({
            where: { id: bookId, tenant_id: tenantId },
        });
        if (!book)
            throw new NotFoundException('Book not found');
        await this.prisma.book.update({
            where: { id: bookId },
            data: { deleted_at: new Date() },
        });
    }
    async publish(tenantId, bookId) {
        return this.prisma.book.update({
            where: { id: bookId },
            data: { is_published: true },
        });
    }
    async unpublish(tenantId, bookId) {
        return this.prisma.book.update({
            where: { id: bookId },
            data: { is_published: false },
        });
    }
    async getUploadUrl(tenantId, bookId) {
        return {
            uploadUrl: `https://s3.example.com/books/${bookId}/file?presigned=true`,
            expiresIn: 3600,
        };
    }
    async purchase(tenantId, bookId, studentId, dto) {
        const book = await this.prisma.book.findFirst({
            where: { id: bookId, tenant_id: tenantId, is_published: true },
        });
        if (!book)
            throw new NotFoundException('Book not found');
        if (book.type === 'PHYSICAL' || book.type === 'BOTH') {
            if (book.stock_quantity !== null && book.stock_quantity <= 0) {
                throw new BookOutOfStockException(bookId);
            }
        }
        const existing = await this.prisma.bookOrder.findFirst({
            where: { idempotency_key: dto.idempotencyKey },
        });
        if (existing) {
            return {
                orderId: existing.id,
                status: existing.status,
                message: 'Order already created (idempotent)',
            };
        }
        const quantity = dto.quantity ?? 1;
        const totalCents = book.price_cents * quantity;
        const result = await this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    tenant_id: tenantId,
                    student_id: studentId,
                    amount_cents: totalCents,
                    currency: book.currency,
                    gateway: dto.gateway,
                    status: 'PENDING',
                    idempotency_key: `payment_${dto.idempotencyKey}`,
                },
            });
            const order = await tx.bookOrder.create({
                data: {
                    tenant_id: tenantId,
                    student_id: studentId,
                    book_id: bookId,
                    payment_id: payment.id,
                    idempotency_key: dto.idempotencyKey,
                    status: 'PENDING',
                    quantity,
                    unit_price_cents: book.price_cents,
                    total_cents: totalCents,
                    currency: book.currency,
                },
            });
            return { payment, order };
        });
        return {
            orderId: result.order.id,
            paymentId: result.payment.id,
            totalCents,
            currency: book.currency,
            gateway: dto.gateway,
            checkoutUrl: `https://gateway.example.com/pay/${result.payment.id}`,
        };
    }
    async getMyLibrary(tenantId, studentId) {
        return this.prisma.bookOrder.findMany({
            where: {
                tenant_id: tenantId,
                student_id: studentId,
                status: { in: ['PAID', 'DELIVERED'] },
            },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        cover_url: true,
                        author: true,
                        type: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async getDownloadUrl(tenantId, bookId, studentId) {
        const order = await this.prisma.bookOrder.findFirst({
            where: {
                tenant_id: tenantId,
                book_id: bookId,
                student_id: studentId,
                status: { in: ['PAID', 'DELIVERED'] },
            },
        });
        if (!order)
            throw new ForbiddenException('No active order found for this book');
        if (order.download_count >= order.max_downloads) {
            throw new ForbiddenException('Maximum download limit reached');
        }
        const signedUrl = `https://s3.example.com/books/${bookId}/file?token=${uuidv4()}&expires=${Date.now() + 3600000}`;
        await this.pdfQueue.add('watermark', {
            orderId: order.id,
            studentId,
            bookId,
        });
        await this.prisma.bookOrder.update({
            where: { id: order.id },
            data: {
                download_count: { increment: 1 },
                download_url: signedUrl,
                download_expires_at: new Date(Date.now() + 3600000),
            },
        });
        return {
            downloadUrl: signedUrl,
            expiresAt: new Date(Date.now() + 3600000),
        };
    }
    async getOrders(tenantId, bookId) {
        return this.prisma.bookOrder.findMany({
            where: { tenant_id: tenantId, book_id: bookId },
            include: {
                student: {
                    select: { id: true, first_name: true, last_name: true, email: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async getSalesReport(tenantId) {
        const result = await this.prisma.bookOrder.groupBy({
            by: ['book_id', 'status'],
            where: { tenant_id: tenantId },
            _sum: { total_cents: true },
            _count: { id: true },
        });
        const total = await this.prisma.bookOrder.aggregate({
            where: { tenant_id: tenantId, status: 'PAID' },
            _sum: { total_cents: true },
        });
        return {
            byBook: result,
            totalRevenueCents: total._sum.total_cents ?? 0,
        };
    }
    async getReviews(tenantId, bookId, pagination) {
        const limit = pagination.limit ?? 20;
        return this.prisma.bookReview.findMany({
            where: { book_id: bookId },
            take: limit,
            orderBy: { created_at: 'desc' },
        });
    }
};
BookService = __decorate([
    Injectable(),
    __param(1, InjectQueue(QUEUE_NAMES.BOOK_PDF_WATERMARK)),
    __metadata("design:paramtypes", [PrismaService,
        Queue,
        EventEmitter2])
], BookService);
export { BookService };
//# sourceMappingURL=book.service.js.map