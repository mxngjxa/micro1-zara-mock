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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnswersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const answer_entity_1 = require("../database/entities/answer.entity");
const question_entity_1 = require("../database/entities/question.entity");
const interview_entity_1 = require("../database/entities/interview.entity");
const gemini_service_1 = require("../gemini/gemini.service");
let AnswersService = AnswersService_1 = class AnswersService {
    answerRepository;
    questionRepository;
    interviewRepository;
    geminiService;
    dataSource;
    logger = new common_1.Logger(AnswersService_1.name);
    constructor(answerRepository, questionRepository, interviewRepository, geminiService, dataSource) {
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.interviewRepository = interviewRepository;
        this.geminiService = geminiService;
        this.dataSource = dataSource;
    }
    async createAnswer(createDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const question = await queryRunner.manager.findOne(question_entity_1.Question, {
                where: { id: createDto.question_id },
                relations: ['interview'],
            });
            if (!question) {
                throw new common_1.NotFoundException('Question not found');
            }
            const existingAnswer = await queryRunner.manager.findOne(answer_entity_1.Answer, {
                where: { question_id: createDto.question_id },
            });
            if (existingAnswer) {
                throw new common_1.ConflictException('Question already answered');
            }
            const answer = this.answerRepository.create({
                question_id: createDto.question_id,
                transcript: createDto.transcript,
                duration_seconds: createDto.duration_seconds || 0,
                score: null,
                feedback: null,
                evaluation_json: null,
                confidence_score: 0,
            });
            let savedAnswer = await queryRunner.manager.save(answer_entity_1.Answer, answer);
            try {
                const evaluation = await this.geminiService.evaluateAnswer(question.content, question.expected_answer, createDto.transcript);
                savedAnswer.score = evaluation.score;
                savedAnswer.feedback = evaluation.feedback;
                savedAnswer.evaluation_json = {
                    correctness: evaluation.correctness,
                    completeness: evaluation.completeness,
                    clarity: evaluation.clarity,
                };
                savedAnswer.confidence_score = evaluation.score >= 70 ? 0.8 : 0.6;
                savedAnswer = await queryRunner.manager.save(answer_entity_1.Answer, savedAnswer);
            }
            catch (evalError) {
                this.logger.error('Evaluation failed, saving answer without score', evalError);
            }
            await queryRunner.manager.increment(interview_entity_1.Interview, { id: question.interview_id }, 'completed_questions', 1);
            await queryRunner.commitTransaction();
            return savedAnswer;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to create answer', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAnswersByInterview(interviewId) {
        return this.answerRepository.find({
            where: {
                question: {
                    interview_id: interviewId,
                },
            },
            relations: ['question'],
            order: {
                created_at: 'ASC',
            },
        });
    }
    async getAnswerById(answerId) {
        const answer = await this.answerRepository.findOne({
            where: { id: answerId },
            relations: ['question'],
        });
        if (!answer) {
            throw new common_1.NotFoundException('Answer not found');
        }
        return answer;
    }
};
exports.AnswersService = AnswersService;
exports.AnswersService = AnswersService = AnswersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(answer_entity_1.Answer)),
    __param(1, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(2, (0, typeorm_1.InjectRepository)(interview_entity_1.Interview)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        gemini_service_1.GeminiService,
        typeorm_2.DataSource])
], AnswersService);
//# sourceMappingURL=answers.service.js.map