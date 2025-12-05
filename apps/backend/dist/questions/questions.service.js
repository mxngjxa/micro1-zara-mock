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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const question_entity_1 = require("../database/entities/question.entity");
const answer_entity_1 = require("../database/entities/answer.entity");
let QuestionsService = class QuestionsService {
    questionRepository;
    answerRepository;
    constructor(questionRepository, answerRepository) {
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
    }
    async getNextQuestion(interviewId) {
        const questions = await this.questionRepository.find({
            where: { interview_id: interviewId },
            order: { order: 'ASC' },
        });
        if (!questions.length) {
            return null;
        }
        const answers = await this.answerRepository.find({
            where: {
                question: { interview_id: interviewId },
            },
            relations: ['question'],
        });
        const answeredQuestionIds = new Set(answers.map((a) => a.question_id));
        const unansweredQuestions = questions.filter((q) => !answeredQuestionIds.has(q.id));
        if (unansweredQuestions.length === 0) {
            return null;
        }
        if (answers.length === 0) {
            return unansweredQuestions[0];
        }
        answers.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        const lastAnswer = answers[0];
        const lastScore = lastAnswer.score || 0;
        let preferredDifficulty;
        if (lastScore >= 80) {
            preferredDifficulty = 'HARD';
        }
        else if (lastScore >= 50) {
            preferredDifficulty = 'MEDIUM';
        }
        else {
            preferredDifficulty = 'EASY';
        }
        const nextQuestion = unansweredQuestions.find((q) => q.difficulty === preferredDifficulty);
        return nextQuestion || unansweredQuestions[0];
    }
    async getQuestionById(questionId) {
        const question = await this.questionRepository.findOne({
            where: { id: questionId },
        });
        if (!question) {
            throw new common_1.NotFoundException(`Question with ID ${questionId} not found`);
        }
        return question;
    }
    async bulkCreateQuestions(interviewId, questionsData) {
        const questions = questionsData.map((data) => {
            const question = this.questionRepository.create({
                interview_id: interviewId,
                content: data.content,
                expected_answer: data.expected_answer,
                difficulty: data.difficulty,
                topic: data.topic,
                order: data.order,
            });
            return question;
        });
        return await this.questionRepository.save(questions);
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(1, (0, typeorm_1.InjectRepository)(answer_entity_1.Answer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map