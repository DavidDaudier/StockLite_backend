import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Session, SessionStatus } from './session.entity';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    // End any existing active sessions for this user
    await this.sessionRepository.update(
      { userId: createSessionDto.userId, status: SessionStatus.ACTIVE },
      { status: SessionStatus.ENDED, endTime: new Date() },
    );

    // Create new session
    const session = this.sessionRepository.create({
      ...createSessionDto,
      status: SessionStatus.ACTIVE,
      activityCount: 1,
    });

    return this.sessionRepository.save(session);
  }

  async findAll(): Promise<Session[]> {
    return this.sessionRepository.find({
      relations: ['user'],
      order: { startTime: 'DESC' },
    });
  }

  async findOne(sessionId: string): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });
  }

  async findActiveByUserId(userId: string): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { userId, status: SessionStatus.ACTIVE },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId },
      relations: ['user'],
      order: { startTime: 'DESC' },
    });
  }

  async findActiveSessions(): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { status: SessionStatus.ACTIVE },
      relations: ['user'],
      order: { lastActivity: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Session[]> {
    // Ajuster les dates pour couvrir toute la journée
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setHours(0, 0, 0, 0);

    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    console.log('🔍 [Sessions] Finding sessions between:', {
      startDate: adjustedStartDate.toISOString(),
      endDate: adjustedEndDate.toISOString(),
    });

    const sessions = await this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user')
      .where('session.startTime >= :startDate', { startDate: adjustedStartDate })
      .andWhere('session.startTime <= :endDate', { endDate: adjustedEndDate })
      .orderBy('session.startTime', 'DESC')
      .getMany();

    console.log(`✅ [Sessions] Found ${sessions.length} sessions`);

    return sessions;
  }

  async updateActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActivity: new Date(),
      activityCount: () => 'activityCount + 1',
    });
  }

  async endSession(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      status: SessionStatus.ENDED,
      endTime: new Date(),
    });
  }

  async endUserSessions(userId: string): Promise<void> {
    await this.sessionRepository.update(
      { userId, status: SessionStatus.ACTIVE },
      { status: SessionStatus.ENDED, endTime: new Date() },
    );
  }

  async expireInactiveSessions(inactiveMinutes: number = 30): Promise<number> {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() - inactiveMinutes);

    // Find sessions to expire
    const sessionsToExpire = await this.sessionRepository.find({
      where: {
        status: SessionStatus.ACTIVE,
        lastActivity: LessThan(expiryTime),
      },
      relations: ['user'],
    });

    if (sessionsToExpire.length > 0) {
      console.log(`⏱️ [Sessions] Expiring ${sessionsToExpire.length} inactive sessions:`);
      sessionsToExpire.forEach(session => {
        console.log(`  - User: ${session.user?.username || session.userId}, Last activity: ${session.lastActivity}`);
      });

      await this.sessionRepository.update(
        {
          status: SessionStatus.ACTIVE,
          lastActivity: LessThan(expiryTime),
        },
        {
          status: SessionStatus.EXPIRED,
          endTime: new Date(),
        },
      );
    }

    return sessionsToExpire.length;
  }

  parseUserAgent(userAgent: string): { device: string; browser: string; os: string } {
    let device = 'Desktop';
    let browser = 'Unknown';
    let os = 'Unknown';

    if (!userAgent) {
      return { device, browser, os };
    }

    // Detect device
    if (/mobile/i.test(userAgent)) {
      device = 'Mobile';
    } else if (/tablet/i.test(userAgent)) {
      device = 'Tablet';
    }

    // Detect browser
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/firefox/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/edg/i.test(userAgent)) {
      browser = 'Edge';
    } else if (/opera|opr/i.test(userAgent)) {
      browser = 'Opera';
    }

    // Detect OS
    if (/windows/i.test(userAgent)) {
      os = 'Windows';
      if (/windows nt 10/i.test(userAgent)) os = 'Windows 10/11';
      else if (/windows nt 6.3/i.test(userAgent)) os = 'Windows 8.1';
      else if (/windows nt 6.2/i.test(userAgent)) os = 'Windows 8';
    } else if (/android/i.test(userAgent)) {
      os = 'Android';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      os = 'iOS';
    } else if (/mac/i.test(userAgent)) {
      os = 'MacOS';
    } else if (/linux/i.test(userAgent)) {
      os = 'Linux';
    }

    return { device, browser, os };
  }
}
