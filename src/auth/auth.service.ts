import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { SessionsService } from '../sessions/sessions.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => SessionsService))
    private sessionsService: SessionsService,
    private auditLogsService: AuditLogsService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any, sessionData?: any) {
    console.log('🔐 [Auth] Login called for user:', user.username);
    console.log('📍 [Auth] Session data received:', sessionData);

    const payload = { username: user.username, sub: user.id, role: user.role, isSuperAdmin: user.isSuperAdmin || false };

    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Create session with geolocation data
    let sessionId: string | null = null;
    if (sessionData) {
      console.log('✅ [Auth] Creating session for user:', user.username);
      const { device, browser, os } = this.sessionsService.parseUserAgent(sessionData.userAgent);

      try {
        const session = await this.sessionsService.create({
          userId: user.id,
          ipAddress: sessionData.ipAddress,
          userAgent: sessionData.userAgent,
          device,
          browser,
          os,
          latitude: sessionData.latitude,
          longitude: sessionData.longitude,
          city: sessionData.city,
          country: sessionData.country,
          location: sessionData.location,
        });
        sessionId = session.id;
        console.log('✅ [Auth] Session created successfully:', session.id);
      } catch (error) {
        console.error('❌ [Auth] Error creating session:', error);
      }
    } else {
      console.warn('⚠️ [Auth] No session data provided, session not created');
    }

    // Log the login action
    try {
      await this.auditLogsService.create({
        userId: user.id,
        username: user.username,
        role: user.role,
        action: 'login',
        module: 'Auth',
        subject: 'Connexion au système',
        browser: sessionData?.userAgent || 'Unknown',
        ipAddress: sessionData?.ipAddress || 'Unknown',
        details: {
          sessionId,
          location: sessionData?.location || 'Unknown'
        }
      });
    } catch (error) {
      console.error('Error logging login action:', error);
    }

    return {
      access_token: this.jwtService.sign(payload),
      sessionId,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        permissions: user.permissions,
      },
    };
  }

  async register(
    username: string,
    email: string,
    password: string,
    fullName: string,
    role?: string,
    permissions?: any,
    isSuperAdmin?: boolean
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: role as any,
      permissions,
      isSuperAdmin: isSuperAdmin || false,
    });

    await this.userRepository.save(user);
    
    // Log the registration action
    try {
      await this.auditLogsService.create({
        userId: user.id,
        username: user.username,
        role: user.role,
        action: 'add',
        module: 'Utilisateurs',
        subject: `Création utilisateur ${username}`,
        browser: 'System',
        details: {
          email,
          fullName,
          role
        }
      });
    } catch (error) {
      console.error('Error logging registration action:', error);
    }
    
    const { password: _, ...result } = user;
    return result;
  }
}
