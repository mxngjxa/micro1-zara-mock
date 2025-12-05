import { apiClient } from './api-client';
import Cookies from 'js-cookie';
import type { 
  RegisterPayload, 
  LoginPayload, 
  AuthResponse, 
  User 
} from '@/types/auth.types';

export class AuthService {
  static async register(payload: RegisterPayload): Promise<{ user: User; tokens: any }> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    
    // Store tokens in cookies
    Cookies.set('access_token', data.data.tokens.access_token, { expires: 1 });
    Cookies.set('refresh_token', data.data.tokens.refresh_token, { expires: 7 });
    
    return data.data;
  }

  static async login(payload: LoginPayload): Promise<{ user: User; tokens: any }> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    
    // Store tokens in cookies
    Cookies.set('access_token', data.data.tokens.access_token, { expires: 1 });
    Cookies.set('refresh_token', data.data.tokens.refresh_token, { expires: 7 });
    
    return data.data;
  }

  static async logout(): Promise<void> {
    // Clear tokens from cookies
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  }

  static async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  }

  static isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  }

  static getAccessToken(): string | undefined {
    return Cookies.get('access_token');
  }
}