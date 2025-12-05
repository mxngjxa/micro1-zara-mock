# **VOICE-BASED AI INTERVIEW AGENT - LIVEKIT IMPLEMENTATION**
## **React + NestJS + LiveKit + Gemini Live API**

***

## **PROJECT OVERVIEW**

Production-grade voice-first AI interview platform conducting technical interviews through natural conversation using LiveKit's Agent Platform and Google Gemini Live API.

**Core Technologies:**
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + LiveKit React Components
- **Backend**: NestJS + TypeScript + REST API
- **Voice AI**: LiveKit Agent Platform (Python) + Gemini Live API
- **Database**: PostgreSQL + TypeORM
- **AI Services**: Google Gemini API (question generation, evaluation)
- **Auth**: JWT + bcrypt
- **Real-time**: LiveKit WebRTC

***

## **ARCHITECTURAL PRINCIPLES**

1. **Domain-Driven Design** - Clear bounded contexts (Auth, Interview, Voice AI Agent, Business Logic)
2. **Separation of Concerns** - LiveKit handles real-time voice, NestJS handles business logic
3. **Dependency Injection** - All services testable and injectable
4. **Repository Pattern** - Data access abstraction
5. **Strategy Pattern** - Pluggable AI providers with fallbacks
6. **SOLID Principles** - Foundation for all design decisions
7. **Security First** - Defense-in-depth, input validation, rate limiting
8. **Observability** - Comprehensive logging with Winston
9. **Strictly TypeScript** - `"strict": true,` in all `tsconfig.json` files

***

## **SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────┐
│                         REACT FRONTEND                          │
│  - Authentication UI                                            │
│  - LiveKit Voice Components (useVoiceAssistant, BarVisualizer)  │
│  - Interview Management UI                                      │
│  - Report Generation UI                                         │
└─────────────────────────────────────────────────────────────────┘
           │                                    │
           │ HTTP/REST                          │ WebRTC
           ▼                                    ▼
┌──────────────────────┐           ┌────────────────────────────┐
│   NESTJS BACKEND     │           │   LIVEKIT CLOUD/SERVER     │
│  - Auth Service      │           │  - Room Management         │
│  - Interview Service │◄──RPC─────│  - WebRTC Transport        │
│  - Question Service  │           │  - Agent Dispatcher        │
│  - Evaluation Service│           └────────────────────────────┘
│  - Report Service    │                       │
│  - LiveKit Token Svc │                       │
│  - PostgreSQL + ORM  │                       ▼
└──────────────────────┘           ┌────────────────────────────┐
                                   │ LIVEKIT AGENT (PYTHON)     │
                                   │  - Gemini Live API         │
                                   │  - Interview Orchestrator  │
                                   │  - Turn Detection          │
                                   │  - Noise Cancellation      │
                                   │  - NestJS Integration      │
                                   └────────────────────────────┘
                                                │
                                                ▼
                                   ┌────────────────────────────┐
                                   │   GOOGLE GEMINI API        │
                                   │  - Live API (voice conv.)  │
                                   │  - Question Generation     │
                                   │  - Answer Evaluation       │
                                   └────────────────────────────┘
```


backend: localhost:3000
frontend: localhost:3001