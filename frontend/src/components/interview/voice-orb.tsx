'use client';

import { motion } from 'framer-motion';

interface VoiceOrbProps {
  agentState: 'initializing' | 'listening' | 'thinking' | 'speaking' | 'disconnected';
  audioLevel: number;
}

export function VoiceOrb({ agentState, audioLevel }: VoiceOrbProps) {
  const isSpeaking = agentState === 'speaking';
  
  // Calculate dynamic values for animation
  // Only animate if agent is speaking, otherwise keep idle state
  const scale = isSpeaking ? 1.0 + (audioLevel * 0.3) : 1.0;
  const opacity = isSpeaking ? 0.3 + (audioLevel * 0.5) : 0.2;
  const boxShadow = isSpeaking 
    ? `0 0 ${60 + audioLevel * 40}px rgba(59, 130, 246, ${0.3 + audioLevel * 0.4})`
    : '0 0 60px rgba(59, 130, 246, 0.3)';

  return (
    <div className="relative flex items-center justify-center w-[200px] h-[200px]">
      {/* Main Orb */}
      <motion.div
        className="w-full h-full rounded-full bg-gradient-radial from-blue-400 to-blue-600"
        style={{
          background: 'radial-gradient(circle, #60A5FA, #3B82F6)',
          boxShadow: boxShadow,
        }}
        animate={{
          scale: scale,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      />
      
      {/* Glow effect layer */}
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-400 blur-xl"
        animate={{
          opacity: opacity,
          scale: scale * 1.1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      />
      
      {/* State indicator (optional, maybe distinct pulse for thinking) */}
      {agentState === 'thinking' && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-300 opacity-50"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
