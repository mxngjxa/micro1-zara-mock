import { apiClient } from './api-client';
import { CreateInterviewPayload, Interview, LiveKitCredentials } from '../types/interview.types';

// Backend wraps responses in { success: boolean, data: T }
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const InterviewService = {
  async createInterview(payload: CreateInterviewPayload): Promise<Interview> {
    const response = await apiClient.post<ApiResponse<Interview>>('/interviews', payload);
    return response.data.data;
  },

  async startInterview(interviewId: string): Promise<LiveKitCredentials> {
    const response = await apiClient.post<ApiResponse<LiveKitCredentials>>(`/interviews/${interviewId}/start`);
    return response.data.data;
  },

  async getUserInterviews(params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Interview[]; total: number; page: number; limit: number }> {
    const response = await apiClient.get<{ success: boolean; data: Interview[]; meta: { total: number; page: number; limit: number } }>('/interviews', { params });
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
    };
  },

  async getInterviewById(interviewId: string): Promise<Interview> {
    const response = await apiClient.get<ApiResponse<Interview>>(`/interviews/${interviewId}`);
    return response.data.data;
  },

  async completeInterview(interviewId: string): Promise<Interview> {
    const response = await apiClient.post<ApiResponse<Interview>>(`/interviews/${interviewId}/complete`);
    return response.data.data;
  }
};
