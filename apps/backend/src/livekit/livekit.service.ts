import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient, Room } from 'livekit-server-sdk';

export interface LiveKitTokenOptions {
  roomName: string;
  participantName: string;
  participantId: string;
}

@Injectable()
export class LiveKitService {
  private roomService: RoomServiceClient;
  private apiKey: string;
  private apiSecret: string;
  private livekitUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';
    this.livekitUrl = this.configService.get<string>('LIVEKIT_URL') || '';

    this.roomService = new RoomServiceClient(
      this.livekitUrl,
      this.apiKey,
      this.apiSecret
    );
  }

  async generateToken(options: LiveKitTokenOptions): Promise<string> {
    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity: options.participantId,
      name: options.participantName,
      ttl: '1h' // Token valid for 1 hour
    });

    token.addGrant({
      roomJoin: true,
      room: options.roomName,
      canPublish: true,
      canSubscribe: true
    });

    return token.toJwt();
  }

  async createRoom(roomName: string, emptyTimeout: number = 300): Promise<Room> {
    try {
      const room = await this.roomService.createRoom({
        name: roomName,
        emptyTimeout: emptyTimeout, // 5 minutes
        maxParticipants: 2 // User + Agent
      });

      return room;
    } catch (error: any) {
      throw new BadRequestException(`Failed to create room: ${error.message}`);
    }
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.roomService.deleteRoom(roomName);
    } catch (error: any) {
      // Room might not exist, log but don't throw
      console.error(`Failed to delete room ${roomName}:`, error.message);
    }
  }

  async listRooms(): Promise<Room[]> {
    const rooms = await this.roomService.listRooms();
    return rooms;
  }

  async getRoomInfo(roomName: string): Promise<Room | null> {
    try {
      const rooms = await this.roomService.listRooms([roomName]);
      return rooms.length > 0 ? rooms[0] : null;
    } catch (error) {
      return null;
    }
  }

  getLiveKitUrl(): string {
    return this.livekitUrl;
  }
}