import { apiClient } from './api-client';
import type { 
  RegisterPayload, 
  LoginPayload, 
  AuthResponse, 
  User 
} from '@/types/auth.types';

export class AuthService {
  static async register(payload: RegisterPayload): Promise<{ user: User }> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data.data;
  }

  static async login(payload: LoginPayload): Promise<{ user: User }> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data.data;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  static async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return data.data;
  }
}