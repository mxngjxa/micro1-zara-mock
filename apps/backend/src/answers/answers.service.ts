import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Answer } from '../database/entities/answer.entity';
import { Question } from '../database/entities/question.entity';
import { Interview } from '../database/entities/interview.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class AnswersService {
  private readonly logger = new Logger(AnswersService.name);

  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private geminiService: GeminiService,
    private dataSource: DataSource,
  ) {}

  async createAnswer(createDto: CreateAnswerDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find question by ID with interview relation
      const question = await queryRunner.manager.findOne(Question, {
        where: { id: createDto.question_id },
        relations: ['interview'],
      });

      if (!question) {
        throw new NotFoundException('Question not found');
      }

      // Check if answer already exists
      const existingAnswer = await queryRunner.manager.findOne(Answer, {
        where: { question_id: createDto.question_id },
      });

      if (existingAnswer) {
        throw new ConflictException('Question already answered');
      }

      // Create Answer entity
      const answer = this.answerRepository.create({
        question_id: createDto.question_id,
        transcript: createDto.transcript,
        duration_seconds: createDto.duration_seconds || 0,
        // Initial values before evaluation
        score: null,
        feedback: null,
        evaluation_json: null,
        confidence_score: 0,
      } as any);

      // Save answer initially
      // Cast to any to avoid type issues with incomplete entity or missing properties in DeepPartial
      let savedAnswer = (await queryRunner.manager.save(Answer, answer)) as any;

      try {
        // Trigger evaluation using Gemini
        const evaluation = await this.geminiService.evaluateAnswer(
          question.content,
          question.expected_answer,
          createDto.transcript,
        );

        // Update answer with evaluation
        savedAnswer.score = evaluation.score;
        savedAnswer.feedback = evaluation.feedback;
        savedAnswer.evaluation_json = {
          correctness: evaluation.correctness,
          completeness: evaluation.completeness,
          clarity: evaluation.clarity,
        };
        // Simple heuristic for confidence score based on overall score
        // A high score implies the AI was confident in the good quality,
        // a low score implies confident in poor quality.
        // This is a placeholder logic.
        savedAnswer.confidence_score = evaluation.score >= 70 ? 0.8 : 0.6;

        savedAnswer = await queryRunner.manager.save(Answer, savedAnswer);
      } catch (evalError) {
        this.logger.error(
          'Evaluation failed, saving answer without score',
          evalError,
        );
        // We continue without failing the request, user can retry evaluation later or background job picks it up
      }

      // Update interview progress
      await queryRunner.manager.increment(
        Interview,
        { id: question.interview_id },
        'completed_questions',
        1,
      );

      await queryRunner.commitTransaction();

      return savedAnswer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create answer', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAnswersByInterview(interviewId: string) {
    return this.answerRepository.find({
      where: {
        question: {
          interview_id: interviewId,
        },
      },
      relations: ['question'],
      order: {
        created_at: 'ASC',
      },
    });
  }

  async getAnswerById(answerId: string) {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
      relations: ['question'],
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    return answer;
  }
}
