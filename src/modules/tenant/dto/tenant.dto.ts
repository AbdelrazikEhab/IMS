import {
  IsString,
  IsOptional,
  IsHexColor,
  IsInt,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBrandingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @ApiPropertyOptional({ example: '#2563EB' })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @ApiPropertyOptional({ enum: ['classic', 'modern', 'minimal'] })
  @IsOptional()
  @IsString()
  landingTemplate?: string;
}

export class UpdateTenantSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locale?: string;
}

export class CreateEnrollmentCodeDto {
  @ApiPropertyOptional({ description: 'Max number of uses (null = unlimited)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({ description: 'Expiry date (ISO8601)' })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
