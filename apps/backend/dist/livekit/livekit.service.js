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
exports.LiveKitService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const livekit_server_sdk_1 = require("livekit-server-sdk");
let LiveKitService = class LiveKitService {
    configService;
    roomService;
    apiKey;
    apiSecret;
    livekitUrl;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('LIVEKIT_API_KEY') || '';
        this.apiSecret = this.configService.get('LIVEKIT_API_SECRET') || '';
        this.livekitUrl = this.configService.get('LIVEKIT_URL') || '';
        this.roomService = new livekit_server_sdk_1.RoomServiceClient(this.livekitUrl, this.apiKey, this.apiSecret);
    }
    async generateToken(options) {
        const token = new livekit_server_sdk_1.AccessToken(this.apiKey, this.apiSecret, {
            identity: options.participantId,
            name: options.participantName,
            ttl: '1h'
        });
        token.addGrant({
            roomJoin: true,
            room: options.roomName,
            canPublish: true,
            canSubscribe: true
        });
        return token.toJwt();
    }
    async createRoom(roomName, emptyTimeout = 300) {
        try {
            const room = await this.roomService.createRoom({
                name: roomName,
                emptyTimeout: emptyTimeout,
                maxParticipants: 2
            });
            return room;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create room: ${error.message}`);
        }
    }
    async deleteRoom(roomName) {
        try {
            await this.roomService.deleteRoom(roomName);
        }
        catch (error) {
            console.error(`Failed to delete room ${roomName}:`, error.message);
        }
    }
    async listRooms() {
        const rooms = await this.roomService.listRooms();
        return rooms;
    }
    async getRoomInfo(roomName) {
        try {
            const rooms = await this.roomService.listRooms([roomName]);
            return rooms.length > 0 ? rooms[0] : null;
        }
        catch (error) {
            return null;
        }
    }
    getLiveKitUrl() {
        return this.livekitUrl;
    }
};
exports.LiveKitService = LiveKitService;
exports.LiveKitService = LiveKitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LiveKitService);
//# sourceMappingURL=livekit.service.js.map