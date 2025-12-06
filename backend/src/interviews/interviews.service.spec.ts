import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InterviewsService } from './interviews.service';
import { GeminiService } from '../gemini/gemini.service';
import { LiveKitService } from '../livekit/livekit.service';
import { QuestionsService } from '../questions/questions.service';
import { Interview } from '../database/entities/interview.entity';
import { Question } from '../database/entities/question.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockInterview = {
  id: 'i-1',
  user_id: 'u-1',
  status: 'PENDING',
  questions: [],
};

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    save: jest.fn(),
    create: jest.fn(),
  },
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

const mockGeminiService = {
  generateQuestions: jest.fn(),
  generateInterviewReport: jest.fn(),
};

const mockLiveKitService = {
  generateToken: jest.fn(),
  createRoom: jest.fn(),
};

const mockQuestionsService = {};

describe('InterviewsService', () => {
  let service: InterviewsService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        {
          provide: getRepositoryToken(Interview),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            })),
          },
        },
        {
          provide: GeminiService,
          useValue: mockGeminiService,
        },
        {
          provide: LiveKitService,
          useValue: mockLiveKitService,
        },
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
    repo = module.get(getRepositoryToken(Interview));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInterview', () => {
    it('should create interview successfully', async () => {
      repo.create.mockReturnValue(mockInterview);
      mockQueryRunner.manager.save.mockResolvedValue(mockInterview);
      mockQueryRunner.manager.create.mockReturnValue({});

      mockGeminiService.generateQuestions.mockResolvedValue([
        { content: 'Q', expected_answer: 'A', difficulty: 'EASY', topic: 'T' },
      ]);

      const result = await service.createInterview('u-1', {
        job_role: 'Dev',
        difficulty: 'JUNIOR',
        topics: ['React'],
        total_questions: 5,
      });

      expect(result).toBeDefined();
      expect(mockGeminiService.generateQuestions).toHaveBeenCalled();
    });
  });

  describe('startInterview', () => {
    it('should start interview and return token', async () => {
      repo.findOne.mockResolvedValue({ ...mockInterview, status: 'PENDING' });
      repo.save.mockResolvedValue({ ...mockInterview, status: 'IN_PROGRESS' });
      mockLiveKitService.generateToken.mockResolvedValue('token');

      const result = await service.startInterview('u-1', 'i-1');

      expect(result.token).toBe('token');
      expect(mockLiveKitService.createRoom).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if interview not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.startInterview('u-1', 'i-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if already completed', async () => {
      repo.findOne.mockResolvedValue({ ...mockInterview, status: 'COMPLETED' });
      await expect(service.startInterview('u-1', 'i-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('completeInterview', () => {
    it('should complete interview and generate report', async () => {
      const completedInterview = {
        ...mockInterview,
        started_at: new Date(),
        questions: [
          {
            content: 'Q1',
            answer: { score: 80, transcript: 'A1', feedback: 'Good' },
          },
        ],
      };

      repo.findOne.mockResolvedValue(completedInterview);
      repo.save.mockResolvedValue({});
      mockGeminiService.generateInterviewReport.mockResolvedValue({
        summary: 'Good job',
      });

      const result = await service.completeInterview('u-1', 'i-1');

      expect(result.status).toBe('COMPLETED');
      expect(result.overall_score).toBe(80);
      expect(mockGeminiService.generateInterviewReport).toHaveBeenCalled();
    });
  });
});
