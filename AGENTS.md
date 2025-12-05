# **VOICE-BASED AI INTERVIEW AGENT - ENHANCED IMPLEMENTATION PROMPT**
## **Using Gemini API | React + NestJS + PostgreSQL**

***

## **PROJECT OVERVIEW**

Build a production-grade, voice-first AI interview platform that conducts technical interviews through natural conversation using Google Gemini API for all AI capabilities.

**Core Technologies:**
- Frontend: React 18 + TypeScript + Vite + TailwindCSS
- Backend: NestJS + TypeScript + WebSockets
- Database: PostgreSQL + TypeORM
- AI: Google Gemini API (question generation, evaluation, TTS interactions)
- Auth: JWT + bcrypt
- Real-time: Socket.io

***

## **ARCHITECTURAL PRINCIPLES**

1. **Domain-Driven Design**: Clear bounded contexts (Auth, Interview, Voice, AI)
2. **Dependency Injection**: All services testable and injectable
3. **Repository Pattern**: Data access abstraction
4. **Strategy Pattern**: Pluggable AI providers with fallbacks
5. **SOLID Principles**: Foundation for all design decisions
6. **Security First**: Defense-in-depth, input validation, rate limiting
7. **Observability**: Comprehensive logging with Winston

***