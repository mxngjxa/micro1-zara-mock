import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';

const mockConfigService = {
  get: jest.fn((key, defaultValue) => {
    if (key === 'GOOGLE_API_KEY') return 'test-api-key';
    if (key === 'GEMINI_MODEL') return 'gemini-pro';
    return defaultValue;
  }),
};

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQuestions', () => {
    it('should generate questions correctly', async () => {
      const mockQuestions = [
        {
          content: 'What is React?',
          expected_answer: 'A library for building UIs',
          difficulty: 'EASY',
          topic: 'React',
        },
      ];

      // Mock the actual API call or the method wrapping it
      // Assuming retryOperation is accessible or we mock the whole service in integration
      jest
        .spyOn(service as any, 'retryOperation')
        .mockResolvedValue(mockQuestions);

      const result = await service.generateQuestions(
        'Frontend Dev',
        'JUNIOR',
        ['React'],
        1,
      );
      expect(result).toEqual(mockQuestions);
    });
  });

  describe('evaluateAnswer', () => {
    it('should evaluate answer correctly', async () => {
      const mockEvaluation = {
        score: 85,
        correctness: 90,
        completeness: 80,
        clarity: 85,
        feedback: 'Good answer',
      };

      jest
        .spyOn(service as any, 'retryOperation')
        .mockResolvedValue(mockEvaluation);

      const result = await service.evaluateAnswer('Q', 'Expected', 'Answer');
      expect(result).toEqual(mockEvaluation);
    });
  });
});
