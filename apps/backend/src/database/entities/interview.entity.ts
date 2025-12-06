import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Question } from './question.entity';

@Entity('interviews')
@Index('IDX_interview_user_status', ['user_id', 'status'])
@Index('IDX_interview_started_at', ['started_at'])
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  user_id!: string;

  @ManyToOne(() => User, (user) => user.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 100 })
  job_role!: string;

  @Column({ type: 'enum', enum: ['JUNIOR', 'MID', 'SENIOR'] })
  difficulty!: string;

  @Column('simple-array')
  topics!: string[];

  @Column({
    type: 'enum',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
    default: 'PENDING',
  })
  status!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overall_score!: number;

  @Column({ nullable: true })
  performance_trend!: string;

  @Column({ type: 'int', default: 0 })
  completed_questions!: number;

  @Column({ type: 'int' })
  total_questions!: number;

  @Column({ type: 'int', nullable: true })
  duration_minutes!: number;

  @CreateDateColumn()
  started_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at!: Date;

  @OneToMany(() => Question, (question) => question.interview, {
    cascade: true,
  })
  questions!: Question[];
}
