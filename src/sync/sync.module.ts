import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncGateway } from './sync.gateway';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { Sale } from '../sales/sale.entity';
import { Product } from '../products/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Product])],
  controllers: [SyncController],
  providers: [SyncGateway, SyncService],
  exports: [SyncGateway, SyncService],
})
export class SyncModule {}
