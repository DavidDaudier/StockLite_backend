import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeletionRequestsService } from './deletion-requests.service';
import { DeletionRequestsController } from './deletion-requests.controller';
import { DeletionRequest } from './deletion-request.entity';
import { Sale } from '../sales/sale.entity';
import { SaleItem } from '../sales/sale-item.entity';
import { ProductsModule } from '../products/products.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeletionRequest, Sale, SaleItem]),
    ProductsModule,
    SyncModule,
  ],
  controllers: [DeletionRequestsController],
  providers: [DeletionRequestsService],
  exports: [DeletionRequestsService],
})
export class DeletionRequestsModule {}
