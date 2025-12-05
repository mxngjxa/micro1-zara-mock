import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { Interview } from './interview.entity';
import { Answer } from './answer.entity';

@Entity('questions')
@Index('IDX_question_interview_order', ['interview_id', 'order'])
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column()
  interview_id!: string;
  
  @ManyToOne(() => Interview, interview => interview.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interview_id' })
  interview!: Interview;
  
  @Column('text')
  content!: string;
  
  @Column('text', { nullable: true })
  expected_answer!: string;
  
  @Column({ type: 'enum', enum: ['EASY', 'MEDIUM', 'HARD'] })
  difficulty!: string;
  
  @Column({ length: 100 })
  topic!: string;
  
  @Column('int')
  order!: number;
  
  @Column('jsonb', { nullable: true })
  evaluation_criteria!: object;
  
  @Column({ type: 'int', nullable: true })
  time_limit_seconds!: number;
  
  @Column('text', { nullable: true })
  gemini_prompt!: string;
  
  @CreateDateColumn()
  created_at!: Date;
  
  @OneToOne(() => Answer, answer => answer.question, { cascade: true })
  answer!: Answer;
}