import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('app_info')
export class AppInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  logo_app: string;

  @Column()
  nom_app: string;

  @Column({ nullable: true })
  email_app: string;

  @Column({ nullable: true })
  adresse_app: string;

  @Column({ nullable: true })
  phone_app: string;

  @Column({ nullable: true })
  color_primary: string;

  @Column({ nullable: true })
  color_secondary: string;

  @Column({ nullable: true })
  color_tertiary: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
