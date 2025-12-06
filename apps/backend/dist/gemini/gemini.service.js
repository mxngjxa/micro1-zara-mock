"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let GeminiService = GeminiService_1 = class GeminiService {
    configService;
    logger = new common_1.Logger(GeminiService_1.name);
    genAI;
    model;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GOOGLE_API_KEY');
        const modelName = this.configService.get('GEMINI_MODEL', 'gemini-1.5-flash');
        if (!apiKey) {
            this.logger.error('GOOGLE_API_KEY not found in configuration');
            throw new Error('GOOGLE_API_KEY is required');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: this.configService.get('GEMINI_TEMPERATURE', 0.7),
                responseMimeType: 'application/json',
            },
        });
    }
    async generateQuestions(jobRole, difficulty, topics, count) {
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
                const questions = JSON.parse(text);
                if (!Array.isArray(questions) || questions.length === 0) {
                    throw new Error('Invalid response format from Gemini');
                }
                return questions;
            });
        }
        catch (error) {
            this.logger.error('Failed to generate questions', error);
            throw error;
        }
    }
    async evaluateAnswer(questionContent, expectedAnswer, userTranscript) {
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
                const evaluation = JSON.parse(text);
                const weightedScore = Math.round(evaluation.correctness * 0.5 +
                    evaluation.completeness * 0.3 +
                    evaluation.clarity * 0.2);
                return {
                    ...evaluation,
                    score: weightedScore,
                };
            });
        }
        catch (error) {
            this.logger.error('Failed to evaluate answer', error);
            throw error;
        }
    }
    async retryOperation(operation, maxRetries = 3) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.warn(`Attempt ${i + 1} failed: ${errorMessage}`);
                if (i < maxRetries - 1) {
                    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
                }
            }
        }
        throw lastError;
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map