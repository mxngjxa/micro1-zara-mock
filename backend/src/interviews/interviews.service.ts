import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Interview } from '../database/entities/interview.entity';
import { Question } from '../database/entities/question.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { GeminiService } from '../gemini/gemini.service';
import { LiveKitService } from '../livekit/livekit.service';
import { QuestionsService } from '../questions/questions.service';
import { User } from '../database/entities/user.entity';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private geminiService: GeminiService,
    private livekitService: LiveKitService,
    private questionsService: QuestionsService,
    private dataSource: DataSource,
  ) {}

  async createInterview(userId: string, createDto: CreateInterviewDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create interview entity
      const interview = this.interviewRepository.create({
        user_id: userId,
        job_role: createDto.job_role,
        difficulty: createDto.difficulty,
        topics: createDto.topics,
        total_questions: createDto.total_questions,
        status: 'PENDING',
        completed_questions: 0,
      });

      const savedInterview = await queryRunner.manager.save(
        Interview,
        interview,
      );

      // Generate questions using Gemini
      const generatedQuestions = await this.geminiService.generateQuestions(
        createDto.job_role,
        createDto.difficulty,
        createDto.topics,
        createDto.total_questions,
      );

      // Create Question entities
      const questionsToSave = generatedQuestions.map((q, index) => {
        return queryRunner.manager.create(Question, {
          interview_id: savedInterview.id,
          content: q.content,
          expected_answer: q.expected_answer,
          difficulty: q.difficulty,
          topic: q.topic,
          order: index,
        });
      });

      await queryRunner.manager.save(Question, questionsToSave);

      await queryRunner.commitTransaction();

      // Return interview with questions (excluding expected_answer for security/cleanliness)
      // We need to fetch it again to get the relation properly or construct it
      return {
        ...savedInterview,
        questions: questionsToSave.map(({ expected_answer, ...q }) => q),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create interview', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async startInterview(userId: string, interviewId: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId, user_id: userId },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Check if completed
    if (interview.status === 'COMPLETED') {
      throw new BadRequestException('Interview already completed');
    }

    const roomName = `interview-${interviewId}`;
    const participantName = `Candidate`; // Or fetch user name

    // Create LiveKit room if not exists (LiveKit handles idempotency or we can check)
    // The LiveKitService.createRoom method handles room creation.
    // For simplicity, we just generate the token which will create room on join if configured,
    // or we explicitly create it.

    // Explicitly create the room to ensure it exists and has correct settings
    try {
      await this.livekitService.createRoom(roomName);
    } catch (error) {
      // If room already exists, that's fine
      this.logger.log(
        `Room ${roomName} already exists or could not be created: ${error}`,
      );
    }

    // We'll generate a token. The Python agent will join this room.
    const token = await this.livekitService.generateToken({
      roomName,
      participantName,
      participantId: userId,
    });

    // Update interview status if it was pending
    if (interview.status === 'PENDING') {
      interview.status = 'IN_PROGRESS';
      interview.started_at = new Date();
      await this.interviewRepository.save(interview);
    }

    return {
      token,
      url: process.env.LIVEKIT_URL,
      room_name: roomName,
    };
  }

  async getInterviewForAgent(interviewId: string, roomName: string) {
    // Validate room name format to ensure it matches interview
    const expectedRoomName = `interview-${interviewId}`;
    if (roomName !== expectedRoomName) {
      throw new ForbiddenException('Invalid room name for this interview');
    }

    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: ['questions'],
      order: {
        questions: {
          order: 'ASC',
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return {
      interview_id: interview.id,
      job_role: interview.job_role,
      difficulty: interview.difficulty,
      questions: interview.questions.map((q) => ({
        id: q.id,
        content: q.content,
        difficulty: q.difficulty,
        topic: q.topic,
        order: q.order,
        expected_answer: q.expected_answer, // Agent needs this
      })),
      completed_questions: interview.completed_questions,
      status: interview.status,
    };
  }

  async completeInterview(userId: string, interviewId: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId, user_id: userId },
      relations: ['questions', 'questions.answer'],
    });

    if (!interview) {
      throw new NotFoundException('Interview not found or access denied');
    }

    // Calculate overall score
    let totalScore = 0;
    let answerCount = 0;
    const scores: number[] = [];
    const answerDetails: any[] = [];

    interview.questions.forEach((q) => {
      if (q.answer) {
        if (q.answer.score !== null) {
          totalScore += q.answer.score;
          answerCount++;
          scores.push(q.answer.score);

          answerDetails.push({
            question: q.content,
            answer: q.answer.transcript,
            evaluation: {
              score: q.answer.score,
              feedback: q.answer.feedback,
              ...(q.answer.evaluation_json || {}),
            },
          });
        }
      }
    });

    const overallScore =
      answerCount > 0 ? Math.round(totalScore / answerCount) : 0;

    // Calculate duration
    let durationMinutes = 0;
    if (interview.started_at) {
      const endTime = new Date();
      durationMinutes = Math.round(
        (endTime.getTime() - interview.started_at.getTime()) / 60000,
      );
    }

    // Analyze performance trend
    let performanceTrend = 'CONSISTENT';
    if (scores.length >= 2) {
      // Compare first half vs second half average
      const mid = Math.floor(scores.length / 2);
      const firstHalf = scores.slice(0, mid);
      const secondHalf = scores.slice(mid);

      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 10) performanceTrend = 'IMPROVING';
      else if (secondAvg < firstAvg - 10) performanceTrend = 'DECLINING';
    }

    // Generate comprehensive report
    // Only generate if we have answers
    let report = null;
    if (answerDetails.length > 0) {
      report = await this.geminiService.generateInterviewReport(
        interview.job_role,
        interview.difficulty,
        answerDetails,
      );
    }

    interview.status = 'COMPLETED';
    interview.completed_at = new Date();
    interview.overall_score = overallScore;
    interview.duration_minutes = durationMinutes;
    interview.performance_trend = performanceTrend;
    interview.report = report || {}; // Ensure not undefined if column exists

    await this.interviewRepository.save(interview);

    return interview;
  }

  async getUserInterviews(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const query = this.interviewRepository
      .createQueryBuilder('interview')
      .where('interview.user_id = :userId', { userId })
      .orderBy('interview.started_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      query.andWhere('interview.status = :status', { status });
    }

    const [interviews, total] = await query.getManyAndCount();

    return {
      data: interviews,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getInterviewById(userId: string, interviewId: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId, user_id: userId },
      relations: ['questions', 'questions.answer'],
      order: {
        questions: {
          order: 'ASC',
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }
}
