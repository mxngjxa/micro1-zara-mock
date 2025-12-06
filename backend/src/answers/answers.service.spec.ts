import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { GeminiService } from '../gemini/gemini.service';
import { Answer } from '../database/entities/answer.entity';
import { Question } from '../database/entities/question.entity';
import { Interview } from '../database/entities/interview.entity';

const mockQuestion = {
  id: 'q-1',
  content: 'Q',
  expected_answer: 'A',
  interview_id: 'i-1',
  interview: { id: 'i-1' },
};

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    increment: jest.fn(),
  },
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

const mockGeminiService = {
  evaluateAnswer: jest.fn(),
};

describe('AnswersService', () => {
  let service: AnswersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswersService,
        {
          provide: getRepositoryToken(Answer),
          useValue: {
            create: jest.fn().mockReturnValue({}),
          },
        },
        {
          provide: getRepositoryToken(Question),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Interview),
          useValue: {},
        },
        {
          provide: GeminiService,
          useValue: mockGeminiService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AnswersService>(AnswersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAnswer', () => {
    it('should create answer successfully', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockQuestion); // find Question
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null); // find existing Answer (null)

      const mockSavedAnswer = {
        id: 'a-1',
        question_id: 'q-1',
        transcript: 'My answer',
      };
      mockQueryRunner.manager.create.mockReturnValue(mockSavedAnswer);
      mockQueryRunner.manager.save.mockResolvedValue(mockSavedAnswer);

      mockGeminiService.evaluateAnswer.mockResolvedValue({
        score: 80,
        correctness: 80,
        completeness: 80,
        clarity: 80,
        feedback: 'Good',
      });

      const result = await service.createAnswer({
        question_id: 'q-1',
        transcript: 'My answer',
      });

      expect(result).toBeDefined();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockGeminiService.evaluateAnswer).toHaveBeenCalled();
    });

    it('should throw NotFoundException if question not found', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);

      await expect(
        service.createAnswer({ question_id: 'invalid', transcript: 'a' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw ConflictException if already answered', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockQuestion);
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({
        id: 'a-existing',
      });

      await expect(
        service.createAnswer({ question_id: 'q-1', transcript: 'a' }),
      ).rejects.toThrow(ConflictException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
