"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const interview_entity_1 = require("../database/entities/interview.entity");
const interviews_controller_1 = require("./interviews.controller");
const interviews_service_1 = require("./interviews.service");
const questions_module_1 = require("../questions/questions.module");
const gemini_module_1 = require("../gemini/gemini.module");
const livekit_module_1 = require("../livekit/livekit.module");
let InterviewsModule = class InterviewsModule {
};
exports.InterviewsModule = InterviewsModule;
exports.InterviewsModule = InterviewsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([interview_entity_1.Interview]),
            questions_module_1.QuestionsModule,
            gemini_module_1.GeminiModule,
            livekit_module_1.LiveKitModule,
        ],
        controllers: [interviews_controller_1.InterviewsController],
        providers: [interviews_service_1.InterviewsService],
        exports: [interviews_service_1.InterviewsService],
    })
], InterviewsModule);
//# sourceMappingURL=interviews.module.js.map