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
exports.LiveKitController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const livekit_service_1 = require("./livekit.service");
const create_room_dto_1 = require("./dto/create-room.dto");
const get_token_dto_1 = require("./dto/get-token.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let LiveKitController = class LiveKitController {
    livekitService;
    constructor(livekitService) {
        this.livekitService = livekitService;
    }
    async getToken(getTokenDto, user) {
        const token = await this.livekitService.generateToken({
            roomName: getTokenDto.roomName,
            participantName: user.email,
            participantId: user.id
        });
        return {
            success: true,
            data: {
                token,
                url: this.livekitService.getLiveKitUrl()
            }
        };
    }
    async createRoom(createRoomDto) {
        const room = await this.livekitService.createRoom(createRoomDto.roomName, createRoomDto.emptyTimeout);
        return {
            success: true,
            data: room
        };
    }
    async listRooms() {
        const rooms = await this.livekitService.listRooms();
        return {
            success: true,
            data: rooms
        };
    }
    async getRoomInfo(roomName) {
        const room = await this.livekitService.getRoomInfo(roomName);
        return {
            success: true,
            data: room
        };
    }
    async deleteRoom(roomName) {
        await this.livekitService.deleteRoom(roomName);
        return {
            success: true,
            message: `Room ${roomName} deleted`
        };
    }
};
exports.LiveKitController = LiveKitController;
__decorate([
    (0, common_1.Post)('token'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate LiveKit access token' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_token_dto_1.GetTokenDto, Object]),
    __metadata("design:returntype", Promise)
], LiveKitController.prototype, "getToken", null);
__decorate([
    (0, common_1.Post)('rooms'),
    (0, swagger_1.ApiOperation)({ summary: 'Create LiveKit room' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", Promise)
], LiveKitController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)('rooms'),
    (0, swagger_1.ApiOperation)({ summary: 'List all active rooms' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiveKitController.prototype, "listRooms", null);
__decorate([
    (0, common_1.Get)('rooms/:roomName'),
    (0, swagger_1.ApiOperation)({ summary: 'Get room information' }),
    __param(0, (0, common_1.Param)('roomName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LiveKitController.prototype, "getRoomInfo", null);
__decorate([
    (0, common_1.Delete)('rooms/:roomName'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete LiveKit room' }),
    __param(0, (0, common_1.Param)('roomName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LiveKitController.prototype, "deleteRoom", null);
exports.LiveKitController = LiveKitController = __decorate([
    (0, swagger_1.ApiTags)('LiveKit'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('livekit'),
    __metadata("design:paramtypes", [livekit_service_1.LiveKitService])
], LiveKitController);
//# sourceMappingURL=livekit.controller.js.map