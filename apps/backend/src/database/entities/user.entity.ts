import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Interview } from './interview.entity';

@Entity('users')
@Index('IDX_user_email', ['email'])
@Index('IDX_user_created_at', ['created_at'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column({ unique: true })
  email!: string;
  
  @Column()
  password_hash!: string;
  
  @Column({ default: false })
  email_verified!: boolean;
  
  @Column({ nullable: true })
  verification_token!: string;
  
  @Column({ nullable: true })
  reset_token!: string;
  
  @Column({ type: 'timestamp', nullable: true })
  reset_token_expires!: Date;
  
  @CreateDateColumn()
  created_at!: Date;
  
  @UpdateDateColumn()
  updated_at!: Date;
  
  @Column({ type: 'timestamp', nullable: true })
  last_login!: Date;
  
  @OneToMany(() => Interview, interview => interview.user)
  interviews!: Interview[];
}