import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsSchedulerService } from './sessions-scheduler.service';
import { Session } from './session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsSchedulerService],
  exports: [SessionsService],
})
export class SessionsModule {}
