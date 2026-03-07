import {
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { AIJobType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateQuizDto {
  @IsUUID()
  lessonId: string;

  @IsInt()
  @Min(1)
  @Max(50)
  questionCount: number = 5;

  @IsString()
  @IsOptional()
  difficulty?: string = 'intermediate';
}

export class AIChatDto {
  @IsString()
  message: string;

  @IsOptional()
  context?: {
    courseId?: string;
    lessonId?: string;
  };
}

export class GenerateContentDto {
  @IsUUID()
  lessonId: string;

  @IsEnum(AIJobType)
  type: AIJobType;
}
