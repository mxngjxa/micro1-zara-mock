import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Index } from 'typeorm';
import { Question } from './question.entity';

@Entity('answers')
@Index('IDX_answer_question', ['question_id'])
@Index('IDX_answer_score', ['score'])
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column()
  question_id!: string;
  
  @OneToOne(() => Question, question => question.answer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: Question;
  
  @Column('text')
  transcript!: string;
  
  @Column({ nullable: true })
  audio_url!: string;
  
  @Column('jsonb', { nullable: true })
  evaluation_json!: object;
  
  @Column('text', { nullable: true })
  feedback!: string;
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score!: number;
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_score!: number;
  
  @Column({ type: 'int', nullable: true })
  duration_seconds!: number;
  
  @CreateDateColumn()
  created_at!: Date;
  
  @UpdateDateColumn()
  updated_at!: Date;
}