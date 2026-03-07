import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Cursor from previous page' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    total?: number;
  };
}

/**
 * Encode a cursor from a date + id pair (for stable cursor pagination).
 */
export function encodeCursor(date: Date, id: string): string {
  return Buffer.from(JSON.stringify({ date: date.toISOString(), id })).toString(
    'base64',
  );
}

/**
 * Decode a cursor back to date + id.
 */
export function decodeCursor(cursor: string): { date: string; id: string } {
  return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
}
