import { User } from './user.entity';
import { Question } from './question.entity';
export declare class Interview {
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
    questions: Question[];
}
