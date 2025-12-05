import { apiClient } from './api-client';
import type { LiveKitTokenResponse } from '@/types/livekit.types';

export class LiveKitService {
  static async getToken(roomName: string): Promise<{ token: string; url: string }> {
    const { data } = await apiClient.post<LiveKitTokenResponse>('/livekit/token', {
      roomName
    });
    
    return data.data;
  }

  static async createRoom(roomName: string, emptyTimeout?: number): Promise<any> {
    const { data } = await apiClient.post('/livekit/rooms', {
      roomName,
      emptyTimeout
    });
    
    return data.data;
  }

  static async deleteRoom(roomName: string): Promise<void> {
    await apiClient.delete(`/livekit/rooms/${roomName}`);
  }
}