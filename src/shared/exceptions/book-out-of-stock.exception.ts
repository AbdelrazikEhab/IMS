import { HttpException, HttpStatus } from '@nestjs/common';

export class BookOutOfStockException extends HttpException {
  constructor(bookId: string) {
    super(
      {
        error: 'BOOK_OUT_OF_STOCK',
        message: `Book '${bookId}' is out of stock`,
      },
      HttpStatus.CONFLICT,
    );
  }
}
