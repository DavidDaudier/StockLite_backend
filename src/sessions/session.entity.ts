import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  EXPIRED = 'expired',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', nullable: true })
  device: string;

  @Column({ type: 'varchar', nullable: true })
  browser: string;

  @Column({ type: 'varchar', nullable: true })
  os: string;

  // Geolocation data
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  location: string; // Formatted location string

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @CreateDateColumn()
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @UpdateDateColumn()
  lastActivity: Date;

  @Column({ type: 'integer', default: 0 })
  activityCount: number;
}
