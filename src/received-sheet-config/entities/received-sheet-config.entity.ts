import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('received_sheet_config')
export class ReceivedSheetConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Logo
  @Column({ type: 'boolean', default: true })
  showLogo: boolean;

  @Column({ type: 'text', nullable: true })
  logoUrl: string;

  // Company Information
  @Column({ type: 'varchar', length: 255, default: 'StockLite' })
  companyName: string;

  @Column({ type: 'text', nullable: true })
  companyAddress: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  companyPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyEmail: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxId: string;

  // Display Options
  @Column({ type: 'boolean', default: true })
  showProductDetails: boolean;

  @Column({ type: 'boolean', default: true })
  showPaymentMethod: boolean;

  @Column({ type: 'boolean', default: true })
  showTax: boolean;

  @Column({ type: 'text', nullable: true })
  footerMessage: string;

  @Column({ type: 'int', default: 12 })
  fontSize: number;

  @Column({ type: 'int', default: 80 })
  paperWidth: number;

  // Mobile POS Configuration
  @Column({ type: 'varchar', length: 255, nullable: true })
  mobilePosName: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  mobilePinCode: string;

  @Column({ type: 'boolean', default: false })
  mobileEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  mobileAllowOffline: boolean;

  @Column({ type: 'boolean', default: true })
  mobileAutoSync: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
