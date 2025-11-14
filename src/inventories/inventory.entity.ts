import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { InventoryItem } from './inventory-item.entity';

export enum InventoryStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  inventoryNumber: string;

  @Column({ type: 'enum', enum: InventoryStatus, default: InventoryStatus.IN_PROGRESS })
  status: InventoryStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', default: 0 })
  totalItems: number;

  @Column({ type: 'int', default: 0 })
  countedItems: number;

  @Column({ type: 'int', default: 0 })
  itemsWithDiscrepancy: number;

  @Column({ type: 'int', default: 0 })
  totalDiscrepancy: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => InventoryItem, (item) => item.inventory, { cascade: true })
  items: InventoryItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
