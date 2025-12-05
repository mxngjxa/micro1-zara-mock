import { ConfigService } from '@nestjs/config';
export interface GeneratedQuestion {
    content: string;
    expected_answer: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    topic: string;
}
export interface AnswerEvaluation {
    score: number;
    correctness: number;
    completeness: number;
    clarity: number;
    feedback: string;
}
export declare class GeminiService {
    private configService;
    private readonly logger;
    private genAI;
    private model;
    constructor(configService: ConfigService);
    generateQuestions(jobRole: string, difficulty: string, topics: string[], count: number): Promise<GeneratedQuestion[]>;
    evaluateAnswer(questionContent: string, expectedAnswer: string, userTranscript: string): Promise<AnswerEvaluation>;
    private retryOperation;
}
