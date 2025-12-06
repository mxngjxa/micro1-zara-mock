import { create } from 'zustand';
import { InterviewService } from '../lib/interview.service';
import { CreateInterviewPayload, Interview, LiveKitCredentials, Question } from '../types/interview.types';

interface InterviewState {
  currentInterview: Interview | null;
  interviews: Interview[];
  isLoading: boolean;
  error: string | null;
  
  // LiveKit session state
  livekitCredentials: LiveKitCredentials | null;
  currentQuestion: Question | null;
  isSessionActive: boolean;
  
  // Actions
  createInterview: (payload: CreateInterviewPayload) => Promise<Interview>;
  startInterview: (id: string) => Promise<void>;
  fetchUserInterviews: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>;
  fetchInterview: (id: string) => Promise<void>;
  completeInterview: (id: string) => Promise<void>;
  setCurrentQuestion: (question: Question | null) => void;
  endSession: () => void;
  clearError: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  // Initial state
  currentInterview: null,
  interviews: [],
  isLoading: false,
  error: null,
  livekitCredentials: null,
  currentQuestion: null,
  isSessionActive: false,
  
  createInterview: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const interview = await InterviewService.createInterview(payload);
      set({ 
        currentInterview: interview, 
        isLoading: false 
      });
      return interview;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create interview', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  startInterview: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const credentials = await InterviewService.startInterview(id);
      set({ 
        livekitCredentials: credentials,
        isSessionActive: true,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to start interview', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  fetchUserInterviews: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await InterviewService.getUserInterviews(params);
      set({ 
        interviews: result.data, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch interviews', 
        isLoading: false 
      });
      throw error;
    }
  },

  fetchInterview: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const interview = await InterviewService.getInterviewById(id);
      set({ 
        currentInterview: interview, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch interview', 
        isLoading: false 
      });
      throw error;
    }
  },

  completeInterview: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const interview = await InterviewService.completeInterview(id);
      set({ 
        currentInterview: interview,
        isSessionActive: false,
        livekitCredentials: null,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to complete interview', 
        isLoading: false 
      });
      throw error;
    }
  },

  setCurrentQuestion: (question) => {
    set({ currentQuestion: question });
  },

  endSession: () => {
    set({ 
      isSessionActive: false, 
      livekitCredentials: null,
      currentQuestion: null 
    });
  },

  clearError: () => {
    set({ error: null });
  }
}));
