import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.BOOK_PDF_WATERMARK })],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
