import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

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

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    const modelName = this.configService.get<string>(
      'GEMINI_MODEL',
      'gemini-2.5-flash',
    );

    if (!apiKey) {
      this.logger.error('GOOGLE_API_KEY not found in configuration');
      throw new Error('GOOGLE_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: this.configService.get<number>('GEMINI_TEMPERATURE', 0.7),
        responseMimeType: 'application/json',
      },
    });
  }

  async generateQuestions(
    jobRole: string,
    difficulty: string,
    topics: string[],
    count: number,
  ): Promise<GeneratedQuestion[]> {
    const prompt = `
      You are an expert technical interviewer.
      Generate ${count} interview questions for a ${difficulty} level ${jobRole} position.
      Focus on these topics: ${topics.join(', ')}.
      
      Return ONLY a valid JSON array with this structure:
      [
        {
          "content": "Question text here",
          "expected_answer": "Brief summary of key points expected in the answer",
          "difficulty": "EASY" | "MEDIUM" | "HARD",
          "topic": "Specific topic from the list"
        }
      ]
      
      Each question should be clear, specific, and appropriate for the difficulty level.
    `;

    try {
      return await this.retryOperation(async () => {
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const questions = JSON.parse(text) as GeneratedQuestion[];

        // Basic validation
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('Invalid response format from Gemini');
        }

        return questions;
      });
    } catch (error) {
      this.logger.error('Failed to generate questions', error);
      throw error;
    }
  }

  async evaluateAnswer(
    questionContent: string,
    expectedAnswer: string,
    userTranscript: string,
  ): Promise<AnswerEvaluation> {
    const prompt = `
      You are an expert interviewer evaluating a candidate's answer.
      
      Question: ${questionContent}
      Expected Answer: ${expectedAnswer}
      Candidate's Answer: ${userTranscript}
      
      Evaluate on: correctness (0-100), completeness (0-100), clarity (0-100).
      
      Return ONLY valid JSON:
      {
        "score": number, // Overall score 0-100
        "correctness": number,
        "completeness": number,
        "clarity": number,
        "feedback": "Constructive feedback in 2-3 sentences"
      }
    `;

    try {
      return await this.retryOperation(async () => {
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const evaluation = JSON.parse(text) as AnswerEvaluation;

        // Calculate weighted score if not provided or to ensure consistency
        const weightedScore = Math.round(
          evaluation.correctness * 0.5 +
            evaluation.completeness * 0.3 +
            evaluation.clarity * 0.2,
        );

        return {
          ...evaluation,
          score: weightedScore,
        };
      });
    } catch (error) {
      this.logger.error('Failed to evaluate answer', error);
      throw error;
    }
  }

  async generateInterviewReport(
    jobRole: string,
    difficulty: string,
    answers: {
      question: string;
      answer: string;
      evaluation: AnswerEvaluation;
    }[],
  ): Promise<any> {
    const prompt = `
      You are an expert technical interviewer providing a final report for a candidate.
      
      Job Role: ${jobRole}
      Difficulty: ${difficulty}
      
      Candidate's Performance:
      ${answers
        .map(
          (a, i) => `
        Q${i + 1}: ${a.question}
        Answer: ${a.answer}
        Score: ${a.evaluation.score}/100
        Feedback: ${a.evaluation.feedback}
      `,
        )
        .join('\n')}
      
      Generate a comprehensive interview report in JSON format:
      {
        "summary": "Overall performance summary (2-3 sentences)",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
        "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"],
        "learning_resources": [
          { "title": "Resource Title", "url": "https://example.com/resource" }
        ]
      }
    `;

    try {
      return await this.retryOperation(async () => {
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        return JSON.parse(text);
      });
    } catch (error) {
      this.logger.error('Failed to generate interview report', error);
      // Return a fallback report if generation fails
      return {
        summary:
          'Interview completed. Detailed AI analysis unavailable at this moment.',
        strengths: [],
        weaknesses: [],
        recommendations: [],
        learning_resources: [],
      };
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.warn(`Attempt ${i + 1} failed: ${errorMessage}`);

        if (i < maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 1000),
          );
        }
      }
    }

    throw lastError;
  }
}
