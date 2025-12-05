import { Repository, DataSource } from 'typeorm';
import { Answer } from '../database/entities/answer.entity';
import { Question } from '../database/entities/question.entity';
import { Interview } from '../database/entities/interview.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { GeminiService } from '../gemini/gemini.service';
export declare class AnswersService {
    private answerRepository;
    private questionRepository;
    private interviewRepository;
    private geminiService;
    private dataSource;
    private readonly logger;
    constructor(answerRepository: Repository<Answer>, questionRepository: Repository<Question>, interviewRepository: Repository<Interview>, geminiService: GeminiService, dataSource: DataSource);
    createAnswer(createDto: CreateAnswerDto): Promise<any>;
    getAnswersByInterview(interviewId: string): Promise<Answer[]>;
    getAnswerById(answerId: string): Promise<Answer>;
}
