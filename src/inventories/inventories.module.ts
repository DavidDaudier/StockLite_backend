import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoriesController } from './inventories.controller';
import { InventoriesService } from './inventories.service';
import { Inventory } from './inventory.entity';
import { InventoryItem } from './inventory-item.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, InventoryItem]),
    ProductsModule,
  ],
  controllers: [InventoriesController],
  providers: [InventoriesService],
  exports: [InventoriesService],
})
export class InventoriesModule {}
