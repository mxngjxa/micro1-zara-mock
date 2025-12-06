'use client';

import { useEffect } from 'react';
import { useVoiceAssistant, useRoomContext } from '@livekit/components-react';
import { Question } from '@/types/interview.types';

import { AgentState } from '@livekit/components-react';

interface ProgressUpdate {
  current_question: number;
  total_questions: number;
  completed: number;
}

interface VoiceAssistantHandlerProps {
  onQuestionReceived: (question: Question) => void;
  onTranscriptUpdate: (transcript: string) => void;
  onAgentStateChange: (state: AgentState) => void;
  onProgressUpdate?: (progress: ProgressUpdate) => void;
  onInterviewComplete?: (interviewId: string) => void;
}

export function VoiceAssistantHandler({
  onQuestionReceived,
  onTranscriptUpdate,
  onAgentStateChange,
  onProgressUpdate,
  onInterviewComplete,
}: VoiceAssistantHandlerProps) {
  const room = useRoomContext();
  const { state, audioTrack } = useVoiceAssistant();

  // Monitor agent state
  useEffect(() => {
    onAgentStateChange(state);
  }, [state, onAgentStateChange]);

  // Listen to data messages from the agent
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array, participant: any) => {
      try {
        const decoder = new TextDecoder();
        const strData = decoder.decode(payload);
        const data = JSON.parse(strData);

        console.log('Received data message:', data.type, data);

        if (data.type === 'question') {
          onQuestionReceived(data.question);
        } else if (data.type === 'transcript') {
          onTranscriptUpdate(data.text);
        } else if (data.type === 'progress' && onProgressUpdate) {
          onProgressUpdate({
            current_question: data.current_question,
            total_questions: data.total_questions,
            completed: data.completed,
          });
        } else if (data.type === 'interview_complete' && onInterviewComplete) {
          console.log('Interview complete, navigating to report...');
          onInterviewComplete(data.interview_id);
        }
      } catch (error) {
        console.error('Failed to parse data message:', error);
      }
    };

    room.on('dataReceived', handleDataReceived);

    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room, onQuestionReceived, onTranscriptUpdate, onProgressUpdate, onInterviewComplete]);

  return null; // Logic-only component
}
