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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Question = void 0;
const typeorm_1 = require("typeorm");
const interview_entity_1 = require("./interview.entity");
const answer_entity_1 = require("./answer.entity");
let Question = class Question {
    id;
    interview_id;
    interview;
    content;
    expected_answer;
    difficulty;
    topic;
    order;
    evaluation_criteria;
    time_limit_seconds;
    gemini_prompt;
    created_at;
    updated_at;
    answer;
};
exports.Question = Question;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Question.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Question.prototype, "interview_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => interview_entity_1.Interview, interview => interview.questions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'interview_id' }),
    __metadata("design:type", interview_entity_1.Interview)
], Question.prototype, "interview", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Question.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Question.prototype, "expected_answer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['EASY', 'MEDIUM', 'HARD'] }),
    __metadata("design:type", String)
], Question.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Question.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Question.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "evaluation_criteria", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Question.prototype, "time_limit_seconds", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Question.prototype, "gemini_prompt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Question.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Question.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => answer_entity_1.Answer, answer => answer.question, { cascade: true }),
    __metadata("design:type", answer_entity_1.Answer)
], Question.prototype, "answer", void 0);
exports.Question = Question = __decorate([
    (0, typeorm_1.Entity)('questions'),
    (0, typeorm_1.Index)('IDX_question_interview_order', ['interview_id', 'order'])
], Question);
//# sourceMappingURL=question.entity.js.map