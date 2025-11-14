import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivedSheetConfigService } from './received-sheet-config.service';
import { ReceivedSheetConfigController } from './received-sheet-config.controller';
import { ReceivedSheetConfig } from './entities/received-sheet-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReceivedSheetConfig])],
  controllers: [ReceivedSheetConfigController],
  providers: [ReceivedSheetConfigService],
  exports: [ReceivedSheetConfigService],
})
export class ReceivedSheetConfigModule {}
