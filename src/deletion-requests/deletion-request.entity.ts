import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Sale } from '../sales/sale.entity';

export enum DeletionReason {
  WRONG_PRODUCT = 'Mauvais produit',
  WRONG_QUANTITY = 'Mauvaise quantité',
  WRONG_PRICE = 'Mauvais prix',
  WRONG_CUSTOMER = 'Mauvais client',
  DUPLICATE = 'Vente en double',
  PAYMENT_ISSUE = 'Problème de paiement',
  OTHER = 'Autre'
}

export enum DeletionRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('deletion_requests')
export class DeletionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, { nullable: true })
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @Column({ nullable: true })
  saleId: string;

  @Column({ nullable: true })
  saleTicketNo: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  sellerId: string;

  @Column()
  sellerName: string;

  @Column('simple-array')
  reasons: string[];

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: DeletionRequestStatus,
    default: DeletionRequestStatus.PENDING,
  })
  status: DeletionRequestStatus;

  @Column({ nullable: true })
  adminResponse: string;

  @Column({ nullable: true })
  adminResponseAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
