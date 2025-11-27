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

  @Column({ nullable: true })
  sous_titre_app: string;

  @Column({ type: 'int', nullable: true, default: 100 })
  logo_size: number;

  @Column({ nullable: true })
  color_nom_app: string;

  @Column({ nullable: true })
  color_sous_titre_app: string;

  @Column({ nullable: true, default: '#0d9488' })
  logo_bg_color: string;

  @Column({ nullable: true, default: 'HTG' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
