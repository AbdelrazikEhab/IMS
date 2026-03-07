import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsEnum,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';

export class CreateCourseDto {
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
  thumbnailUrl?: string;

  @ApiPropertyOptional({ default: 0, description: 'Price in cents' })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @ApiPropertyOptional({ default: 'EGP' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;
}

export class UpdateCourseDto {
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
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ description: 'Optimistic concurrency version' })
  @IsOptional()
  @IsInt()
  version?: number;
}

export class CreateModuleDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class ReorderModulesDto {
  @ApiProperty({
    type: [String],
    description: 'Array of module IDs in new order',
  })
  order: string[];
}

export class CreateLessonDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentUrl?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  durationSeconds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}
