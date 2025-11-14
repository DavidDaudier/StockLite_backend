import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all sessions' })
  @ApiResponse({ status: 200, description: 'Return all sessions' })
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get('active')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiResponse({ status: 200, description: 'Return all active sessions' })
  findActiveSessions() {
    return this.sessionsService.findActiveSessions();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get sessions for a specific user' })
  @ApiResponse({ status: 200, description: 'Return user sessions' })
  findByUserId(@Param('userId') userId: string) {
    return this.sessionsService.findByUserId(userId);
  }

  @Get('date-range')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get sessions by date range' })
  @ApiResponse({ status: 200, description: 'Return sessions in date range' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.sessionsService.findByDateRange(new Date(startDate), new Date(endDate));
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End a session' })
  @ApiResponse({ status: 200, description: 'Session ended successfully' })
  endSession(@Param('id') id: string) {
    return this.sessionsService.endSession(id);
  }

  @Post('user/:userId/end')
  @ApiOperation({ summary: 'End all user sessions' })
  @ApiResponse({ status: 200, description: 'User sessions ended successfully' })
  endUserSessions(@Param('userId') userId: string) {
    return this.sessionsService.endUserSessions(userId);
  }

  @Get('check/:sessionId')
  @ApiOperation({ summary: 'Check if a session is still active' })
  @ApiResponse({ status: 200, description: 'Session is active', schema: { properties: { isActive: { type: 'boolean' } } } })
  async checkSession(@Param('sessionId') sessionId: string, @Request() req: any) {
    console.log(`🔍 [Sessions] Checking session ${sessionId} for user ${req.user?.username || 'unknown'}`);
    const session = await this.sessionsService.findOne(sessionId);
    const isActive = session && session.status === 'active';
    console.log(`📊 [Sessions] Session ${sessionId} status: ${session?.status || 'not found'}, isActive: ${isActive}`);
    return {
      isActive,
      session: session || null
    };
  }
}
