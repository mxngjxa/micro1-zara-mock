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
var InterviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const interview_entity_1 = require("../database/entities/interview.entity");
const question_entity_1 = require("../database/entities/question.entity");
const gemini_service_1 = require("../gemini/gemini.service");
const livekit_service_1 = require("../livekit/livekit.service");
const questions_service_1 = require("../questions/questions.service");
let InterviewsService = InterviewsService_1 = class InterviewsService {
    interviewRepository;
    geminiService;
    livekitService;
    questionsService;
    dataSource;
    logger = new common_1.Logger(InterviewsService_1.name);
    constructor(interviewRepository, geminiService, livekitService, questionsService, dataSource) {
        this.interviewRepository = interviewRepository;
        this.geminiService = geminiService;
        this.livekitService = livekitService;
        this.questionsService = questionsService;
        this.dataSource = dataSource;
    }
    async createInterview(userId, createDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const interview = this.interviewRepository.create({
                user_id: userId,
                job_role: createDto.job_role,
                difficulty: createDto.difficulty,
                topics: createDto.topics,
                total_questions: createDto.total_questions,
                status: 'PENDING',
                completed_questions: 0,
            });
            const savedInterview = await queryRunner.manager.save(interview_entity_1.Interview, interview);
            const generatedQuestions = await this.geminiService.generateQuestions(createDto.job_role, createDto.difficulty, createDto.topics, createDto.total_questions);
            const questionsToSave = generatedQuestions.map((q, index) => {
                return queryRunner.manager.create(question_entity_1.Question, {
                    interview_id: savedInterview.id,
                    content: q.content,
                    expected_answer: q.expected_answer,
                    difficulty: q.difficulty,
                    topic: q.topic,
                    order: index,
                });
            });
            await queryRunner.manager.save(question_entity_1.Question, questionsToSave);
            await queryRunner.commitTransaction();
            return {
                ...savedInterview,
                questions: questionsToSave.map(({ expected_answer, ...q }) => q),
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to create interview', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async startInterview(userId, interviewId) {
        const interview = await this.interviewRepository.findOne({
            where: { id: interviewId, user_id: userId },
        });
        if (!interview) {
            throw new common_1.NotFoundException('Interview not found');
        }
        if (interview.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Interview already completed');
        }
        const roomName = `interview-${interviewId}`;
        const participantName = `Candidate`;
        const token = await this.livekitService.generateToken({
            roomName,
            participantName,
            participantId: userId,
        });
        if (interview.status === 'PENDING') {
            interview.status = 'IN_PROGRESS';
            interview.started_at = new Date();
            await this.interviewRepository.save(interview);
        }
        return {
            token,
            url: process.env.LIVEKIT_URL,
            room_name: roomName,
        };
    }
    async getInterviewForAgent(interviewId, roomName) {
        const expectedRoomName = `interview-${interviewId}`;
        if (roomName !== expectedRoomName) {
            throw new common_1.ForbiddenException('Invalid room name for this interview');
        }
        const interview = await this.interviewRepository.findOne({
            where: { id: interviewId },
            relations: ['questions'],
            order: {
                questions: {
                    order: 'ASC',
                },
            },
        });
        if (!interview) {
            throw new common_1.NotFoundException('Interview not found');
        }
        return {
            interview_id: interview.id,
            job_role: interview.job_role,
            difficulty: interview.difficulty,
            questions: interview.questions.map((q) => ({
                id: q.id,
                content: q.content,
                difficulty: q.difficulty,
                topic: q.topic,
                order: q.order,
                expected_answer: q.expected_answer,
            })),
            completed_questions: interview.completed_questions,
            status: interview.status,
        };
    }
    async completeInterview(userId, interviewId) {
        const interview = await this.interviewRepository.findOne({
            where: { id: interviewId, user_id: userId },
            relations: ['questions', 'questions.answer'],
        });
        if (!interview) {
            throw new common_1.NotFoundException('Interview not found or access denied');
        }
        let totalScore = 0;
        let answerCount = 0;
        const scores = [];
        interview.questions.forEach((q) => {
            if (q.answer) {
                if (q.answer.score !== null) {
                    totalScore += q.answer.score;
                    answerCount++;
                    scores.push(q.answer.score);
                }
            }
        });
        const overallScore = answerCount > 0 ? Math.round(totalScore / answerCount) : 0;
        let durationMinutes = 0;
        if (interview.started_at) {
            const endTime = new Date();
            durationMinutes = Math.round((endTime.getTime() - interview.started_at.getTime()) / 60000);
        }
        let performanceTrend = 'CONSISTENT';
        if (scores.length >= 2) {
            const mid = Math.floor(scores.length / 2);
            const firstHalf = scores.slice(0, mid);
            const secondHalf = scores.slice(mid);
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            if (secondAvg > firstAvg + 10)
                performanceTrend = 'IMPROVING';
            else if (secondAvg < firstAvg - 10)
                performanceTrend = 'DECLINING';
        }
        interview.status = 'COMPLETED';
        interview.completed_at = new Date();
        interview.overall_score = overallScore;
        interview.duration_minutes = durationMinutes;
        interview.performance_trend = performanceTrend;
        await this.interviewRepository.save(interview);
        return interview;
    }
    async getUserInterviews(userId, status, page = 1, limit = 10) {
        const query = this.interviewRepository
            .createQueryBuilder('interview')
            .where('interview.user_id = :userId', { userId })
            .orderBy('interview.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        if (status) {
            query.andWhere('interview.status = :status', { status });
        }
        const [interviews, total] = await query.getManyAndCount();
        return {
            data: interviews,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getInterviewById(userId, interviewId) {
        const interview = await this.interviewRepository.findOne({
            where: { id: interviewId, user_id: userId },
            relations: ['questions', 'questions.answer'],
            order: {
                questions: {
                    order: 'ASC',
                },
            },
        });
        if (!interview) {
            throw new common_1.NotFoundException('Interview not found');
        }
        return interview;
    }
};
exports.InterviewsService = InterviewsService;
exports.InterviewsService = InterviewsService = InterviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(interview_entity_1.Interview)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        gemini_service_1.GeminiService,
        livekit_service_1.LiveKitService,
        questions_service_1.QuestionsService,
        typeorm_2.DataSource])
], InterviewsService);
//# sourceMappingURL=interviews.service.js.map