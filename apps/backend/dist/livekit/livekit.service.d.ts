import { ConfigService } from '@nestjs/config';
import { Room } from 'livekit-server-sdk';
export interface LiveKitTokenOptions {
    roomName: string;
    participantName: string;
    participantId: string;
}
export declare class LiveKitService {
    private configService;
    private roomService;
    private apiKey;
    private apiSecret;
    private livekitUrl;
    private readonly logger;
    constructor(configService: ConfigService);
    generateToken(options: LiveKitTokenOptions): Promise<string>;
    createRoom(roomName: string, emptyTimeout?: number): Promise<Room>;
    deleteRoom(roomName: string): Promise<void>;
    listRooms(): Promise<Room[]>;
    getRoomInfo(roomName: string): Promise<Room | null>;
    getLiveKitUrl(): string;
}
