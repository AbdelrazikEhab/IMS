import { HttpException } from '@nestjs/common';
export declare class BookOutOfStockException extends HttpException {
    constructor(bookId: string);
}
