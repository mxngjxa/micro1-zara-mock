'use client';

import { motion } from 'framer-motion';

interface VoiceOrbProps {
  agentState: 'initializing' | 'listening' | 'thinking' | 'speaking' | 'disconnected';
  audioLevel: number;
}

export function VoiceOrb({ agentState, audioLevel }: VoiceOrbProps) {
  const isSpeaking = agentState === 'speaking';
  const isThinking = agentState === 'thinking';
  const isListening = agentState === 'listening';
  
  // Dynamic values based on audio level and state
  const scale = isSpeaking ? 1.0 + (audioLevel * 0.5) : 1.0;
  const glowIntensity = isSpeaking ? 0.4 + (audioLevel * 0.6) : 0.3;
  const particleSpeed = isSpeaking ? audioLevel * 3 : 1.5;
  
  // State-specific colors
  const getColors = () => {
    switch (agentState) {
      case 'speaking':
        return {
          primary: '#3B82F6', // blue-500
          secondary: '#60A5FA', // blue-400
          accent: '#93C5FD', // blue-300
          glow: 'rgba(59, 130, 246, ',
        };
      case 'listening':
        return {
          primary: '#10B981', // green-500
          secondary: '#34D399', // green-400
          accent: '#6EE7B7', // green-300
          glow: 'rgba(16, 185, 129, ',
        };
      case 'thinking':
        return {
          primary: '#F59E0B', // amber-500
          secondary: '#FBBF24', // amber-400
          accent: '#FCD34D', // amber-300
          glow: 'rgba(245, 158, 11, ',
        };
      case 'initializing':
        return {
          primary: '#8B5CF6', // violet-500
          secondary: '#A78BFA', // violet-400
          accent: '#C4B5FD', // violet-300
          glow: 'rgba(139, 92, 246, ',
        };
      default:
        return {
          primary: '#6B7280', // gray-500
          secondary: '#9CA3AF', // gray-400
          accent: '#D1D5DB', // gray-300
          glow: 'rgba(107, 114, 128, ',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="relative flex items-center justify-center w-[280px] h-[280px]">
      {/* Outer rotating ring - energy field */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `2px solid ${colors.accent}`,
          opacity: 0.3,
        }}
        animate={{
          rotate: 360,
          scale: [1, 1.15, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Pulsing rings when speaking */}
      {isSpeaking && (
        <>
          {[0, 0.3, 0.6].map((delay, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: colors.secondary,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.4, 1.6],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: delay,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Orbiting particles */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            marginTop: '-6px',
            marginLeft: '-6px',
            transformOrigin: `0px 0px`,
            transform: `rotate(${angle}deg) translateX(100px)`,
            background: `radial-gradient(circle, ${colors.accent}, ${colors.secondary})`,
            boxShadow: `0 0 10px ${colors.glow}0.6)`,
          }}
          animate={{
            rotate: 360,
            scale: isSpeaking ? [1, 1.5, 1] : 1,
          }}
          transition={{
            rotate: {
              duration: 8 / particleSpeed,
              repeat: Infinity,
              ease: "linear",
              delay: (i * 0.1),
            },
            scale: {
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            },
          }}
        />
      ))}

      {/* Secondary glow layer */}
      <motion.div
        className="absolute inset-6 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, ${colors.secondary}, ${colors.primary})`,
        }}
        animate={{
          opacity: [glowIntensity * 0.4, glowIntensity * 0.6, glowIntensity * 0.4],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main orb core */}
      <motion.div
        className="absolute inset-12 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, ${colors.primary})`,
          boxShadow: `
            0 0 60px ${colors.glow}${glowIntensity}),
            0 0 100px ${colors.glow}${glowIntensity * 0.6}),
            inset 0 0 60px ${colors.glow}0.3)
          `,
        }}
        animate={{
          scale: scale,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        {/* Inner shine effect */}
        <motion.div
          className="absolute top-8 left-8 w-16 h-16 rounded-full blur-xl"
          style={{
            background: colors.accent,
            opacity: 0.6,
          }}
          animate={{
            scale: isSpeaking ? [1, 1.3, 1] : 1,
            opacity: isSpeaking ? [0.6, 0.9, 0.6] : 0.6,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Primary glow effect */}
      <motion.div
        className="absolute inset-8 rounded-full blur-3xl"
        style={{
          background: colors.primary,
        }}
        animate={{
          opacity: [glowIntensity * 0.5, glowIntensity, glowIntensity * 0.5],
          scale: [1, scale * 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Center core with gradient */}
      <motion.div
        className="absolute inset-16 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 40% 40%, 
              ${colors.accent}, 
              ${colors.secondary} 40%, 
              ${colors.primary} 80%
            )
          `,
          boxShadow: `
            0 0 40px ${colors.glow}0.8),
            inset 0 0 40px ${colors.glow}0.4)
          `,
        }}
        animate={{
          scale: isSpeaking ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Thinking state indicator - rotating segments */}
      {isThinking && (
        <motion.div
          className="absolute inset-10 rounded-full"
          style={{
            border: `3px dashed ${colors.accent}`,
            borderTopColor: colors.primary,
            borderRightColor: colors.primary,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* Listening state indicator - breathing effect */}
      {isListening && (
        <motion.div
          className="absolute inset-14 rounded-full border-2"
          style={{
            borderColor: colors.accent,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Energy waves radiating outward when speaking */}
      {isSpeaking && audioLevel > 0.3 && (
        <>
          {[0, 0.4, 0.8].map((delay, i) => (
            <motion.div
              key={`wave-${i}`}
              className="absolute inset-0 rounded-full"
              style={{
                border: `1px solid ${colors.primary}`,
              }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 2, 2.5],
                opacity: [0.5, 0.2, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: delay,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Central status indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <motion.div
          className="text-white/90 text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm"
          style={{
            background: `${colors.glow}0.3)`,
            border: `1px solid ${colors.glow}0.5)`,
          }}
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {agentState}
        </motion.div>
      </div>
    </div>
  );
}
