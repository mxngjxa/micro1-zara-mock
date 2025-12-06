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
exports.Answer = void 0;
const typeorm_1 = require("typeorm");
const question_entity_1 = require("./question.entity");
let Answer = class Answer {
    id;
    question_id;
    question;
    transcript;
    audio_url;
    evaluation_json;
    feedback;
    score;
    confidence_score;
    duration_seconds;
    created_at;
    updated_at;
};
exports.Answer = Answer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Answer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Answer.prototype, "question_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => question_entity_1.Question, (question) => question.answer, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'question_id' }),
    __metadata("design:type", question_entity_1.Question)
], Answer.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Answer.prototype, "transcript", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Answer.prototype, "audio_url", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Answer.prototype, "evaluation_json", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Answer.prototype, "feedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Answer.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Answer.prototype, "confidence_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Answer.prototype, "duration_seconds", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Answer.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Answer.prototype, "updated_at", void 0);
exports.Answer = Answer = __decorate([
    (0, typeorm_1.Entity)('answers'),
    (0, typeorm_1.Index)('IDX_answer_question', ['question_id']),
    (0, typeorm_1.Index)('IDX_answer_score', ['score'])
], Answer);
//# sourceMappingURL=answer.entity.js.map