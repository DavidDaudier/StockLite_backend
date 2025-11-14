import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionsService } from './sessions.service';

@Injectable()
export class SessionsSchedulerService {
  private readonly logger = new Logger(SessionsSchedulerService.name);

  constructor(private readonly sessionsService: SessionsService) {}

  // Expire les sessions inactives toutes les minutes
  @Cron(CronExpression.EVERY_MINUTE)








  
  async expireInactiveSessions() {
    const inactiveMinutes = 3; // Session expire après 30 minutes d'inactivité, maintenant je met 3, pour 3 minutes de test

    console.log(`🔄 [Scheduler] Checking for inactive sessions (inactive > ${inactiveMinutes} min)...`);

    try {
      const expiredCount = await this.sessionsService.expireInactiveSessions(inactiveMinutes);
      if (expiredCount > 0) {
        console.log(`✅ [Scheduler] Expired ${expiredCount} inactive session(s)`);
      } else {
        console.log(`✅ [Scheduler] No inactive sessions to expire`);
      }
    } catch (error) {
      this.logger.error(`❌ [Scheduler] Error expiring sessions:`, error.message);
    }
  }
}
