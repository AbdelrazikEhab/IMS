import { BookType, PaymentGateway } from '@prisma/client';
export declare class CreateBookDto {
    title: string;
    slug: string;
    description?: string;
    coverUrl?: string;
    type?: BookType;
    priceCents: number;
    currency?: string;
    author?: string;
    pages?: number;
    language?: string;
    tags?: string[];
    stockQuantity?: number;
}
export declare class UpdateBookDto {
    title?: string;
    description?: string;
    priceCents?: number;
    isPublished?: boolean;
    version?: number;
}
export declare class PurchaseBookDto {
    gateway: PaymentGateway;
    quantity?: number;
    idempotencyKey: string;
}
export declare class AddReviewDto {
    rating: number;
    comment?: string;
}
