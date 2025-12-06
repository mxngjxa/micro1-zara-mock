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
exports.Interview = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const question_entity_1 = require("./question.entity");
let Interview = class Interview {
    id;
    user_id;
    user;
    job_role;
    difficulty;
    topics;
    status;
    overall_score;
    performance_trend;
    completed_questions;
    total_questions;
    duration_minutes;
    started_at;
    completed_at;
    questions;
};
exports.Interview = Interview;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Interview.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Interview.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.interviews, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Interview.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Interview.prototype, "job_role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['JUNIOR', 'MID', 'SENIOR'] }),
    __metadata("design:type", String)
], Interview.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], Interview.prototype, "topics", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
        default: 'PENDING',
    }),
    __metadata("design:type", String)
], Interview.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Interview.prototype, "overall_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Interview.prototype, "performance_trend", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Interview.prototype, "completed_questions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Interview.prototype, "total_questions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Interview.prototype, "duration_minutes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Interview.prototype, "started_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Interview.prototype, "completed_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => question_entity_1.Question, (question) => question.interview, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Interview.prototype, "questions", void 0);
exports.Interview = Interview = __decorate([
    (0, typeorm_1.Entity)('interviews'),
    (0, typeorm_1.Index)('IDX_interview_user_status', ['user_id', 'status']),
    (0, typeorm_1.Index)('IDX_interview_started_at', ['started_at'])
], Interview);
//# sourceMappingURL=interview.entity.js.map