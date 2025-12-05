import { Interview } from './interview.entity';
import { Answer } from './answer.entity';
export declare class Question {
    id: string;
    interview_id: string;
    interview: Interview;
    content: string;
    expected_answer: string;
    difficulty: string;
    topic: string;
    order: number;
    evaluation_criteria: object;
    time_limit_seconds: number;
    gemini_prompt: string;
    created_at: Date;
    updated_at: Date;
    answer: Answer;
}
