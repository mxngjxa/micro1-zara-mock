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
exports.InterviewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const interviews_service_1 = require("./interviews.service");
const create_interview_dto_1 = require("./dto/create-interview.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let InterviewsController = class InterviewsController {
    interviewsService;
    constructor(interviewsService) {
        this.interviewsService = interviewsService;
    }
    async createInterview(user, createDto) {
        const interview = await this.interviewsService.createInterview(user.id, createDto);
        return { success: true, data: interview };
    }
    async startInterview(user, interviewId) {
        const credentials = await this.interviewsService.startInterview(user.id, interviewId);
        return { success: true, data: credentials };
    }
    async getUserInterviews(user, status, page = 1, limit = 10) {
        const result = await this.interviewsService.getUserInterviews(user.id, status, Number(page), Number(limit));
        return { success: true, ...result };
    }
    async getInterview(user, interviewId) {
        const interview = await this.interviewsService.getInterviewById(user.id, interviewId);
        return { success: true, data: interview };
    }
    async completeInterview(user, interviewId) {
        const interview = await this.interviewsService.completeInterview(user.id, interviewId);
        return { success: true, data: interview };
    }
    async getInterviewForAgent(interviewId, roomName) {
        if (!roomName) {
            throw new common_1.BadRequestException('room_name is required');
        }
        const interview = await this.interviewsService.getInterviewForAgent(interviewId, roomName);
        return { success: true, data: interview };
    }
};
exports.InterviewsController = InterviewsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new interview with questions' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_interview_dto_1.CreateInterviewDto]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "createInterview", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start interview and get LiveKit credentials' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "startInterview", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user interviews with filters' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getUserInterviews", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get interview details with Q&A' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getInterview", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete interview and calculate final scores' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "completeInterview", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('agent/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get interview details for agent' }),
    (0, swagger_1.ApiQuery)({ name: 'room_name', required: true }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('room_name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getInterviewForAgent", null);
exports.InterviewsController = InterviewsController = __decorate([
    (0, swagger_1.ApiTags)('interviews'),
    (0, common_1.Controller)('interviews'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [interviews_service_1.InterviewsService])
], InterviewsController);
//# sourceMappingURL=interviews.controller.js.map