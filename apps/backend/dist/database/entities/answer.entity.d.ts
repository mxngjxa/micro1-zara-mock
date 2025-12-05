import { Question } from './question.entity';
export declare class Answer {
    id: string;
    question_id: string;
    question: Question;
    transcript: string;
    audio_url: string;
    evaluation_json: object;
    feedback: string;
    score: number;
    confidence_score: number;
    duration_seconds: number;
    created_at: Date;
    updated_at: Date;
}
