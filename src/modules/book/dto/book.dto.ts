import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookType, PaymentGateway } from '@prisma/client';

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional({ enum: BookType, default: BookType.DIGITAL })
  @IsOptional()
  @IsEnum(BookType)
  type?: BookType;

  @ApiProperty({ description: 'Price in cents' })
  @IsInt()
  @Min(0)
  priceCents: number;

  @ApiPropertyOptional({ default: 'EGP' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number;

  @ApiPropertyOptional({ default: 'ar' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;
}

export class UpdateBookDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  version?: number;
}

export class PurchaseBookDto {
  @ApiProperty({ enum: PaymentGateway })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ description: 'Idempotency key for safe retry' })
  @IsString()
  idempotencyKey: string;
}

export class AddReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
