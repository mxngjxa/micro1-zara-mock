import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../database/entities/answer.entity';
import { Question } from '../database/entities/question.entity';
import { Interview } from '../database/entities/interview.entity';
import { AnswersService } from './answers.service';
import { GeminiModule } from '../gemini/gemini.module';
import { AnswersController } from './answers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Answer, Question, Interview]),
    GeminiModule,
  ],
  controllers: [AnswersController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}
