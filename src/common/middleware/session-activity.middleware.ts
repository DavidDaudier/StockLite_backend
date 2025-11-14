import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SessionsService } from '../../sessions/sessions.service';

@Injectable()
export class SessionActivityMiddleware implements NestMiddleware {
  constructor(private readonly sessionsService: SessionsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.headers['x-session-id'] as string;

    if (!sessionId) {
      return next();
    }

    // Vérifier si c'est une route API (utiliser originalUrl qui contient le préfixe)
    const url = req.originalUrl || req.url;
    const isApiRoute = url.startsWith('/api/');

    if (!isApiRoute) {
      // Ignorer les routes non-API
      return next();
    }

    // Ne pas mettre à jour lastActivity pour les vérifications de session
    const isSessionCheckRoute =
      url.includes('/sessions/check') ||
      url.includes('/sessions/active');

    if (isSessionCheckRoute) {
      console.log(`⏭️ [Session] Skipping activity update for monitoring route: ${req.method} ${url}`);
      return next();
    }

    // Mettre à jour lastActivity pour toutes les autres routes API
    try {
      await this.sessionsService.updateActivity(sessionId);
      console.log(`✅ [Session] Activity updated for session: ${sessionId} (${req.method} ${url})`);
    } catch (error) {
      console.error(`❌ [Session] Failed to update activity for session: ${sessionId}`, error.message);
    }

    next();
  }
}
