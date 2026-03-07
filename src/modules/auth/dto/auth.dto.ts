import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterTeacherDto {
  @ApiProperty({ example: 'ahmed' })
  @IsString()
  @MinLength(3)
  @MaxLength(63)
  subdomain: string;

  @ApiProperty({ example: 'Ahmed El-Sayed Academy' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  platformName: string;

  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'El-Sayed' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiPropertyOptional({ example: '+201234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'EG' })
  @IsOptional()
  @IsString()
  countryCode?: string;
}

export class RegisterStudentDto {
  @ApiProperty({ example: 'ABC123XYZ' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  enrollmentCode: string;

  @ApiProperty({ example: 'student@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'Ali' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Hassan' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiPropertyOptional({ example: '+201234567890' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(1)
  password: string;

  @ApiPropertyOptional({
    description: 'Device fingerprint for session management',
  })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @ApiPropertyOptional({ example: 'iPhone 14' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
