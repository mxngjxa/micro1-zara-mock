import { Repository } from 'typeorm';
import { Question } from '../database/entities/question.entity';
import { Answer } from '../database/entities/answer.entity';
export declare class QuestionsService {
    private questionRepository;
    private answerRepository;
    constructor(questionRepository: Repository<Question>, answerRepository: Repository<Answer>);
    getNextQuestion(interviewId: string): Promise<Question | null>;
    getQuestionById(questionId: string): Promise<Question>;
    bulkCreateQuestions(interviewId: string, questionsData: Array<{
        content: string;
        expected_answer: string;
        difficulty: 'EASY' | 'MEDIUM' | 'HARD';
        topic: string;
        order: number;
    }>): Promise<Question[]>;
}
