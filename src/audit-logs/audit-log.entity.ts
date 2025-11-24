import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string; // UUID from User entity

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  username: string;

  @Column()
  role: string; // seller | admin | superadmin

  @Column()
  action: string; // login, logout, add, update, delete, sale, export, etc.

  @Column()
  module: string; // Stock, Vente, Paramètres, Produits, etc.

  @Column({ nullable: true })
  subject: string; // Description of what was done

  @Column({ nullable: true })
  browser: string; // Browser used

  @Column({ type: 'json', nullable: true })
  details: any; // optional before/after data

  @Column({ nullable: true })
  ipAddress: string; // IP address of the user

  @CreateDateColumn()
  timestamp: Date;
}
