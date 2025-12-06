import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../database/entities/question.entity';
import { Answer } from '../database/entities/answer.entity';
import { QuestionsService } from './questions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer])],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
