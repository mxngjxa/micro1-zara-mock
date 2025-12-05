import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
export declare class InterviewsController {
    private readonly interviewsService;
    constructor(interviewsService: InterviewsService);
    createInterview(user: any, createDto: CreateInterviewDto): Promise<{
        success: boolean;
        data: {
            questions: {
                id: string;
                interview_id: string;
                interview: import("../database/entities/interview.entity").Interview;
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
            user: import("../database/entities/user.entity").User;
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
        };
    }>;
    startInterview(user: any, interviewId: string): Promise<{
        success: boolean;
        data: {
            token: string;
            url: string | undefined;
            room_name: string;
        };
    }>;
    getUserInterviews(user: any, status?: string, page?: number, limit?: number): Promise<{
        data: import("../database/entities/interview.entity").Interview[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
        success: boolean;
    }>;
    getInterview(user: any, interviewId: string): Promise<{
        success: boolean;
        data: import("../database/entities/interview.entity").Interview;
    }>;
    completeInterview(user: any, interviewId: string): Promise<{
        success: boolean;
        data: import("../database/entities/interview.entity").Interview;
    }>;
    getInterviewForAgent(interviewId: string, roomName: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
}
