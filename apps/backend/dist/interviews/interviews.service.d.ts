import { Repository, DataSource } from 'typeorm';
import { Interview } from '../database/entities/interview.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { GeminiService } from '../gemini/gemini.service';
import { LiveKitService } from '../livekit/livekit.service';
import { QuestionsService } from '../questions/questions.service';
import { User } from '../database/entities/user.entity';
export declare class InterviewsService {
    private interviewRepository;
    private geminiService;
    private livekitService;
    private questionsService;
    private dataSource;
    private readonly logger;
    constructor(interviewRepository: Repository<Interview>, geminiService: GeminiService, livekitService: LiveKitService, questionsService: QuestionsService, dataSource: DataSource);
    createInterview(userId: string, createDto: CreateInterviewDto): Promise<{
        questions: {
            id: string;
            interview_id: string;
            interview: Interview;
            content: string;
            difficulty: string;
            topic: string;
            order: number;
            evaluation_criteria: object;
            time_limit_seconds: number;
            gemini_prompt: string;
            created_at: Date;
            updated_at: Date;
            answer: import("../database/entities/answer.entity").Answer;
        }[];
        id: string;
        user_id: string;
        user: User;
        job_role: string;
        difficulty: string;
        topics: string[];
        status: string;
        overall_score: number;
        performance_trend: string;
        completed_questions: number;
        total_questions: number;
        duration_minutes: number;
        started_at: Date;
        completed_at: Date;
    }>;
    startInterview(userId: string, interviewId: string): Promise<{
        token: string;
        url: string | undefined;
        room_name: string;
    }>;
    getInterviewForAgent(interviewId: string, roomName: string): Promise<{
        interview_id: string;
        job_role: string;
        difficulty: string;
        questions: {
            id: string;
            content: string;
            difficulty: string;
            topic: string;
            order: number;
            expected_answer: string;
        }[];
        completed_questions: number;
        status: string;
    }>;
    completeInterview(userId: string, interviewId: string): Promise<Interview>;
    getUserInterviews(userId: string, status?: string, page?: number, limit?: number): Promise<{
        data: Interview[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getInterviewById(userId: string, interviewId: string): Promise<Interview>;
}
