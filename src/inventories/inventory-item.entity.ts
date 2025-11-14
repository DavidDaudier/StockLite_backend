import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Inventory } from './inventory.entity';
import { Product } from '../products/product.entity';

export enum InventoryItemStatus {
  PENDING = 'pending',
  COUNTED = 'counted',
  DISCREPANCY = 'discrepancy'
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Inventory, (inventory) => inventory.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @Column()
  inventoryId: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Column({ type: 'int' })
  theoreticalQuantity: number;

  @Column({ type: 'int', nullable: true })
  physicalQuantity: number;

  @Column({ type: 'int', default: 0 })
  difference: number;

  @Column({ type: 'enum', enum: InventoryItemStatus, default: InventoryItemStatus.PENDING })
  status: InventoryItemStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
