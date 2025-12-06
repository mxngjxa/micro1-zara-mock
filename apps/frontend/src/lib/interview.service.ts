import { apiClient } from './api-client';
import { CreateInterviewPayload, Interview, LiveKitCredentials } from '../types/interview.types';

export const InterviewService = {
  async createInterview(payload: CreateInterviewPayload): Promise<Interview> {
    const response = await apiClient.post<Interview>('/interviews', payload);
    return response.data;
  },

  async startInterview(interviewId: string): Promise<LiveKitCredentials> {
    const response = await apiClient.post<LiveKitCredentials>(`/interviews/${interviewId}/start`);
    return response.data;
  },

  async getUserInterviews(params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Interview[]; total: number; page: number; limit: number }> {
    const response = await apiClient.get<{ data: Interview[]; total: number; page: number; limit: number }>('/interviews', { params });
    return response.data;
  },

  async getInterviewById(interviewId: string): Promise<Interview> {
    const response = await apiClient.get<Interview>(`/interviews/${interviewId}`);
    return response.data;
  },

  async completeInterview(interviewId: string): Promise<Interview> {
    const response = await apiClient.post<Interview>(`/interviews/${interviewId}/complete`);
    return response.data;
  }
};
