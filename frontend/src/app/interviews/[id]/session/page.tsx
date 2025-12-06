'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  useVoiceAssistant,
  RoomAudioRenderer,
  ControlBar,
  AgentState,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useInterviewStore } from '@/store/interview.store';
import { VoiceOrb } from '@/components/interview/voice-orb';
import { QuestionDisplay } from '@/components/interview/question-display';
import { VoiceAssistantHandler } from '@/components/interview/voice-assistant-handler';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Question } from '@/types/interview.types';

export default function InterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const {
    currentInterview,
    livekitCredentials,
    fetchInterview,
    startInterview,
    completeInterview,
    endSession,
    isLoading,
    error
  } = useInterviewStore();

  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('Waiting for interviewer...');
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRoomConnected, setIsRoomConnected] = useState(false);

  // Initial setup
  useEffect(() => {
    const initSession = async () => {
      if (id) {
        await fetchInterview(id);
        await startInterview(id);
      }
    };
    initSession();

    return () => {
      endSession();
    };
  }, [id, fetchInterview, startInterview, endSession]);

  const handleDisconnect = useCallback(async () => {
    if (id) {
      await completeInterview(id);
      router.push(`/interviews/${id}/report`);
    }
  }, [id, completeInterview, router]);

  const handleQuestionReceived = useCallback((question: Question) => {
    setCurrentQuestionText(question.content);
    setCurrentQuestionIndex((prev) => prev + 1);
    setCurrentTranscript(''); // Clear transcript on new question
  }, []);

  const handleTranscriptUpdate = useCallback((transcript: string) => {
    setCurrentTranscript(transcript);
  }, []);

  const handleAgentStateChange = useCallback((state: AgentState) => {
    setAgentState(state);
  }, []);

  // Use a separate component to track audio level since we need to be inside LiveKitRoom context
  // or use a custom hook that wraps useVoiceAssistant if possible.
  // For now, we'll assume the VoiceAssistantHandler or similar can pass this up,
  // BUT standard useVoiceAssistant provides audioTrack which we can analyze.
  // Let's create a small inner component for audio analysis if needed,
  // or just rely on visualizer in VoiceOrb if we pass the track.
  // Actually, useVoiceAssistant returns `audioTrack`. We can use it to get volume.

  if (isLoading || !livekitCredentials) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparing your interview environment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      {/* Top Bar */}
      <header className="border-b bg-background/50 backdrop-blur p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="font-semibold text-lg">{currentInterview?.job_role} Interview</h1>
            <Badge variant={currentInterview?.difficulty === 'SENIOR' ? 'destructive' : 'secondary'}>
              {currentInterview?.difficulty}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block w-48">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{Math.round((currentQuestionIndex / (currentInterview?.total_questions || 10)) * 100)}%</span>
              </div>
              <Progress value={(currentQuestionIndex / (currentInterview?.total_questions || 10)) * 100} />
            </div>
            <Button variant="destructive" size="sm" onClick={handleDisconnect}>
              End Interview
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <LiveKitRoom
        token={livekitCredentials.token}
        serverUrl={livekitCredentials.url}
        connect={true}
        audio={true}
        video={false}
        onConnected={() => setIsRoomConnected(true)}
        onDisconnected={handleDisconnect}
        className="flex-1 flex flex-col"
      >
        <main className="flex-1 container mx-auto flex flex-col items-center justify-center p-4 min-h-[600px]">
          {/* Voice Orb */}
          <div className="mb-12">
            <AudioVisualizerWrapper agentState={agentState} />
          </div>

          {/* Question Display */}
          <div className="w-full max-w-3xl z-10 flex flex-col gap-6">
            <QuestionDisplay
              question={currentQuestionText}
              questionNumber={currentQuestionIndex || 1}
              totalQuestions={currentInterview?.total_questions || 10}
            />

            {/* Transcript Display */}
            {currentTranscript && (
              <div className="bg-background/80 backdrop-blur p-4 rounded-lg border shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">Live Transcript</p>
                <p className="text-lg leading-relaxed">{currentTranscript}</p>
              </div>
            )}
          </div>

          {/* Logic Handlers */}
          <VoiceAssistantHandler
            onQuestionReceived={handleQuestionReceived}
            onTranscriptUpdate={handleTranscriptUpdate}
            onAgentStateChange={handleAgentStateChange}
          />
          
          <RoomAudioRenderer />
        </main>

        {/* Bottom Status Bar */}
        <div className="border-t bg-background/50 backdrop-blur p-2">
            <div className="container mx-auto flex justify-center text-xs text-muted-foreground">
                Status: {agentState} • {isRoomConnected ? 'Connected' : 'Connecting...'}
            </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}

// Helper component to extract audio level from the room context
function AudioVisualizerWrapper({ agentState }: { agentState: AgentState }) {
  const { audioTrack } = useVoiceAssistant();
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!audioTrack || !audioTrack.publication || !audioTrack.publication.track) {
        setAudioLevel(0);
        return;
    }

    // Cast to any to bypass TS error, assuming it's a MediaStreamTrack
    const mediaStreamTrack = (audioTrack.publication.track as any).mediaStreamTrack;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(new MediaStream([mediaStreamTrack]));
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;

    const updateLevel = () => {
        analyzer.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Normalize to 0-1 range roughly
        setAudioLevel(Math.min(average / 100, 1));
        animationFrameId = requestAnimationFrame(updateLevel);
    };

    animationFrameId = requestAnimationFrame(updateLevel);

    return () => {
        cancelAnimationFrame(animationFrameId);
        audioContext.close();
    };
  }, [audioTrack]);

  // Ensure agentState matches the union type expected by VoiceOrb
  // VoiceOrb expects: 'initializing' | 'listening' | 'thinking' | 'speaking' | 'disconnected'
  // AgentState can be 'connecting' as well
  const safeAgentState = (agentState === 'connecting' ? 'initializing' : agentState) as any;

  return <VoiceOrb agentState={safeAgentState} audioLevel={audioLevel} />;
}
