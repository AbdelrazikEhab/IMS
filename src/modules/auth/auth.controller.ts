import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { AuthenticatedUser, AppRequest } from '../../shared/types/request.type';
import {
  RegisterTeacherDto,
  RegisterStudentDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register/teacher')
  @ApiOperation({
    summary: 'Register a new teacher and provision their platform',
  })
  @ApiResponse({ status: 201, description: 'Teacher registered' })
  @ApiResponse({ status: 409, description: 'Subdomain taken or email in use' })
  async registerTeacher(@Body() dto: RegisterTeacherDto) {
    return this.authService.registerTeacher(dto);
  }

  @Public()
  @Post('register/student')
  @ApiOperation({ summary: 'Register student with enrollment code' })
  async registerStudent(
    @Body() dto: RegisterStudentDto,
    @TenantId() tenantId: string,
  ) {
    return this.authService.registerStudent(dto, tenantId);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 900000 } }) // 10 per 15 min
  @ApiOperation({ summary: 'Login and get access + refresh tokens' })
  async login(
    @Body() dto: LoginDto,
    @TenantId() tenantId: string,
    @Req() req: AppRequest,
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    return this.authService.login(dto, tenantId, ip, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke refresh token' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RefreshTokenDto,
  ) {
    return this.authService.logout(user.id, dto.refreshToken);
  }

  @Get('devices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active devices' })
  async getDevices(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getDevices(user.id);
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke device session' })
  async revokeDevice(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') deviceId: string,
  ) {
    return this.authService.revokeDevice(user.id, deviceId);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
  @ApiOperation({ summary: 'Request password reset OTP' })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @TenantId() tenantId: string,
  ) {
    return this.authService.forgotPassword(dto, tenantId);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @TenantId() tenantId: string,
  ) {
    return this.authService.resetPassword(dto, tenantId);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (authenticated)' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile + tenant info' })
  async getMe(
    @CurrentUser() user: AuthenticatedUser,
    @TenantId() tenantId: string,
  ) {
    return this.authService.getMe(user.id, tenantId);
  }

  @Get('check-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check authentication status' })
  checkStatus(@CurrentUser() user: any) {
    return {
      isAuthenticated: true,
      user,
    };
  }
}
