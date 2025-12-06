export interface Interview {
  id: string;
  user_id: string;
  job_role: string;
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR';
  topics: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  overall_score: number | null;
  performance_trend: string | null;
  completed_questions: number;
  total_questions: number;
  duration_minutes: number | null;
  started_at: string;
  completed_at: string | null;
  questions?: Question[];
  report?: any;
}

export interface Question {
  id: string;
  interview_id: string;
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  order: number;
  answer?: Answer;
}

export interface Answer {
  id: string;
  question_id: string;
  transcript: string;
  score: number | null;
  feedback: string | null;
  evaluation_json: {
    correctness: number;
    completeness: number;
    clarity: number;
  } | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface CreateInterviewPayload {
  job_role: string;
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR';
  topics: string[];
  total_questions: number;
}

export interface LiveKitCredentials {
  token: string;
  url: string;
  room_name: string;
}
