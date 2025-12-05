import { LiveKitService } from './livekit.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { GetTokenDto } from './dto/get-token.dto';
export declare class LiveKitController {
    private livekitService;
    constructor(livekitService: LiveKitService);
    getToken(getTokenDto: GetTokenDto, user: any): Promise<{
        success: boolean;
        data: {
            token: string;
            url: string;
        };
    }>;
    createRoom(createRoomDto: CreateRoomDto): Promise<{
        success: boolean;
        data: import("livekit-server-sdk").Room;
    }>;
    listRooms(): Promise<{
        success: boolean;
        data: import("livekit-server-sdk").Room[];
    }>;
    getRoomInfo(roomName: string): Promise<{
        success: boolean;
        data: import("livekit-server-sdk").Room | null;
    }>;
    deleteRoom(roomName: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
