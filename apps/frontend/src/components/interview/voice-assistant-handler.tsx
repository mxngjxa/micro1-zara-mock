'use client';

import { useEffect } from 'react';
import { useVoiceAssistant, useRoomContext } from '@livekit/components-react';
import { Question } from '@/types/interview.types';

import { AgentState } from '@livekit/components-react';

interface VoiceAssistantHandlerProps {
  onQuestionReceived: (question: Question) => void;
  onTranscriptUpdate: (transcript: string) => void;
  onAgentStateChange: (state: AgentState) => void;
}

export function VoiceAssistantHandler({
  onQuestionReceived,
  onTranscriptUpdate,
  onAgentStateChange,
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

        if (data.type === 'question') {
          onQuestionReceived(data.question);
        } else if (data.type === 'transcript') {
          onTranscriptUpdate(data.text);
        }
      } catch (error) {
        console.error('Failed to parse data message:', error);
      }
    };

    room.on('dataReceived', handleDataReceived);

    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room, onQuestionReceived, onTranscriptUpdate]);

  return null; // Logic-only component
}
