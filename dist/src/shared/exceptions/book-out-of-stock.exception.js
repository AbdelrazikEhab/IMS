import { HttpException, HttpStatus } from '@nestjs/common';
export class BookOutOfStockException extends HttpException {
    constructor(bookId) {
        super({
            error: 'BOOK_OUT_OF_STOCK',
            message: `Book '${bookId}' is out of stock`,
        }, HttpStatus.CONFLICT);
    }
}
//# sourceMappingURL=book-out-of-stock.exception.js.map