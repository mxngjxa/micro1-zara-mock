# Voice-Based AI Interview Agent - Ultra-Comprehensive Implementation Prompts

## Project Overview

**System**: Voice-first AI interview agent conducting technical interviews through natural spoken conversation  
**Stack**: React + NestJS + PostgreSQL + JWT + AI SDKs (OpenAI/Deepgram/AssemblyAI)  
**Focus**: Real-time voice interaction, AI-driven flow, minimal UI, production-ready architecture

---

## Phase 0: Foundation & Architecture Setup

### Objectives
- Establish monorepo structure with clear separation of concerns
- Configure development environment with hot-reload, linting, and TypeScript
- Set up PostgreSQL with migrations and seed data
- Implement comprehensive error handling and logging strategy
- Define API contracts and TypeScript interfaces

### Implementation Prompt

You are building the foundational architecture for a voice-based AI interview system.

REQUIREMENTS:
1. Create a monorepo structure:
   /project-root
     /frontend (React with Vite/Next.js)
     /backend (NestJS)
     /shared (TypeScript types and interfaces)
     docker-compose.yml
     README.md

2. Backend Setup (NestJS):
   - Install NestJS CLI and initialize project with TypeScript strict mode
   - Configure environment variables (.env) for:
     * DATABASE_URL (PostgreSQL connection string)
     * JWT_SECRET (256-bit secret for token signing)
     * JWT_EXPIRATION (e.g., "24h")
     * OPENAI_API_KEY
     * DEEPGRAM_API_KEY
     * NODE_ENV (development/production)
   - Install core dependencies:
     * @nestjs/typeorm, typeorm, pg (database)
     * @nestjs/jwt, @nestjs/passport, passport-jwt (auth)
     * class-validator, class-transformer (validation)
     * @nestjs/config (environment management)
     * winston (logging)
   - Create app.module.ts with:
     * TypeOrmModule.forRoot() with PostgreSQL config
     * ConfigModule.forRoot() for env variables
     * Global validation pipe with whitelist: true
     * Global exception filter for standardized error responses
   - Implement centralized logging service using Winston:
     * Log levels: error, warn, info, debug
     * File rotation for production
     * Console output for development
     * Request/response logging middleware

3. Frontend Setup (React):
   - Initialize React project with Vite for fast HMR
   - Install core dependencies:
     * react-router-dom (routing)
     * @tanstack/react-query (API state management)
     * axios (HTTP client)
     * zustand (lightweight state management)
     * tailwindcss (styling)
   - Configure TypeScript with strict mode
   - Set up Tailwind CSS with custom design system tokens
   - Create folder structure:
     /src
       /components (reusable UI components)
       /pages (route components)
       /hooks (custom React hooks)
       /services (API client)
       /stores (Zustand stores)
       /types (TypeScript interfaces)
       /utils (helper functions)

4. Database Schema Design (PostgreSQL):
   - Create TypeORM entities:
     * User (id, email, password_hash, created_at, updated_at)
     * Interview (id, user_id, status, started_at, completed_at, score)
     * Question (id, interview_id, content, expected_answer, difficulty, order)
     * Answer (id, question_id, transcript, audio_url, evaluation, score, duration)
   - Add indexes on:
     * user.email (unique)
     * interview.user_id + interview.status
     * question.interview_id + question.order
     * answer.question_id
   - Configure TypeORM migrations with timestamp-based naming
   - Create initial migration for all tables
   - Seed database with sample technical questions

5. Shared Types (/shared):
   - Define comprehensive TypeScript interfaces:
     * ApiResponse<T> (standardized response wrapper)
     * User, Interview, Question, Answer (domain models)
     * CreateInterviewDto, SubmitAnswerDto, etc. (DTOs)
     * JwtPayload (token structure)
     * InterviewStatus enum (PENDING, IN_PROGRESS, COMPLETED)
     * QuestionDifficulty enum (EASY, MEDIUM, HARD)

6. Docker Configuration:
   - Create docker-compose.yml with services:
     * postgres (PostgreSQL 15 with persistent volume)
     * backend (NestJS with hot-reload volume mount)
     * frontend (React with Vite dev server)
   - Configure network for inter-service communication
   - Add health checks for each service

DELIVERABLES:
- Fully functional development environment with `docker-compose up`
- Database accessible with pgAdmin or similar tool
- Backend API running on http://localhost:3000 with Swagger docs at /api
- Frontend running on http://localhost:5173 with hot-reload
- Comprehensive README.md with:
  * Architecture diagram (text-based or tool like Mermaid)
  * Environment setup instructions
  * Database migration commands
  * Development workflow guide
  * API documentation overview
- TypeScript compilation with zero errors across all projects

ACCEPTANCE CRITERIA:
✓ `npm run build` succeeds in all projects
✓ Database migrations run successfully
✓ All services start without errors in Docker
✓ TypeScript strict mode enabled with no implicit any
✓ ESLint and Prettier configured with consistent rules
✓ Git hooks configured for pre-commit linting

---

## Phase 1: Authentication & Authorization System

### Objectives
- Implement secure email/password authentication with bcrypt
- Create JWT-based session management
- Build protected routes with role-based access control
- Develop login/register UI with validation
- Implement password reset flow (optional enhancement)

### Implementation Prompt

You are implementing a production-grade authentication system for the interview platform.

BACKEND REQUIREMENTS:

1. User Module (NestJS):
   - Create users.module.ts, users.service.ts, users.controller.ts
   - Implement UserEntity with:
     * Password hashing using bcrypt (salt rounds: 10)
     * Email validation (lowercase, valid format)
     * Timestamp tracking (created_at, updated_at, last_login)
   - User service methods:
     * create(email, password): Hash password, store user, return user without password
     * findByEmail(email): Return user for login validation
     * findById(id): Return user for JWT validation
     * updateLastLogin(id): Track authentication events
   - Add unique constraint on email field
   - Implement soft delete for user accounts

2. Authentication Module:
   - Create auth.module.ts, auth.service.ts, auth.controller.ts
   - Install dependencies: @nestjs/passport, passport-jwt, bcrypt, @types/bcrypt
   - Auth service methods:
     * register(email, password): Validate email uniqueness, create user, return tokens
     * login(email, password): Validate credentials, generate tokens
     * validateUser(id): Verify user exists and is active
     * generateTokens(userId): Create access token (24h) and refresh token (7d)
   - Implement JwtStrategy extending PassportStrategy:
     * Extract JWT from Authorization header (Bearer token)
     * Validate token signature using JWT_SECRET
     * Attach user object to request
   - Create DTOs with class-validator:
     * RegisterDto: email (IsEmail), password (MinLength(8), Matches regex for complexity)
     * LoginDto: email (IsEmail), password (IsNotEmpty)
   - API endpoints:
     * POST /auth/register (public)
     * POST /auth/login (public)
     * POST /auth/refresh (public, requires refresh token)
     * GET /auth/me (protected, returns current user)

3. Guards & Decorators:
   - Create JwtAuthGuard extending AuthGuard('jwt')
   - Create CurrentUser decorator to extract user from request
   - Apply global guard with @UseGuards(JwtAuthGuard) on protected routes
   - Create Public decorator to bypass auth on specific endpoints

4. Error Handling:
   - Return standardized error responses:
     * 400 Bad Request: Invalid input (validation errors)
     * 401 Unauthorized: Invalid credentials or expired token
     * 409 Conflict: Email already exists
     * 500 Internal Server Error: Unexpected errors
   - Include error codes for frontend handling (e.g., "EMAIL_EXISTS", "INVALID_CREDENTIALS")

FRONTEND REQUIREMENTS:

1. Authentication Service (/services/auth.ts):
   - Implement axios client with interceptors:
     * Request interceptor: Attach Authorization header from localStorage
     * Response interceptor: Handle 401 by clearing tokens and redirecting to login
   - API methods:
     * register(email, password): POST /auth/register
     * login(email, password): POST /auth/login, store tokens
     * logout(): Clear tokens, redirect to login
     * getCurrentUser(): GET /auth/me
     * refreshToken(): POST /auth/refresh
   - Token management utilities:
     * getAccessToken(): Retrieve from localStorage
     * setTokens(access, refresh): Store both tokens
     * clearTokens(): Remove all auth data

2. Authentication Store (Zustand):
   - Create useAuthStore with state:
     * user: User | null
     * isAuthenticated: boolean
     * isLoading: boolean
   - Actions:
     * login(email, password): Call API, store tokens, set user
     * register(email, password): Call API, auto-login
     * logout(): Clear tokens and user state
     * checkAuth(): Validate token on app mount
     * setUser(user): Update user state

3. UI Components:
   - LoginPage:
     * Email and password inputs with validation
     * Show/hide password toggle
     * Error message display (invalid credentials, network errors)
     * "Remember me" checkbox (extend token expiration)
     * Link to registration page
     * Loading state during authentication
   - RegisterPage:
     * Email, password, confirm password inputs
     * Real-time password strength indicator
     * Display validation errors inline
     * Terms of service checkbox
     * Link to login page
   - ProtectedRoute component:
     * Check isAuthenticated from store
     * Redirect to /login if not authenticated
     * Show loading spinner while checking auth
     * Wrap interview and dashboard routes

4. Routing Configuration:
   - Configure react-router-dom routes:
     * / → Landing page (public)
     * /login → LoginPage (public)
     * /register → RegisterPage (public)
     * /dashboard → Dashboard (protected)
     * /interview → InterviewPage (protected)
     * /interview/:id → InterviewDetailPage (protected)
   - Implement navigation guards using ProtectedRoute HOC

SECURITY REQUIREMENTS:
- Hash passwords with bcrypt before storing (never store plaintext)
- Use HTTP-only cookies for refresh tokens (prevents XSS)
- Implement rate limiting on auth endpoints (max 5 attempts per 15 minutes)
- Validate JWT expiration and signature on every protected request
- Clear tokens on logout or token expiration
- Use HTTPS in production (enforce with HSTS headers)
- Implement CORS with whitelist of allowed origins

TESTING REQUIREMENTS:
- Unit tests for auth service (login, register, token validation)
- Integration tests for auth endpoints (happy path and error cases)
- Frontend tests for login/register flows with React Testing Library
- E2E tests for complete authentication journey with Cypress

DELIVERABLES:
✓ Users can register with email/password
✓ Users can login and receive JWT tokens
✓ Protected routes require valid authentication
✓ Token refresh works before expiration
✓ Logout clears all auth state
✓ Error messages are user-friendly and actionable
✓ Password requirements enforced (min 8 chars, uppercase, number, symbol)
✓ Email uniqueness validated before registration
✓ Comprehensive test coverage (>80%)

---

## Phase 2: Real-Time Voice Infrastructure

### Objectives
- Integrate Speech-to-Text (STT) service for live transcription
- Integrate Text-to-Speech (TTS) service for AI voice responses
- Implement WebSocket/WebRTC for low-latency audio streaming
- Build silence detection algorithm for automatic question transitions
- Create audio recording and playback UI components

### Implementation Prompt

You are implementing real-time voice capabilities using modern AI SDKs and WebRTC.

AI SDK INTEGRATION:

1. Speech-to-Text Service (Deepgram):
   - Install @deepgram/sdk in backend
   - Create stt.service.ts with methods:
     * streamTranscription(audioStream): Real-time transcription using Deepgram streaming
     * transcribeFile(audioBuffer): Batch transcription for stored recordings
     * Configuration: model="nova-2", language="en", punctuate=true, interim_results=true
   - Handle streaming events:
     * onTranscript: Emit partial and final transcripts via WebSocket
     * onError: Log errors and fallback gracefully
     * onMetadata: Track confidence scores and word timestamps
   - Implement fallback to OpenAI Whisper if Deepgram fails

2. Text-to-Speech Service (OpenAI TTS):
   - Create tts.service.ts with methods:
     * synthesize(text, voice="alloy"): Generate audio from text using OpenAI TTS API
     * streamAudio(text): Stream audio chunks for faster playback
   - Configuration: model="tts-1", response_format="mp3", speed=1.0
   - Implement audio caching:
     * Cache common phrases to reduce API calls
     * Use Redis or in-memory cache with TTL
   - Handle rate limiting with exponential backoff

3. Audio Processing Utilities:
   - Create audio.utils.ts with functions:
     * detectSilence(audioBuffer, threshold, duration): Identify pauses indicating user finished speaking
     * normalizeAudio(buffer): Apply gain control for consistent volume
     * convertFormat(buffer, from, to): Handle different audio formats (webm, mp3, wav)
   - Silence detection algorithm:
     * Sample audio at 16kHz
     * Calculate RMS amplitude in 100ms windows
     * Trigger silence event after 1.5 seconds below threshold
     * Reset on any speech detection

BACKEND WEBSOCKET IMPLEMENTATION:

1. WebSocket Gateway (NestJS):
   - Install @nestjs/websockets, socket.io
   - Create voice.gateway.ts extending WebSocketGateway:
     * Namespace: /voice
     * CORS enabled for frontend origin
   - Implement event handlers:
     * @SubscribeMessage('startInterview'): Initialize interview session, return first question
     * @SubscribeMessage('audioStream'): Receive audio chunks, pipe to Deepgram
     * @SubscribeMessage('stopRecording'): Finalize transcript, trigger evaluation
   - Emit events to client:
     * 'transcript': Send partial and final transcriptions
     * 'question': Send next AI-generated question with audio
     * 'evaluation': Send answer evaluation and score
     * 'error': Send error messages for client handling

2. Session Management:
   - Create voice.service.ts for managing interview sessions
   - In-memory session store (Map) with user_id as key:
     * current_question_id
     * transcript_buffer (accumulate partial transcripts)
     * audio_chunks (store recording segments)
     * silence_timer (track silence duration)
   - Session lifecycle:
     * Create session on 'startInterview'
     * Update state on audio/transcript events
     * Clean up on interview completion or disconnect
     * Handle reconnection with session recovery

FRONTEND AUDIO IMPLEMENTATION:

1. Audio Recording Hook (useAudioRecorder):
   - Use MediaRecorder API to capture microphone input
   - Implementation:
     * requestMicrophonePermission(): Request and handle user consent
     * startRecording(): Initialize MediaRecorder with audio/webm codec
     * stopRecording(): Finalize recording and return audio blob
     * onDataAvailable: Send audio chunks to backend via WebSocket every 250ms
   - State management:
     * isRecording: boolean
     * audioLevel: number (for visual feedback)
     * permissionStatus: 'granted' | 'denied' | 'prompt'
   - Error handling:
     * NotAllowedError: Microphone permission denied
     * NotFoundError: No microphone device
     * NotReadableError: Microphone in use by another app

2. Audio Playback Hook (useAudioPlayer):
   - Use HTML5 Audio API for TTS playback
   - Implementation:
     * play(audioUrl): Load and play AI response
     * pause(): Pause current playback
     * onEnded: Trigger next question or user turn
   - State management:
     * isPlaying: boolean
     * duration: number
     * currentTime: number

3. WebSocket Client Service (voiceSocket.ts):
   - Initialize socket.io-client connection to /voice namespace
   - Event listeners:
     * 'connect': Log connection, emit 'startInterview'
     * 'transcript': Update UI with live transcript
     * 'question': Play TTS audio, display question text
     * 'evaluation': Show answer feedback
     * 'disconnect': Handle reconnection logic
   - Event emitters:
     * emit('audioStream', audioChunk): Send recorded audio
     * emit('stopRecording'): Signal end of answer

4. Voice Interview Component:
   - Create InterviewVoice.tsx with:
     * Microphone button (tap to talk, release to stop)
     * Live transcript display (updating in real-time)
     * Current question display with visual indicator
     * Audio visualizer showing microphone input level
     * "Skip question" button with confirmation
     * Interview progress indicator (question N of M)
   - State management:
     * currentQuestion: string
     * transcript: string
     * isRecording: boolean
     * isProcessing: boolean (waiting for AI response)
   - User flow:
     * Display first question with TTS
     * User speaks answer (microphone active)
     * Silence detected → automatically stop recording
     * Show "Processing..." while AI evaluates
     * Display next question and repeat

SILENCE DETECTION:

1. Frontend Implementation:
   - Use Web Audio API to analyze microphone input:
     * Create AudioContext and AnalyserNode
     * Calculate real-time volume (RMS)
     * Track silence duration when volume < threshold
   - Trigger 'stopRecording' event after 1.5s of silence
   - Visual feedback: Show volume meter and silence countdown

2. Backend Validation:
   - Confirm silence detection server-side using audio analysis
   - Prevent false triggers from background noise
   - Configurable thresholds per user environment

TECHNICAL REQUIREMENTS:
- Audio format: 16kHz mono PCM for optimal STT performance
- Maximum audio chunk size: 1MB (prevent memory issues)
- WebSocket reconnection with exponential backoff (max 5 attempts)
- Graceful degradation if microphone unavailable (text input fallback)
- Audio latency: <500ms from speech to transcript display
- TTS latency: <2s from question generation to audio playback

DELIVERABLES:
✓ Users can speak and see live transcript in UI
✓ AI questions played through TTS with clear audio
✓ Silence detection automatically advances to next question
✓ Audio recording and playback work on Chrome, Firefox, Safari
✓ WebSocket maintains stable connection during interview
✓ Microphone permission handled gracefully with user prompts
✓ Visual feedback for recording status and audio levels
✓ Fallback to text input if voice fails
✓ Comprehensive error handling for audio/network issues

---

## Phase 3: AI-Driven Interview Engine

### Objectives
- Implement question generation using OpenAI GPT-4
- Build answer evaluation system with scoring rubric
- Create interview flow orchestration (question sequencing, difficulty adjustment)
- Store interview sessions with complete audit trail
- Generate post-interview reports with insights

### Implementation Prompt

You are building an intelligent interview engine that generates contextual questions and evaluates answers using AI.

AI QUESTION GENERATION:

1. Interview Service (interview.service.ts):
   - Create generateInterview(userId, jobRole, difficulty) method:
     * Use OpenAI GPT-4 to generate 10 technical questions based on:
       - Job role (e.g., "Frontend Developer", "Data Scientist")
       - Difficulty level (Junior, Mid-level, Senior)
       - Technology stack specified by user
     * System prompt template:
       You are a technical interviewer generating questions for a {jobRole} position.
       Create {count} questions ranging from {difficulty} level.
       Questions should cover: {topics}
       Format: Return JSON array with {question, expectedAnswer, difficulty, topic}
   - Store generated questions in database with interview_id
   - Ensure question diversity (vary topics and difficulty)
   - Cache common question sets to reduce API costs

2. Question Sequencing Logic:
   - Start with easy questions to build candidate confidence
   - Adapt difficulty based on answer quality:
     * High scores → Increase difficulty
     * Low scores → Maintain or decrease difficulty
   - Implement decision tree:
     * Score ≥ 80%: Next question +1 difficulty
     * Score 50-79%: Same difficulty
     * Score < 50%: Next question -1 difficulty (min: EASY)
   - Track performance trajectory for final evaluation

3. Answer Evaluation Service (evaluation.service.ts):
   - Create evaluateAnswer(questionId, answerTranscript) method:
     * Use OpenAI GPT-4 to evaluate answer quality
     * Evaluation prompt template:
       Question: {question}
       Expected Answer: {expectedAnswer}
       Candidate Answer: {transcript}
       
       Evaluate the answer on:
       1. Correctness (0-100): Technical accuracy
       2. Completeness (0-100): Coverage of key points
       3. Clarity (0-100): Communication effectiveness
       
       Return JSON: {
         "correctness": number,
         "completeness": number,
         "clarity": number,
         "overall_score": number,
         "feedback": string,
         "strengths": string[],
         "improvements": string[]
       }
   - Calculate composite score: (correctness * 0.5 + completeness * 0.3 + clarity * 0.2)
   - Store evaluation in Answer entity
   - Generate actionable feedback for candidate improvement

4. Interview Orchestration:
   - Create interview.controller.ts with endpoints:
     * POST /interviews/start: Create new interview session
       - Input: jobRole, difficulty, topics[]
       - Output: interviewId, firstQuestion, estimatedDuration
     * POST /interviews/:id/answer: Submit answer and get next question
       - Input: questionId, transcript, audioDuration
       - Process: Evaluate answer, determine next question difficulty
       - Output: evaluation, nextQuestion, progress
     * POST /interviews/:id/complete: Finalize interview
       - Generate overall score and detailed report
       - Send completion email (optional)
     * GET /interviews/:id: Retrieve interview details
       - Return questions, answers, evaluations, final score

INTERVIEW DATA MODEL:

1. Interview Entity Extensions:
   - Add fields:
     * job_role: string
     * difficulty: enum (JUNIOR, MID, SENIOR)
     * topics: string[] (e.g., ["React", "TypeScript", "REST APIs"])
     * overall_score: number (0-100)
     * performance_trend: 'IMPROVING' | 'DECLINING' | 'CONSISTENT'
     * duration_minutes: number
     * completed_questions: number
     * total_questions: number

2. Question Entity Extensions:
   - Add fields:
     * topic: string (categorize questions)
     * difficulty: enum (EASY, MEDIUM, HARD)
     * expected_answer: text (reference for evaluation)
     * evaluation_criteria: JSON (custom rubric per question)
     * time_limit_seconds: number (optional time constraints)

3. Answer Entity Extensions:
   - Add fields:
     * evaluation_json: JSON (detailed scores from AI)
     * feedback: text (AI-generated improvement suggestions)
     * confidence_score: number (AI confidence in evaluation)
     * recording_url: string (S3 link to audio file)

FRONTEND INTERVIEW FLOW:

1. Interview Start Page:
   - Allow user to configure interview:
     * Select job role from dropdown (predefined list or custom)
     * Choose difficulty level (Junior/Mid/Senior)
     * Select topics/technologies (multi-select checkboxes)
     * Set interview length (5, 10, or 15 questions)
   - Display estimated duration and question preview
   - "Start Interview" button initiates session

2. Interview Progress Component:
   - Show progress bar: "Question 3 of 10"
   - Display current question prominently
   - Show timer for current question (optional)
   - Live transcript area with auto-scroll
   - "Next Question" button (manual override of silence detection)
   - "Pause Interview" button (saves state for later)

3. Post-Interview Report Page:
   - Display overall score with visual gauge (0-100)
   - Breakdown by category:
     * Technical Accuracy: X/100
     * Completeness: X/100
     * Communication: X/100
   - Question-by-question review:
     * Question text
     * User's transcript
     * Score and AI feedback
     * Audio playback option
   - Strengths and areas for improvement
   - Suggested learning resources (links to tutorials, docs)
   - "Download Report" button (PDF generation)
   - "Retake Interview" button (start new session)

AI OPTIMIZATION:

1. Prompt Engineering Best Practices:
   - Use structured output format (JSON) for consistent parsing
   - Include few-shot examples in prompts for better quality
   - Set temperature=0.7 for balanced creativity and consistency
   - Use max_tokens limits to control cost
   - Implement retry logic with exponential backoff for API failures

2. Cost Optimization:
   - Cache frequently used question sets (e.g., "React Junior")
   - Use GPT-3.5-turbo for less critical tasks (e.g., question categorization)
   - Batch API requests where possible
   - Monitor token usage per interview (log for cost analysis)
   - Set user limits (e.g., max 3 interviews per day for free tier)

3. Quality Assurance:
   - Log all AI inputs/outputs for debugging
   - Implement human review queue for questionable evaluations
   - A/B test different prompt variations
   - Collect user feedback on question quality and evaluation fairness

ERROR HANDLING:

1. AI Service Failures:
   - If OpenAI API fails:
     * Retry up to 3 times with exponential backoff
     * Fall back to pre-generated question bank
     * Notify user of degraded experience
   - If evaluation fails:
     * Use rule-based scoring (keyword matching)
     * Allow manual re-evaluation later

2. Session Recovery:
   - Save interview state after each answer
   - Allow users to resume interrupted interviews
   - Expire sessions after 24 hours

DELIVERABLES:
✓ System generates contextually relevant technical questions based on job role
✓ AI evaluates answers with detailed feedback and scores
✓ Difficulty adapts based on candidate performance
✓ Complete interview data stored for later review
✓ Post-interview report provides actionable insights
✓ Question generation completes in <5 seconds
✓ Answer evaluation completes in <3 seconds
✓ 95% evaluation accuracy (validated against human reviewers)
✓ Cost per interview <$0.50 (with GPT-4)

---

## Phase 4: Security, Validation & Access Control

### Objectives
- Implement comprehensive input validation and sanitization
- Add authorization layer (users can only access their own interviews)
- Protect against common vulnerabilities (SQL injection, XSS, CSRF)
- Implement rate limiting and request throttling
- Add audit logging for sensitive operations

### Implementation Prompt

You are implementing enterprise-grade security for the interview platform.

INPUT VALIDATION:

1. Backend Validation (class-validator):
   - Create DTOs for all endpoints with validation rules:
     * CreateInterviewDto:
       - jobRole: @IsString(), @MinLength(2), @MaxLength(100)
       - difficulty: @IsEnum(DifficultyLevel)
       - topics: @IsArray(), @ArrayMinSize(1), @ArrayMaxSize(10)
     * SubmitAnswerDto:
       - questionId: @IsUUID()
       - transcript: @IsString(), @MaxLength(5000)
       - audioDuration: @IsNumber(), @Min(0), @Max(300)
   - Use ValidationPipe globally in main.ts:
     app.useGlobalPipes(new ValidationPipe({
       whitelist: true, // Strip unknown properties
       forbidNonWhitelisted: true, // Reject unknown properties
       transform: true, // Auto-transform to DTO types
       transformOptions: { enableImplicitConversion: true }
     }));
   - Create custom validators for complex rules:
     * @IsValidJobRole() - Validate against approved list
     * @IsReasonableAudioDuration() - Prevent malicious large values

2. Frontend Validation (React Hook Form + Zod):
   - Install react-hook-form and zod
   - Create validation schemas:
     const interviewConfigSchema = z.object({
       jobRole: z.string().min(2).max(100),
       difficulty: z.enum(['JUNIOR', 'MID', 'SENIOR']),
       topics: z.array(z.string()).min(1).max(10)
     });
   - Use useForm with zodResolver for real-time validation
   - Display validation errors inline with clear messages

3. Sanitization:
   - Install DOMPurify for frontend HTML sanitization
   - Sanitize all user-generated content before rendering
   - Use parameterized queries in TypeORM (prevents SQL injection)
   - Escape special characters in transcripts before storage

AUTHORIZATION:

1. Resource Ownership Guards:
   - Create ResourceOwnerGuard in backend:
     @Injectable()
     export class ResourceOwnerGuard implements CanActivate {
       canActivate(context: ExecutionContext): boolean {
         const request = context.switchToHttp().getRequest();
         const userId = request.user.id;
         const resourceUserId = request.params.userId || request.body.userId;
         return userId === resourceUserId;
       }
     }
   - Apply to interview endpoints:
     @Get('interviews/:id')
     @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
     async getInterview(@Param('id') id: string, @CurrentUser() user: User) {
       // User can only access their own interviews
       const interview = await this.interviewService.findOne(id);
       if (interview.userId !== user.id) {
         throw new ForbiddenException('Access denied');
       }
       return interview;
     }

2. Database-Level Constraints:
   - Add foreign key constraints with ON DELETE CASCADE
   - Create database policies (if using PostgreSQL RLS):
     ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
     CREATE POLICY user_interviews ON interviews
       FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);
   - Use query filters in TypeORM repositories:
     findUserInterviews(userId: string) {
       return this.interviewRepository.find({ where: { userId } });
     }

SECURITY BEST PRACTICES:

1. Rate Limiting:
   - Install @nestjs/throttler
   - Configure global rate limits:
     ThrottlerModule.forRoot({
       ttl: 60, // Time window in seconds
       limit: 10, // Max requests per window
     })
   - Stricter limits on sensitive endpoints:
     * /auth/login: 5 requests per 15 minutes
     * /auth/register: 3 requests per hour
     * /interviews/start: 5 requests per hour (prevent abuse)
   - Return 429 Too Many Requests with Retry-After header

2. CORS Configuration:
   - Enable CORS with whitelist:
     app.enableCors({
       origin: process.env.FRONTEND_URL || 'http://localhost:5173',
       credentials: true,
       methods: ['GET', 'POST', 'PUT', 'DELETE'],
       allowedHeaders: ['Content-Type', 'Authorization']
     });
   - Block requests from unknown origins

3. Helmet Security Headers:
   - Install helmet middleware
   - Configure security headers:
     app.use(helmet({
       contentSecurityPolicy: {
         directives: {
           defaultSrc: ["'self'"],
           scriptSrc: ["'self'", "'unsafe-inline'"], // Avoid unsafe-inline in production
           styleSrc: ["'self'", "'unsafe-inline'"],
           imgSrc: ["'self'", 'data:', 'https:'],
         }
       },
       hsts: { maxAge: 31536000, includeSubDomains: true }
     }));

4. Secrets Management:
   - Never commit .env files to version control
   - Use .env.example as template
   - Rotate JWT_SECRET regularly
   - Use different secrets for development/production
   - Consider HashiCorp Vault or AWS Secrets Manager for production

AUDIT LOGGING:

1. Audit Log Entity:
   - Create AuditLog table:
     * id, userId, action, resource, timestamp, ip_address, user_agent, details (JSON)
   - Log critical actions:
     * User registration/login
     * Interview start/completion
     * Answer submissions
     * Failed authentication attempts
     * Permission errors (403, 401)

2. Logging Middleware:
   - Create audit.middleware.ts:
     @Injectable()
     export class AuditMiddleware implements NestMiddleware {
       use(req: Request, res: Response, next: Function) {
         const { method, originalUrl, ip, headers } = req;
         const userId = req.user?.id || 'anonymous';
         
         this.auditService.log({
           userId,
           action: `${method} ${originalUrl}`,
           ip,
           userAgent: headers['user-agent'],
           timestamp: new Date()
         });
         
         next();
       }
     }
   - Apply to sensitive routes only (avoid logging noise)

3. Monitoring & Alerts:
   - Set up alerts for:
     * Multiple failed login attempts (potential brute force)
     * Unusual API usage patterns (potential abuse)
     * High error rates (system issues)
   - Use Winston logger with different levels (error, warn, info, debug)
   - Send critical errors to external service (Sentry, LogRocket)

VULNERABILITY PREVENTION:

1. SQL Injection:
   - Use TypeORM parameterized queries exclusively
   - Never concatenate user input into raw SQL
   - Example:
     // ✅ Safe
     await repository.find({ where: { email } });
     
     // ❌ Dangerous
     await repository.query(`SELECT * FROM users WHERE email = '${email}'`);

2. XSS (Cross-Site Scripting):
   - Escape all user-generated content in React (automatic with JSX)
   - Use DOMPurify for rich text or HTML content
   - Set Content-Security-Policy headers
   - Avoid dangerouslySetInnerHTML unless absolutely necessary

3. CSRF (Cross-Site Request Forgery):
   - Use SameSite=Strict on cookies
   - Implement CSRF tokens for state-changing operations
   - Install csurf middleware in NestJS:
     app.use(csurf({ cookie: { sameSite: 'strict' } }));

4. Authentication Vulnerabilities:
   - Implement account lockout after 5 failed login attempts
   - Require email verification before account activation
   - Use strong password requirements (min 8 chars, uppercase, number, symbol)
   - Implement password reset flow with time-limited tokens
   - Enable 2FA (optional enhancement)

TESTING:

1. Security Tests:
   - Test authentication bypass attempts
   - Test authorization violations (access other users' data)
   - Test input validation edge cases (very long strings, special chars)
   - Test rate limiting (automated requests)
   - Test SQL injection attempts
   - Use OWASP ZAP or Burp Suite for penetration testing

DELIVERABLES:
✓ All user inputs validated on frontend and backend
✓ Users cannot access other users' interviews
✓ Rate limiting prevents abuse on all endpoints
✓ Audit logs track all sensitive operations
✓ Security headers configured (Helmet)
✓ CORS restricted to approved origins
✓ SQL injection, XSS, CSRF protections in place
✓ Secrets stored securely (not in code)
✓ Failed login attempts logged and rate-limited
✓ Comprehensive security test suite

---

## Phase 5: Testing, Deployment & Documentation

### Objectives
- Write comprehensive test suite (unit, integration, E2E)
- Set up CI/CD pipeline with automated testing
- Deploy to cloud platform (AWS, Heroku, or Vercel)
- Create detailed API documentation with Swagger
- Write user-facing README and developer guide

### Implementation Prompt

You are preparing the application for production deployment with comprehensive testing and documentation.

TESTING STRATEGY:

1. Backend Testing (Jest + Supertest):
   - Unit Tests (services and utilities):
     * auth.service.spec.ts:
       - Test register() with valid/invalid emails
       - Test login() with correct/incorrect credentials
       - Test generateTokens() creates valid JWTs
     * interview.service.spec.ts:
       - Test generateInterview() creates correct number of questions
       - Test evaluateAnswer() returns valid scores
     * stt.service.spec.ts:
       - Mock Deepgram API responses
       - Test error handling and retries
   - Integration Tests (controllers and endpoints):
     * auth.controller.spec.ts:
       - POST /auth/register returns 201 with user data
       - POST /auth/login returns 200 with tokens
       - GET /auth/me requires authentication
     * interview.controller.spec.ts:
       - POST /interviews/start creates interview in DB
       - POST /interviews/:id/answer stores answer and returns evaluation
       - GET /interviews/:id returns interview only to owner
   - Test database interactions with in-memory SQLite or test DB
   - Mock external services (OpenAI, Deepgram) using jest.mock()
   - Target coverage: >80% for services, >70% overall

2. Frontend Testing (Vitest + React Testing Library):
   - Component Tests:
     * LoginPage.test.tsx:
       - Renders email and password inputs
       - Shows error on invalid credentials
       - Redirects to dashboard on successful login
     * InterviewVoice.test.tsx:
       - Displays current question
       - Shows live transcript updates
       - Handles microphone permission denied
   - Hook Tests:
     * useAudioRecorder.test.ts:
       - Mock MediaRecorder API
       - Test start/stop recording flow
       - Test permission handling
   - Integration Tests:
     * Test complete authentication flow
     * Test interview start to completion
   - Mock API calls using MSW (Mock Service Worker)

3. End-to-End Tests (Playwright or Cypress):
   - Test complete user journeys:
     * User Registration Flow:
       1. Navigate to /register
       2. Fill email and password
       3. Submit form
       4. Verify redirect to dashboard
     * Complete Interview Flow:
       1. Login as user
       2. Click "Start Interview"
       3. Configure interview settings
       4. Answer 3 questions via voice
       5. Verify post-interview report displays
     * Access Control Test:
       1. Login as User A
       2. Attempt to access User B's interview via URL manipulation
       3. Verify 403 Forbidden response
   - Run E2E tests in CI/CD pipeline before deployment
   - Use test user accounts with predictable data

CI/CD PIPELINE:

1. GitHub Actions Workflow (.github/workflows/ci.yml):
   name: CI/CD Pipeline
   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       services:
         postgres:
           image: postgres:15
           env:
             POSTGRES_PASSWORD: test
             POSTGRES_DB: interview_test
           options: >-
             --health-cmd pg_isready
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install dependencies
           run: |
             cd backend && npm ci
             cd ../frontend && npm ci
         - name: Run backend tests
           run: cd backend && npm test -- --coverage
           env:
             DATABASE_URL: postgres://postgres:test@localhost:5432/interview_test
         - name: Run frontend tests
           run: cd frontend && npm test -- --coverage
         - name: Upload coverage to Codecov
           uses: codecov/codecov-action@v3
     
     deploy:
       needs: test
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       steps:
         - name: Deploy to production
           run: echo "Deploy to Heroku/AWS/Vercel"

2. Deployment Configuration:
   - Option A: Heroku
     * Create heroku.yml for container deployment
     * Configure PostgreSQL add-on
     * Set environment variables in Heroku dashboard
     * Deploy: git push heroku main
   - Option B: AWS (EC2 + RDS)
     * Create VPC with public/private subnets
     * Deploy PostgreSQL on RDS
     * Deploy backend on EC2 with auto-scaling
     * Deploy frontend on S3 + CloudFront
     * Use AWS Secrets Manager for environment variables
   - Option C: Vercel (Frontend) + Railway (Backend)
     * Deploy Next.js frontend to Vercel
     * Deploy NestJS backend to Railway
     * Configure environment variables in each platform

3. Production Environment Setup:
   - Enable HTTPS with SSL certificate (Let's Encrypt or ACM)
   - Configure CDN for static assets (CloudFront or Vercel)
   - Set up database backups (daily snapshots)
   - Configure logging aggregation (CloudWatch or Papertrail)
   - Set up monitoring (New Relic, Datadog, or Sentry)
   - Enable error tracking with source maps

API DOCUMENTATION:

1. Swagger/OpenAPI Setup (NestJS):
   - Install @nestjs/swagger
   - Configure in main.ts:
     const config = new DocumentBuilder()
       .setTitle('Voice Interview API')
       .setDescription('AI-powered voice interview platform API')
       .setVersion('1.0')
       .addBearerAuth()
       .build();
     const document = SwaggerModule.createDocument(app, config);
     SwaggerModule.setup('api', app, document);
   - Add decorators to controllers:
     @ApiTags('authentication')
     @Controller('auth')
     export class AuthController {
       @Post('register')
       @ApiOperation({ summary: 'Register new user' })
       @ApiResponse({ status: 201, description: 'User created successfully' })
       @ApiResponse({ status: 409, description: 'Email already exists' })
       async register(@Body() dto: RegisterDto) { ... }
     }
   - Document all DTOs with @ApiProperty decorators
   - Add examples for request/response bodies
   - Access docs at http://localhost:3000/api

2. API Reference Documentation:
   - Create docs/API.md with:
     * Authentication endpoints
     * Interview endpoints
     * WebSocket events
     * Error codes and meanings
     * Rate limiting rules
   - Include curl examples for each endpoint
   - Document authentication flow with diagrams

README DOCUMENTATION:

1. Project README.md Structure:
   # Voice-Based AI Interview Agent
   
   AI-powered platform for conducting technical interviews through natural voice conversation.
   
   ## Features
   - 🎤 Real-time voice transcription with Deepgram
   - 🤖 AI-generated questions using OpenAI GPT-4
   - 📊 Automated answer evaluation and scoring
   - 🔒 Secure authentication with JWT
   - 📈 Detailed post-interview analytics
   
   ## Tech Stack
   - Frontend: React 18, Vite, TailwindCSS, Zustand
   - Backend: NestJS, TypeORM, PostgreSQL
   - AI: OpenAI GPT-4, Deepgram, OpenAI TTS
   - Deployment: [Heroku/AWS/Vercel]
   
   ## Prerequisites
   - Node.js 18+
   - PostgreSQL 15+
   - OpenAI API key
   - Deepgram API key
   
   ## Quick Start
   [Installation steps]
   
   ## Environment Variables
   [Complete list with descriptions]
   
   ## Development
   [How to run locally, testing, debugging]
   
   ## Deployment
   [Production deployment guide]
   
   ## API Documentation
   Access Swagger docs at /api endpoint
   
   ## Architecture
   [High-level system diagram]
   
   ## License
   MIT

2. Developer Guide (docs/DEVELOPMENT.md):
   - Project structure overview
   - Code organization conventions
   - Adding new features guide
   - Database migration workflow
   - Debugging tips
   - Common issues and solutions

3. User Guide (docs/USER_GUIDE.md):
   - How to create an account
   - Starting your first interview
   - Understanding your results
   - Tips for best voice quality
   - Troubleshooting microphone issues

VIDEO WALKTHROUGH:

1. Script Structure (3-5 minutes):
   - Introduction (30s):
     * Project overview and purpose
     * Tech stack highlights
   - Demo (2-3 min):
     * User registration and login
     * Starting an interview with custom settings
     * Answering questions via voice (show live transcript)
     * Reviewing post-interview report
   - Code Walkthrough (1-2 min):
     * Show project structure
     * Highlight key files (auth.service.ts, InterviewVoice.tsx)
     * Demonstrate WebSocket flow with developer tools
     * Show database schema
   - Closing (30s):
     * Challenges faced and solutions
     * Future enhancements
     * Thank you

2. Recording Tips:
   - Use Loom or OBS for screen recording
   - Test audio quality before recording
   - Use VS Code for code walkthrough (readable font size)
   - Demonstrate on clean test account
   - Keep pacing moderate (not too fast)
   - Upload to YouTube or Loom with public access

DELIVERABLES:
✓ Test coverage >80% on backend, >70% on frontend
✓ All tests pass in CI pipeline
✓ Application deployed to production URL
✓ Swagger documentation accessible at /api
✓ Comprehensive README with setup instructions
✓ API documentation with examples
✓ Developer guide for contributors
✓ 3-5 minute demo video uploaded
✓ No console errors or warnings in production
✓ Performance: page load <2s, API response <500ms

---

## Cross-Cutting Concerns & Best Practices

### Performance Optimization
- Implement database connection pooling (max 20 connections)
- Add Redis caching for frequently accessed data (question banks, user profiles)
- Use pagination for list endpoints (default 10 items per page)
- Compress API responses with gzip
- Optimize bundle size with code splitting (React.lazy)
- Use CDN for static assets
- Implement database query optimization (indexes, explain analyze)

### Monitoring & Observability
- Log all errors with stack traces (Winston)
- Track API response times (middleware)
- Monitor database query performance
- Set up uptime monitoring (UptimeRobot or Pingdom)
- Create health check endpoint: GET /health
- Implement metrics dashboard (Grafana or built-in)

### Scalability Considerations
- Design stateless backend (enables horizontal scaling)
- Use message queue for async tasks (Bull + Redis)
- Implement database read replicas for heavy read traffic
- Cache AI responses to reduce API costs
- Use WebSocket connection pooling
- Implement graceful shutdown for zero-downtime deployments

### Code Quality Standards
- ESLint + Prettier for consistent formatting
- Husky for pre-commit hooks (lint, format, test)
- Conventional commits (feat, fix, docs, refactor)
- Code review checklist in CONTRIBUTING.md
- SonarQube or CodeClimate for static analysis
- Dependency updates with Dependabot

---

## Success Metrics

**Technical Metrics:**
- Backend API response time: <500ms (p95)
- Frontend page load: <2s (p95)
- WebSocket latency: <200ms
- Test coverage: >80% backend, >70% frontend
- Zero critical security vulnerabilities
- 99.9% uptime (production)

**User Experience Metrics:**
- Interview completion rate: >85%
- Average interview duration: 15-20 minutes
- Voice recognition accuracy: >90%
- User satisfaction score: >4/5

**Business Metrics:**
- Cost per interview: <$0.50
- Active users: Track weekly/monthly
- Interview sessions per user: Average 2-3
- Time to complete assessment: <48 hours

---

## Phase Completion Checklists

Each phase should be considered complete when:

**Phase 0:**
- [ ] Docker Compose brings up all services without errors
- [ ] Database migrations run successfully
- [ ] TypeScript compiles with zero errors
- [ ] README includes complete setup instructions
- [ ] All team members can run project locally

**Phase 1:**
- [ ] Users can register with email/password
- [ ] JWT tokens generated and validated correctly
- [ ] Protected routes require authentication
- [ ] Login/logout flows work end-to-end
- [ ] Test coverage >80% for auth module

**Phase 2:**
- [ ] Voice recording works in Chrome, Firefox, Safari
- [ ] Live transcription displays in real-time (<500ms latency)
- [ ] TTS plays AI questions with clear audio
- [ ] Silence detection advances questions automatically
- [ ] WebSocket maintains stable connection

**Phase 3:**
- [ ] Questions generated based on job role and difficulty
- [ ] Answers evaluated with detailed feedback
- [ ] Difficulty adapts based on performance
- [ ] Post-interview report shows insights
- [ ] AI operations complete in <5s

**Phase 4:**
- [ ] Input validation prevents malformed data
- [ ] Users cannot access other users' interviews
- [ ] Rate limiting blocks excessive requests
- [ ] Security headers configured
- [ ] Audit logs track sensitive operations

**Phase 5:**
- [ ] All tests pass in CI pipeline
- [ ] Application deployed to production
- [ ] Swagger docs accessible
- [ ] README complete with examples
- [ ] Demo video recorded and uploaded

---

## Recommended Timeline

**Total Estimated Duration: 5-7 days (full-time equivalent)**

- **Day 1**: Phase 0 (Foundation & Architecture) - 6-8 hours
- **Day 2**: Phase 1 (Authentication) - 6-8 hours
- **Day 3**: Phase 2 (Voice Infrastructure) - 8-10 hours
- **Day 4**: Phase 3 (AI Interview Engine) - 8-10 hours
- **Day 5**: Phase 4 (Security & Validation) - 6-8 hours
- **Day 6**: Phase 5 (Testing & Documentation) - 6-8 hours
- **Day 7**: Buffer for refinements and video recording - 4-6 hours

**Note:** Adjust timeline based on your experience level and available time per day.

---

## Final Notes

This implementation guide prioritizes:
1. **Security First**: Authentication, validation, and access control are non-negotiable
2. **User Experience**: Real-time voice interaction must feel natural and responsive
3. **AI Quality**: Questions and evaluations should be contextually relevant and fair
4. **Production Readiness**: Code should be deployable and maintainable
5. **Documentation**: Clear guides for developers and users

Remember to:
- Commit code frequently with meaningful messages
- Test each feature before moving to the next phase
- Ask for help when stuck (documentation, Stack Overflow, communities)
- Prioritize working features over perfect code
- Keep the scope focused on core requirements

**Good luck building your voice-based AI interview agent!**



Based on the project requirements and current codebase, I'll create ultra-comprehensive implementation prompts for each phase. The project appears to be a voice-based AI interview agent with React frontend, NestJS backend, and PostgreSQL database.

***

# Voice-Based AI Interview Agent - Ultra-Comprehensive Implementation Prompts

## Phase 1: Foundation & Infrastructure Setup

### Prompt for Phase 1

```
CONTEXT: Building the foundational infrastructure for a voice-first AI interview platform with real-time communication, secure authentication, and scalable data persistence.

OBJECTIVE: Establish the complete project infrastructure including database schema, authentication system, base API structure, and core configurations.

TECHNICAL REQUIREMENTS:

1. DATABASE SCHEMA DESIGN (PostgreSQL):
- Create a users table with fields: id (UUID primary key), email (unique, indexed), password_hash, created_at, updated_at, last_login
- Create an interview_sessions table: id (UUID), user_id (FK), status (enum: in_progress, completed, abandoned), started_at, completed_at, total_duration_seconds, overall_score
- Create an interview_questions table: id (UUID), session_id (FK), question_text, question_category (enum: algorithms, system_design, behavioral), difficulty_level (1-5), asked_at, sequence_order
- Create an interview_responses table: id (UUID), question_id (FK), transcript_text, audio_duration_seconds, evaluation_score (0-100), evaluation_feedback (text), ai_follow_up_generated (boolean), responded_at
- Create an audio_recordings table: id (UUID), response_id (FK), storage_path, file_size_bytes, format (enum: webm, mp3, wav), uploaded_at
- Add appropriate indexes on foreign keys, user_id lookups, and session status queries
- Implement soft delete pattern with deleted_at timestamp columns where needed

2. BACKEND ARCHITECTURE (NestJS):
- Initialize NestJS project with TypeScript strict mode enabled
- Configure TypeORM with PostgreSQL connection using environment variables
- Implement modular structure: auth/, users/, interviews/, questions/, responses/, audio/
- Set up ConfigModule with validation for required environment variables: DATABASE_URL, JWT_SECRET, JWT_EXPIRATION, CORS_ORIGIN, OPENAI_API_KEY, DEEPGRAM_API_KEY
- Create base entity class with common fields (id, created_at, updated_at)
- Implement global exception filter for consistent error responses
- Set up Winston logger with different log levels per environment
- Configure class-validator and class-transformer globally
- Implement request correlation IDs for distributed tracing

3. AUTHENTICATION MODULE:
- Create AuthModule with JWT strategy using passport-jwt
- Implement AuthService with methods: register(email, password), login(email, password), validateUser(email, password), refreshToken(token)
- Use bcrypt for password hashing with salt rounds of 12
- Generate JWT tokens with payload: { sub: userId, email, iat, exp }
- Create JwtAuthGuard extending AuthGuard('jwt') for route protection
- Implement refresh token rotation strategy with Redis or database storage
- Add rate limiting on auth endpoints: 5 attempts per 15 minutes per IP
- Create DTOs: RegisterDto (email, password with min 8 chars, uppercase, number requirements), LoginDto, RefreshTokenDto
- Return tokens in HTTP-only cookies with secure flag in production
- Implement email validation format checking
- Add custom decorator @CurrentUser() for extracting user from request

4. FRONTEND FOUNDATION (React):
- Initialize Create React App with TypeScript template
- Set up project structure: src/components/, src/hooks/, src/services/, src/contexts/, src/types/, src/utils/
- Install dependencies: axios, react-router-dom, @tanstack/react-query, zustand, tailwindcss, react-hot-toast
- Configure Tailwind CSS with custom theme colors for interview states
- Create AuthContext with useAuth hook providing: user, login(email, password), logout(), register(email, password), isAuthenticated, isLoading
- Implement axios interceptor for JWT token injection and 401 refresh flow
- Create ProtectedRoute component checking authentication status
- Set up React Query with default configurations: staleTime 5 minutes, cacheTime 10 minutes, retry 1
- Create type definitions: User, InterviewSession, Question, Response interfaces matching backend DTOs
- Implement environment variable management with REACT_APP_ prefix
- Create base API service class with error handling

5. CORS & SECURITY CONFIGURATION:
- Configure CORS in NestJS with whitelist of allowed origins from environment
- Enable helmet middleware for security headers
- Implement CSRF protection for state-changing operations
- Add Content Security Policy headers
- Configure rate limiting at application level: 100 requests per 15 minutes per user
- Set up input sanitization middleware
- Enable strict transport security headers in production

6. DEVELOPMENT ENVIRONMENT:
- Create docker-compose.yml with PostgreSQL, Redis (for caching), and pgAdmin services
- Set up .env.example files for both frontend and backend with all required variables
- Configure ESLint and Prettier with consistent rules across frontend and backend
- Set up pre-commit hooks with husky for linting and formatting
- Create npm scripts: dev (parallel frontend/backend), test, lint, format, migrate, seed
- Initialize migration system with TypeORM CLI
- Create seed script with sample users for testing

7. API DOCUMENTATION:
- Install and configure Swagger/OpenAPI in NestJS with @nestjs/swagger
- Add ApiTags, ApiOperation, ApiResponse decorators to all controllers
- Document all DTOs with ApiProperty decorators including examples
- Create API documentation accessible at /api/docs
- Include authentication flows and example requests/responses

DELIVERABLES:
1. Fully configured NestJS backend with working database connections
2. React frontend with routing and authentication UI (login/register pages)
3. Working authentication flow: register → login → protected route access
4. Database migrations creating all tables with proper relationships
5. Comprehensive README.md with setup instructions, environment variables documentation, and architecture diagrams
6. Postman/Insomnia collection with all auth endpoints
7. Unit tests for auth service with >80% coverage
8. Docker compose setup for local development

SUCCESS CRITERIA:
- User can register with email/password validation
- User can login and receive JWT token
- Protected routes redirect unauthenticated users to login
- Database schema supports all required interview data
- API documentation is accessible and comprehensive
- All environment variables are documented
- Docker setup works on fresh clone with docker-compose up
```

***

## Phase 2: AI Integration & Voice Pipeline

### Prompt for Phase 2

```
CONTEXT: Implementing the core AI capabilities for conducting technical interviews, including speech-to-text, text-to-speech, question generation, and response evaluation.

OBJECTIVE: Create a fully functional AI-powered interview engine with real-time voice processing and intelligent question-answer flow.

TECHNICAL REQUIREMENTS:

1. SPEECH-TO-TEXT INTEGRATION (Deepgram/Whisper):
- Create SpeechToTextService with method: transcribe(audioBuffer: Buffer, config: TranscriptionConfig): Promise<TranscriptionResult>
- Support multiple audio formats: webm, mp3, wav
- Implement real-time streaming transcription using WebSocket connection
- Configure language model for technical terminology recognition
- Add custom vocabulary for programming terms, frameworks, algorithms
- Handle partial results for live transcript updates
- Implement error handling and automatic retry with exponential backoff
- Add confidence score threshold filtering (minimum 0.7)
- Support speaker diarization if multiple people detected
- Create TranscriptionResult DTO: { text: string, confidence: number, duration: number, words: WordTimestamp[] }

2. TEXT-TO-SPEECH INTEGRATION (OpenAI/ElevenLabs/Google Cloud TTS):
- Create TextToSpeechService with method: synthesize(text: string, options: VoiceOptions): Promise<AudioBuffer>
- Support voice customization: speed (0.75-1.5), pitch (-20 to +20), voice_id
- Implement audio format conversion and compression
- Add caching layer for repeated questions to reduce API calls
- Stream audio chunks for faster playback start
- Create VoiceOptions DTO with validation
- Implement fallback to alternative TTS provider on failure
- Support SSML markup for natural pauses and emphasis
- Return audio as base64 or streaming response based on client preference

3. INTERVIEW QUESTION GENERATION (OpenAI GPT-4):
- Create QuestionGenerationService with methods:
  - generateInitialQuestion(category: string, difficulty: number, context: InterviewContext): Promise<Question>
  - generateFollowUpQuestion(previousQ: Question, response: Response, sessionContext: InterviewSession): Promise<Question>
  - generateSessionPlan(userProfile: UserProfile, interviewType: string): Promise<QuestionPlan>
- Implement prompt engineering with clear instructions for technical accuracy
- Structure prompts to generate questions with: question_text, category, difficulty, expected_key_points[], evaluation_rubric
- Create question bank with categories: data_structures, algorithms, system_design, behavioral, coding, debugging
- Implement difficulty progression algorithm based on user performance
- Add context awareness: reference previous questions and answers
- Validate generated questions for clarity and technical accuracy
- Implement temperature settings: 0.7 for creativity with consistency
- Add max_tokens limit: 500 for questions, 1500 for system design scenarios
- Store generated questions in database with metadata

4. RESPONSE EVALUATION (OpenAI GPT-4):
- Create EvaluationService with method: evaluateResponse(question: Question, response: Response, context: EvaluationContext): Promise<Evaluation>
- Design evaluation prompt with criteria:
  - Technical accuracy (0-40 points)
  - Completeness (0-20 points)
  - Communication clarity (0-20 points)
  - Problem-solving approach (0-20 points)
- Return structured evaluation: { score: number, strengths: string[], weaknesses: string[], feedback: string, key_points_covered: string[], follow_up_needed: boolean }
- Implement comparative evaluation against ideal answers
- Add code execution validation for coding questions
- Support partial credit for partially correct answers
- Generate constructive feedback with specific examples
- Create aggregated session scoring algorithm
- Store evaluations with reasoning for review

5. SILENCE DETECTION & AUTO-PROGRESSION:
- Create SilenceDetectionService monitoring audio input levels
- Implement configurable silence threshold: -50dB default
- Set silence duration trigger: 3 seconds of continuous silence
- Create state machine for interview flow: listening → processing → speaking → listening
- Implement debouncing to avoid false triggers from brief pauses
- Add visual indicators for audio level on frontend
- Create warning system: notify user after 2 seconds of silence before auto-advancing
- Allow manual override for auto-progression
- Store timing metadata: response_duration, silence_duration, total_time

6. INTERVIEW SESSION MANAGEMENT:
- Create InterviewSessionService with methods:
  - startSession(userId: string, config: SessionConfig): Promise<InterviewSession>
  - getNextQuestion(sessionId: string): Promise<Question>
  - submitResponse(sessionId: string, response: ResponseData): Promise<Evaluation>
  - completeSession(sessionId: string): Promise<SessionSummary>
  - getSessionHistory(userId: string, pagination: PaginationDto): Promise<SessionList>
- Implement session state machine: initialized → in_progress → awaiting_response → evaluating → completed
- Add session timeout: 60 minutes maximum, 5 minutes of inactivity warning
- Create session recovery mechanism for disconnections
- Implement real-time session updates using WebSocket
- Generate session summary with aggregated scores and insights
- Store session configuration: question_count, categories, difficulty_range, time_limit

7. REAL-TIME AUDIO STREAMING (WebSocket):
- Create AudioGateway using @nestjs/websockets
- Implement WebSocket events:
  - 'audio:start' - Initialize audio stream
  - 'audio:chunk' - Receive audio data chunks
  - 'audio:end' - Finalize transcription
  - 'transcript:partial' - Send intermediate results
  - 'transcript:final' - Send complete transcription
  - 'question:speak' - Stream TTS audio to client
- Use binary frames for audio data transmission
- Implement buffering strategy for stable streaming
- Add connection heartbeat and automatic reconnection
- Implement room-based channels per interview session
- Add authentication middleware for WebSocket connections
- Handle backpressure and flow control

8. FRONTEND VOICE INTERFACE:
- Create useVoiceRecording hook with:
  - startRecording(), stopRecording(), pauseRecording()
  - audioLevel (0-100), isRecording, recordingDuration
  - audioBlob on stop, error handling
- Implement MediaRecorder API with AudioContext
- Create visual waveform component showing real-time audio levels
- Display live transcript with word-by-word highlighting
- Implement audio player for TTS question playback
- Add controls: play/pause, speed adjustment, replay
- Create volume meter component
- Handle microphone permissions and errors gracefully
- Implement noise reduction using Web Audio API
- Add push-to-talk and auto-detection modes

9. INTERVIEW FLOW ORCHESTRATION:
- Create InterviewOrchestrator service coordinating all AI services
- Implement flow: load_question → speak_question → wait_for_response → transcribe → evaluate → generate_next
- Add configurable delays between stages
- Implement error recovery at each stage
- Create fallback mechanisms for API failures
- Add logging for each stage transition
- Implement retry logic with circuit breaker pattern
- Store timing data for performance monitoring
- Support manual intervention by user (skip, repeat, end early)

DELIVERABLES:
1. Working speech-to-text with live transcription display
2. Text-to-speech system playing generated questions
3. AI question generation creating relevant technical questions
4. AI evaluation providing scored feedback on responses
5. Silence detection triggering automatic progression
6. Complete WebSocket-based audio streaming pipeline
7. Frontend voice interface with recording controls
8. Interview session management with state persistence
9. Integration tests covering full interview flow
10. Performance benchmarks for AI service response times

SUCCESS CRITERIA:
- Audio transcription accuracy >90% for clear speech
- TTS audio plays within 2 seconds of generation
- Questions are contextually relevant and technically accurate
- Evaluation provides actionable feedback with specific examples
- Silence detection triggers within 0.5 seconds of threshold
- WebSocket maintains stable connection during 30-minute sessions
- Frontend shows real-time transcript updates with <500ms latency
- Complete interview session generates comprehensive summary
- System handles API failures gracefully with user feedback
```

***

## Phase 3: User Experience & Interview Interface

### Prompt for Phase 3

```
CONTEXT: Building the complete user-facing interview experience with intuitive controls, real-time feedback, and comprehensive session management.

OBJECTIVE: Create a polished, accessible interview interface that guides users through technical interviews with clear visual feedback and smooth interactions.

TECHNICAL REQUIREMENTS:

1. INTERVIEW DASHBOARD:
- Create InterviewDashboard component displaying:
  - User statistics: total_sessions, average_score, completion_rate, recent_activity
  - Quick start options: category selection, difficulty preference, time limit
  - Recent interview history with scores and dates
  - Performance trends chart showing score progression
  - Achievement badges for milestones (10 sessions, 90%+ score, etc.)
- Implement filter and sort controls for history
- Add data visualization using recharts or chart.js
- Create responsive grid layout for statistics cards
- Implement skeleton loading states
- Add empty states with encouraging CTAs
- Support dark mode with system preference detection

2. INTERVIEW SETUP FLOW:
- Create InterviewSetupWizard with multi-step form:
  - Step 1: Select categories (checkboxes with icons and descriptions)
  - Step 2: Choose difficulty (slider 1-5 with labels)
  - Step 3: Set preferences (question count, time limit, audio settings)
  - Step 4: Review and start
- Implement form validation with clear error messages
- Add progress indicator showing current step
- Store draft preferences in localStorage
- Create preset configurations: "Quick Interview (5 questions)", "Full Interview (15 questions)", "Custom"
- Add tooltip help text for each option
- Implement keyboard navigation (tab, arrow keys, enter to submit)
- Create confirmation modal before starting

3. ACTIVE INTERVIEW INTERFACE:
- Create InterviewSession component with layout:
  - Top: progress bar (X/N questions), timer, exit button
  - Center: current question text (large, readable font)
  - Middle: live transcript area (auto-scrolling, word highlighting)
  - Bottom: audio waveform, recording controls, status indicators
  - Side panel (collapsible): previous questions and responses summary
- Implement responsive design for desktop, tablet, mobile
- Add accessibility features: ARIA labels, keyboard shortcuts, screen reader support
- Create visual states for: listening, processing, speaking, paused, error
- Implement smooth transitions between questions
- Add haptic feedback on mobile devices
- Create modal for ending interview early with confirmation
- Display connection status indicator

4. AUDIO RECORDING CONTROLS:
- Create VoiceControlPanel component with:
  - Large record/stop button with pulsing animation when active
  - Audio level meter with dynamic color (green→yellow→red)
  - Recording duration timer
  - Mode toggle: auto-detect silence vs. manual stop
  - Sensitivity slider for silence detection threshold
  - Volume control for TTS playback
  - Microphone selection dropdown (if multiple available)
  - Test microphone button with audio feedback
- Implement visual feedback for mic permissions
- Add error states with troubleshooting tips
- Create tutorial overlay for first-time users
- Implement push-to-talk with spacebar hotkey
- Add mute/unmute toggle for breaks

5. LIVE TRANSCRIPT DISPLAY:
- Create TranscriptViewer component showing:
  - Real-time word-by-word transcript updates
  - Confidence indicators (color-coded words)
  - Timestamp markers every 30 seconds
  - Edit capability for corrections after submission
  - Search functionality for reviewing past answers
  - Copy to clipboard button
  - Font size adjustment controls
- Implement auto-scroll with manual override
- Highlight current speaking segment
- Show partial results in lighter text
- Add collapsible history of previous answers
- Implement smooth animations for text appearance
- Support RTL languages if needed

6. QUESTION DISPLAY & TTS PLAYBACK:
- Create QuestionDisplay component with:
  - Large, clear question text with syntax highlighting for code
  - Audio playback controls (play, pause, replay, speed)
  - Waveform visualization during playback
  - Read-aloud animation (pulsing text sync)
  - Option to read question text silently first
  - Expand/collapse for long system design questions
  - Image/diagram support for visual questions
- Implement pre-loading for next question
- Add keyboard shortcuts: R to replay, Enter to start answer
- Create visual indicator when TTS is speaking
- Support markdown formatting in questions

7. REAL-TIME FEEDBACK INDICATORS:
- Create FeedbackSystem with indicators for:
  - Audio quality (good, fair, poor with icons)
  - Connection stability (latency display)
  - Processing status (transcribing, evaluating with spinners)
  - Silence detection countdown (visual timer)
  - Error notifications (toast messages with retry actions)
  - Success confirmations (answer submitted, evaluation received)
- Implement non-intrusive notification system
- Use color psychology: green (success), yellow (warning), red (error), blue (info)
- Add sound effects toggle for audio feedback
- Create animation library for state transitions
- Implement progressive disclosure for detailed errors

8. SESSION COMPLETION FLOW:
- Create SessionSummary component displaying:
  - Overall score with large animated number
  - Performance breakdown by category
  - Individual question results (expandable list)
  - Detailed feedback for each answer
  - Strengths and areas for improvement
  - Time statistics (total duration, average per question)
  - Comparison to previous sessions
  - Recommended next steps
  - Share results option (generate shareable link)
  - Download PDF report button
- Implement confetti animation for high scores (>80%)
- Add ability to review full transcript
- Create action buttons: Start New Interview, View Dashboard, Share
- Implement social sharing with Open Graph meta tags

9. INTERVIEW REVIEW & HISTORY:
- Create SessionHistoryList component with:
  - Card view showing: date, duration, score, categories, thumbnail
  - Filtering by: date range, category, score range, completion status
  - Sorting by: date, score, duration
  - Search by question keywords
  - Pagination or infinite scroll
  - Bulk actions: delete selected, export data
- Create SessionDetailView for reviewing individual sessions:
  - Full transcript with timestamps
  - Question-by-question breakdown
  - Audio playback of recordings (if stored)
  - Evaluation feedback with inline comments
  - Compare with ideal answer option
  - Export individual session data
- Implement caching for quick navigation
- Add print-friendly view
- Support data export as JSON, CSV, PDF

10. ERROR HANDLING & EDGE CASES:
- Create comprehensive error boundaries for React components
- Implement error recovery flows:
  - Microphone access denied → troubleshooting guide
  - Network disconnection → auto-reconnect with session resume
  - API timeout → retry with exponential backoff, show progress
  - Browser incompatibility → feature detection with fallbacks
  - Audio processing failure → option to type response instead
- Add error logging to backend for debugging
- Create user-friendly error messages with actionable steps
- Implement offline detection with queue system
- Add session recovery from localStorage for page refreshes
- Create debug mode toggle for advanced users

11. ACCESSIBILITY & INCLUSIVITY:
- Implement WCAG 2.1 AA compliance:
  - Color contrast ratios >4.5:1 for normal text
  - Focus indicators on all interactive elements
  - ARIA labels and roles throughout
  - Semantic HTML structure
  - Alt text for all images and icons
- Add keyboard navigation for all features
- Support screen readers with meaningful announcements
- Implement high contrast mode toggle
- Add text-to-speech for all text content option
- Support reduced motion preferences
- Ensure touch targets are minimum 44x44px
- Add skip navigation links

12. PERFORMANCE OPTIMIZATION:
- Implement code splitting for faster initial load
- Use React.memo for expensive components
- Implement virtualization for long lists
- Add service worker for offline capability
- Optimize images and assets
- Use lazy loading for below-fold content
- Implement prefetching for predicted user actions
- Add performance monitoring with Web Vitals
- Optimize bundle size (target <500KB initial JS)
- Implement compression and minification

DELIVERABLES:
1. Complete interview dashboard with statistics and history
2. Multi-step interview setup wizard with validation
3. Real-time interview interface with all controls
4. Audio recording panel with visual feedback
5. Live transcript display with highlighting
6. Question display with TTS playback controls
7. Real-time feedback indicators and notifications
8. Session summary with detailed results
9. Interview history and review system
10. Comprehensive error handling throughout
11. Accessibility features meeting WCAG 2.1 AA
12. Responsive design working on all device sizes
13. User documentation and in-app help
14. Storybook with all component variants

SUCCESS CRITERIA:
- Interview can be completed entirely via keyboard
- Screen readers can navigate all features
- Page load time <3 seconds on 3G connection
- Interview session maintains state across page refreshes
- Error messages provide clear resolution paths
- UI responds within 100ms to user interactions
- All interactive elements have visible focus states
- Components render correctly on mobile, tablet, desktop
- Session history loads 50+ sessions without lag
- Real-time features update with <500ms latency
```

***

## Phase 4: Security, Testing & Production Readiness

### Prompt for Phase 4

```
CONTEXT: Hardening the application for production deployment with comprehensive security measures, automated testing, monitoring, and deployment infrastructure.

OBJECTIVE: Create a production-ready system with enterprise-grade security, comprehensive test coverage, observability, and scalable deployment infrastructure.

TECHNICAL REQUIREMENTS:

1. SECURITY HARDENING:
- Implement rate limiting per endpoint:
  - Auth endpoints: 5 requests/15 minutes per IP
  - Interview start: 3 requests/hour per user
  - Question generation: 20 requests/hour per session
  - General API: 100 requests/15 minutes per user
- Add Redis-based rate limiter with sliding window
- Implement CSRF protection using csurf or custom tokens
- Add helmet middleware with strict CSP rules:
  - default-src 'self'
  - script-src 'self' 'unsafe-inline' (only for specific needs)
  - style-src 'self' 'unsafe-inline'
  - img-src 'self' data: https:
  - connect-src 'self' wss://
- Implement SQL injection prevention with parameterized queries (TypeORM default)
- Add XSS protection with DOMPurify on frontend
- Implement secure session management:
  - HTTP-only cookies for tokens
  - Secure flag in production
  - SameSite=Strict for CSRF protection
  - Token rotation on refresh
- Add input validation on all endpoints with class-validator
- Implement file upload validation (if storing audio):
  - File type whitelist (audio/* only)
  - Size limit (50MB max)
  - Malware scanning with ClamAV or similar
  - Unique filename generation
- Encrypt sensitive data at rest:
  - PII fields with AES-256
  - Store encryption keys in AWS KMS or HashiCorp Vault
- Implement audit logging for sensitive operations:
  - User registration/login/logout
  - Interview session start/completion
  - Data access and modifications
- Add RBAC system if multiple user types needed
- Implement security headers:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security: max-age=31536000

2. AUTHENTICATION ENHANCEMENTS:
- Implement password strength requirements:
  - Minimum 8 characters, maximum 128
  - At least 1 uppercase, 1 lowercase, 1 number, 1 special char
  - Check against common password list (haveibeenpwned API)
- Add account lockout after 5 failed attempts
- Implement password reset flow:
  - Generate secure token with crypto.randomBytes
  - Store hashed token with 1-hour expiration
  - Send reset email with link
  - Validate token and update password
- Add email verification on registration:
  - Send verification email with unique token
  - Mark account as unverified until confirmed
  - Resend verification option
- Implement 2FA option (TOTP-based):
  - Generate QR code with speakeasy
  - Store encrypted secret
  - Validate TOTP codes on login
  - Provide backup codes
- Add session management:
  - Track active sessions per user
  - Allow users to revoke sessions
  - Automatic session cleanup
- Implement OAuth integration (Google, GitHub) as alternative login

3. DATA PRIVACY & COMPLIANCE:
- Implement GDPR compliance features:
  - Data export functionality (JSON format)
  - Account deletion with data purge
  - Privacy policy acceptance tracking
  - Cookie consent banner
  - Data processing agreements
- Add data retention policies:
  - Audio recordings deleted after 90 days
  - Session data archived after 1 year
  - Automated cleanup jobs
- Implement data anonymization for analytics
- Add user data access logs
- Create privacy-focused analytics (no PII tracking)
- Implement right to be forgotten functionality
- Add data encryption in transit (HTTPS only, TLS 1.3)

4. COMPREHENSIVE TESTING:
Backend Testing:
- Unit tests for all services (Jest):
  - AuthService: registration, login, token validation
  - QuestionGenerationService: mocked OpenAI responses
  - EvaluationService: scoring logic
  - InterviewSessionService: state management
  - Target: >80% code coverage
- Integration tests:
  - API endpoint testing with supertest
  - Database operations with test database
  - WebSocket connection flows
  - Authentication flows end-to-end
- E2E tests (Jest + Supertest):
  - Complete interview flow from start to finish
  - User registration to interview completion
  - Error scenarios and recovery

Frontend Testing:
- Unit tests (Jest + React Testing Library):
  - Custom hooks (useVoiceRecording, useAuth)
  - Utility functions
  - Component logic
  - Target: >75% coverage
- Component tests:
  - User interactions (clicks, input changes)
  - Conditional rendering
  - Props handling
  - Error boundaries
- Integration tests:
  - Form submissions
  - API integration with mocked responses
  - Routing and navigation
- E2E tests (Playwright or Cypress):
  - Complete user journeys
  - Registration → Login → Interview → Results
  - Audio recording and playback
  - Cross-browser testing (Chrome, Firefox, Safari)
  - Mobile responsiveness testing

Performance Testing:
- Load testing with k6 or Artillery:
  - Concurrent user simulation (100+ users)
  - WebSocket connection stress testing
  - API endpoint performance benchmarks
  - Database query optimization validation
- Stress testing to find breaking points
- Endurance testing for memory leaks
- Spike testing for traffic surges

5. MONITORING & OBSERVABILITY:
- Implement structured logging:
  - Use Winston with JSON format
  - Log levels: error, warn, info, debug
  - Include correlation IDs in all logs
  - Separate log streams for errors
- Set up Application Performance Monitoring (APM):
  - Integrate Datadog, New Relic, or Sentry
  - Track API response times
  - Monitor database query performance
  - Track error rates and types
  - Set up alerting thresholds
- Implement health check endpoints:
  - /health/live - basic liveness check
  - /health/ready - database and dependencies check
  - /metrics - Prometheus-compatible metrics
- Add custom metrics:
  - Interview completion rate
  - Average session duration
  - AI API response times
  - Audio processing latency
  - User engagement metrics
- Set up distributed tracing:
  - OpenTelemetry or Zipkin
  - Trace requests across services
  - Identify bottlenecks
- Create dashboards in Grafana or similar:
  - System health overview
  - User activity metrics
  - Error rate trends
  - API performance charts
- Implement alerting rules:
  - Error rate >1% in 5 minutes
  - API latency >2 seconds p95
  - Database connection failures
  - Disk space <20%
  - Memory usage >80%

6. ERROR HANDLING & RESILIENCE:
- Implement global exception filter in NestJS:
  - Catch all errors with consistent response format
  - Log errors with stack traces
  - Return user-friendly messages
  - Include request ID for support
- Add circuit breaker pattern for AI APIs:
  - Use opossum or similar library
  - Trip after 5 consecutive failures
  - Half-open state after 30 seconds
  - Fallback responses when open
- Implement retry logic with exponential backoff:
  - Transient errors: retry up to 3 times
  - Initial delay: 1 second
  - Backoff multiplier: 2
  - Max delay: 10 seconds
- Add graceful degradation:
  - Fallback to cached questions if generation fails
  - Allow typed responses if audio fails
  - Basic evaluation if AI unavailable
- Implement request timeout handling:
  - API requests: 30 second timeout
  - WebSocket operations: 5 second timeout
  - Database queries: 10 second timeout
- Add database connection pooling:
  - Min connections: 2
  - Max connections: 10
  - Connection timeout: 30 seconds
  - Idle timeout: 10 minutes

7. DEPLOYMENT INFRASTRUCTURE:
Docker Configuration:
- Create optimized Dockerfile for backend:
  - Multi-stage build
  - Base image: node:18-alpine
  - Only copy necessary files
  - Run as non-root user
  - Health check command
- Create Dockerfile for frontend:
  - Build stage with npm run build
  - Nginx stage for serving static files
  - Custom nginx.conf for SPA routing
- Create docker-compose for local development
- Create docker-compose for production with:
  - Backend service with replicas
  - Frontend service with nginx
  - PostgreSQL with persistent volume
  - Redis for caching
  - Reverse proxy (Traefik or nginx)

CI/CD Pipeline (GitHub Actions or GitLab CI):
- Create pipeline stages:
  - Lint: ESLint and Prettier checks
  - Test: Run all test suites
  - Build: Docker image build
  - Security Scan: Snyk or Trivy
  - Deploy: Push to registry and deploy
- Implement separate pipelines for:
  - Pull requests: lint + test only
  - Main branch: full pipeline with staging deploy
  - Tags: production deployment
- Add automated database migrations
- Implement blue-green deployment strategy
- Add rollback capability
- Create deployment notifications (Slack, email)

Infrastructure as Code:
- Create Terraform or CloudFormation templates:
  - VPC with public and private subnets
  - RDS PostgreSQL instance
  - ECS or EKS cluster for containers
  - Application Load Balancer
  - CloudFront for frontend CDN
  - S3 bucket for audio storage
  - Redis ElastiCache cluster
  - IAM roles and security groups
  - Route53 DNS configuration
- Implement separate environments: dev, staging, prod
- Use environment-specific variable files
- Add automated infrastructure testing

Kubernetes Deployment (Alternative):
- Create Kubernetes manifests:
  - Deployment for backend (3 replicas)
  - Deployment for frontend (2 replicas)
  - StatefulSet for PostgreSQL (if not using managed)
  - Service definitions
  - Ingress for routing
  - ConfigMaps for configuration
  - Secrets for sensitive data
  - HorizontalPodAutoscaler for scaling
  - PersistentVolumeClaims for storage
- Implement Helm charts for templating
- Set up cert-manager for SSL certificates
- Configure pod resource limits and requests

8. BACKUP & DISASTER RECOVERY:
- Implement automated database backups:
  - Full backup daily at 2 AM
  - Incremental backups every 6 hours
  - Retain backups for 30 days
  - Store in S3 with versioning
  - Encrypt backups at rest
- Create backup restoration procedure:
  - Document step-by-step process
  - Test restoration monthly
  - Automated restoration scripts
  - RTO target: 4 hours
  - RPO target: 6 hours
- Implement point-in-time recovery
- Add database replication for high availability:
  - Primary-replica setup
  - Automatic failover
  - Read replicas for scaling
- Create disaster recovery runbook

9. DOCUMENTATION:
- Create comprehensive README.md:
  - Project overview and features
  - Architecture diagram
  - Technology stack details
  - Prerequisites
  - Installation instructions
  - Configuration guide
  - Development workflow
  - Testing instructions
  - Deployment process
  - Troubleshooting guide
- Write API documentation:
  - OpenAPI/Swagger spec
  - Authentication flow
  - Endpoint descriptions
  - Request/response examples
  - Error codes and meanings
- Create developer guide:
  - Code structure explanation
  - Coding conventions
  - Git workflow
  - Pull request process
  - Testing guidelines
- Write user documentation:
  - Feature tutorials
  - FAQ section
  - Troubleshooting common issues
- Create operational runbooks:
  - Deployment procedures
  - Monitoring and alerting
  - Incident response
  - Backup and recovery
  - Scaling procedures
- Add inline code documentation:
  - JSDoc for functions
  - Complex logic explanations
  - TODO and FIXME notes

10. PERFORMANCE OPTIMIZATION:
Backend:
- Implement database query optimization:
  - Add indexes on frequently queried columns
  - Use query explain plans
  - Implement query result caching
  - Optimize N+1 queries with eager loading
- Add Redis caching:
  - Cache user sessions
  - Cache frequently accessed data
  - Cache AI responses for common questions
  - Set appropriate TTLs
- Implement API response compression (gzip)
- Add database connection pooling tuning
- Optimize large payload handling
- Implement lazy loading for associations

Frontend:
- Optimize bundle size:
  - Code splitting by route
  - Dynamic imports for heavy libraries
  - Tree shaking
  - Remove unused dependencies
- Implement asset optimization:
  - Image compression and WebP format
  - SVG optimization
  - Font subsetting
  - Lazy loading images
- Add service worker for caching:
  - Cache static assets
  - Offline fallback
  - Background sync
- Optimize React rendering:
  - useMemo for expensive calculations
  - useCallback for function props
  - React.memo for pure components
  - Virtualization for long lists
- Implement prefetching for predicted routes
- Add resource hints (preconnect, prefetch)

DELIVERABLES:
1. Comprehensive security implementation with rate limiting, CSRF, CSP, encryption
2. Complete test suites (unit, integration, E2E) with >80% coverage for backend, >75% for frontend
3. Monitoring and observability setup with dashboards and alerts
4. Production-ready Docker containers and docker-compose files
5. Complete CI/CD pipeline with automated testing and deployment
6. Infrastructure as Code templates for cloud deployment
7. Backup and disaster recovery system with documentation
8. Comprehensive documentation (README, API docs, runbooks)
9. Performance optimization implementation
10. Security audit report
11. Load testing results and optimization recommendations
12. Deployment checklist and production readiness review

SUCCESS CRITERIA:
- Security audit passes with no critical vulnerabilities
- Test coverage meets thresholds (>80% backend, >75% frontend)
- E2E tests pass on all target browsers
- Load testing handles 100 concurrent users without degradation
- API p95 response time <2 seconds
- Frontend page load time <3 seconds on 3G
- Zero critical bugs in production deployment
- Monitoring captures all errors with alerting
- Automated backups complete successfully daily
- Documentation is complete and accessible
- CI/CD pipeline deploys successfully to staging and production
- Application passes OWASP Top 10 security checks
```

***

## Phase 5: Enhancement & Polish

### Prompt for Phase 5

```
CONTEXT: Adding advanced features, optimizations, and polish to create a market-ready product that exceeds expectations and demonstrates technical excellence.

OBJECTIVE: Implement innovative features, create an exceptional user experience, and add differentiating capabilities that showcase creativity and technical depth.

TECHNICAL REQUIREMENTS:

1. ADVANCED AI FEATURES:
- Implement adaptive difficulty system:
  - Track user performance across sessions
  - Calculate skill level using Elo-like rating system
  - Adjust question difficulty dynamically (±1 level based on last 3 answers)
  - Create smooth progression curve avoiding frustration
  - Store difficulty history per category
- Add interview coaching mode:
  - Real-time hints during answers (optional)
  - Post-interview improvement suggestions
  - Identify common mistakes and patterns
  - Recommend study resources based on weak areas
  - Generate personalized practice plans
- Implement interview style variations:
  - Conversational vs. structured format
  - Speed interview mode (quick questions)
  - Deep-dive mode (fewer questions, detailed exploration)
  - Behavioral interview variant with STAR method evaluation
  - Pair programming simulation with code review
- Add context-aware follow-up questions:
  - Ask clarifying questions if answer is vague
  - Probe deeper into interesting points
  - Challenge assumptions
  - Request code examples when appropriate
- Implement multi-turn conversations:
  - Allow back-and-forth dialogue on complex topics
  - Maintain conversation context across turns
  - Generate natural transitions between topics
  - Support clarification requests from user
- Add code execution engine:
  - Integrate Judge0 or similar API
  - Support multiple languages (Python, JavaScript, Java, C++)
  - Run user-submitted code during interview
  - Validate output against test cases
  - Provide execution feedback
- Create AI-powered resume analysis:
  - Upload resume to tailor interview questions
  - Extract skills and experience
  - Generate relevant technical questions
  - Adjust difficulty based on experience level

2. ADVANCED AUDIO PROCESSING:
- Implement noise cancellation:
  - Use Web Audio API with noise suppression
  - Apply bandpass filter for voice frequencies
  - Remove background music and ambient noise
  - Provide audio quality feedback to user
- Add accent adaptation:
  - Fine-tune STT model for user's accent over time
  - Store accent profile per user
  - Improve transcription accuracy with usage
- Implement speaker emotion detection:
  - Analyze voice tone and pitch
  - Detect confidence vs. uncertainty
  - Provide coaching on communication style
  - Track emotional progression through interview
- Add audio quality monitoring:
  - Detect clipping and distortion
  - Warn about background noise levels
  - Suggest optimal microphone positioning
  - Auto-adjust input gain
- Implement echo cancellation:
  - Prevent TTS feedback loop
  - Use acoustic echo cancellation algorithms
  - Adjust based on room acoustics
- Add voice biometrics (optional):
  - Verify user identity via voice print
  - Detect multiple speakers
  - Prevent interview fraud
- Implement audio compression optimization:
  - Use Opus codec for efficient transmission
  - Adaptive bitrate based on connection
  - Reduce bandwidth without quality loss

3. COLLABORATIVE FEATURES:
- Implement live interview observation:
  - Generate unique shareable link
  - Allow observers to view (read-only)
  - Real-time transcript sharing
  - Useful for recruiters and mentors
  - Add observer chat for internal notes
- Create interview room sharing:
  - Practice interviews with friends
  - Peer-to-peer mock interviews
  - Switch roles between interviewer/interviewee
  - Mutual feedback system
- Add mentor review system:
  - Assign mentor to review session
  - Mentor provides additional feedback
  - Schedule live coaching sessions
  - Track mentorship relationships
- Implement team interview practice:
  - Multiple interviewers taking turns
  - Panel interview simulation
  - Collaborative evaluation
  - Team decision-making tools

4. GAMIFICATION & ENGAGEMENT:
- Create achievement system:
  - Badges for milestones (first interview, 10 sessions, perfect score)
  - Streak tracking (consecutive days)
  - Category mastery levels
  - Leaderboard (optional, privacy-respecting)
- Implement XP and leveling:
  - Earn XP for completing interviews
  - Bonus XP for high scores
  - Level progression unlocks features
  - Visual level indicators
- Add daily challenges:
  - Special questions with bonus points
  - Time-limited challenges
  - Category-specific daily focus
  - Challenge completion rewards
- Create progress visualization:
  - Skill radar chart by category
  - Progress timeline
  - Heat map of activity
  - Strength/weakness breakdown
- Implement social features:
  - Share achievements (anonymized)
  - Compare with friends (opt-in)
  - Community leaderboards
  - Study groups

5. ADVANCED ANALYTICS:
- Create detailed performance analytics:
  - Score trends over time (line charts)
  - Category breakdown (radar chart)
  - Time spent per category
  - Improvement rate calculation
  - Strengths and weaknesses identification
- Implement predictive analytics:
  - Predict interview success likelihood
  - Estimate time to proficiency
  - Recommend optimal practice frequency
  - Identify at-risk knowledge areas
- Add comparative analytics:
  - Benchmark against similar users
  - Percentile ranking by experience level
  - Industry-standard comparisons
  - Goal tracking and projections
- Create interview replay analysis:
  - Visualize response patterns
  - Identify hesitation points
  - Analyze speech pace and fluency
  - Word cloud of commonly used terms
  - Filler word frequency (um, uh, like)
- Implement A/B testing framework:
  - Test different question styles
  - Optimize evaluation rubrics
  - Improve UI/UX based on data
  - Personalize features per user

6. ACCESSIBILITY ENHANCEMENTS:
- Add internationalization (i18n):
  - Support multiple languages (English, Spanish, French, etc.)
  - Translate UI elements
  - Localize date/time formats
  - RTL language support
  - Language switcher in settings
- Implement alternative input methods:
  - Text-based interview mode (for accessibility)
  - Keyboard-only navigation (no mouse required)
  - Voice commands for controls
  - Switch control support
- Add visual accessibility features:
  - High contrast themes
  - Adjustable font sizes (200% zoom support)
  - Dyslexia-friendly fonts
  - Color blindness modes
  - Screen reader optimization
- Implement captions and subtitles:
  - Real-time captions for TTS audio
  - Adjustable caption size and position
  - Caption history panel
- Add cognitive accessibility features:
  - Simplified UI mode
  - Reading assistance
  - Progress reminders
  - Break timers
  - Focus mode (minimal distractions)

7. MOBILE & OFFLINE CAPABILITIES:
- Create progressive web app (PWA):
  - Service worker for offline caching
  - App manifest for installation
  - Offline mode for reviewing history
  - Background sync for saving data
  - Push notifications for reminders
- Implement mobile-optimized UI:
  - Touch-friendly controls (min 44px targets)
  - Mobile-first responsive design
  - Optimized for small screens
  - Reduced data usage mode
  - Mobile-specific gestures (swipe, pinch)
- Add mobile app capabilities:
  - React Native version (stretch goal)
  - Native audio recording
  - Better battery optimization
  - Native notifications
  - Biometric authentication

8. INTEGRATION & EXPORT FEATURES:
- Add calendar integration:
  - Schedule practice sessions
  - Send reminders
  - Block time for interviews
  - Sync with Google Calendar, Outlook
- Implement data export:
  - Export session history as PDF
  - Download audio recordings
  - Export to JSON for analysis
  - Generate professional reports
  - Create shareable portfolio links
- Add integration with learning platforms:
  - LeetCode problem recommendations
  - Course platform connections
  - Study resource links
  - Progress sharing to LinkedIn
- Create API for third-party integrations:
  - Public API documentation
  - API key management
  - Rate limiting per key
  - Webhook support for events
  - SDK in popular languages

9. CUSTOMIZATION & PERSONALIZATION:
- Implement user preferences:
  - Preferred categories and topics
  - Interview duration preferences
  - Audio settings (voice, speed, volume)
  - UI theme and layout
  - Notification preferences
  - Privacy settings
- Add custom question banks:
  - Users create own questions
  - Share questions with community
  - Import question sets
  - Tag and categorize questions
  - Version control for questions
- Create personalized interview prep plans:
  - Goal setting (target company, role)
  - Generate study schedule
  - Track plan adherence
  - Adjust based on progress
  - Milestone celebrations
- Implement company-specific interview prep:
  - FAANG interview style
  - Startup technical interview
  - Big enterprise format
  - Company culture questions
  - Interview style library

10. VIDEO DEMO & MARKETING MATERIALS:
- Create comprehensive video walkthrough:
  - 3-5 minute overview video
  - Show registration and login
  - Demonstrate complete interview flow
  - Highlight key features and AI capabilities
  - Show results and analytics
  - Include voiceover explaining each step
  - Add subtitles for accessibility
  - Professional editing with transitions
  - Upload to YouTube/Loom
- Create supplementary content:
  - Feature highlight videos (30-60 seconds each)
  - Technical architecture overview
  - Code walkthrough video
  - Deployment and infrastructure tour
  - Security and testing demonstration
- Design marketing website:
  - Landing page with feature showcase
  - Interactive demos
  - Testimonials section
  - Pricing page (if applicable)
  - FAQ section
  - Blog for technical content
- Create README with rich media:
  - Animated GIFs of features
  - Architecture diagrams
  - Screenshots of key screens
  - Badges (build status, coverage, license)
  - Quick start guide
  - Contributing guidelines

11. ADVANCED ERROR RECOVERY:
- Implement session resume functionality:
  - Auto-save interview progress every 30 seconds
  - Detect browser close/refresh
  - Prompt to resume on return
  - Restore audio context and state
  - Continue from exact question
- Add conflict resolution:
  - Handle concurrent session attempts
  - Resolve data conflicts gracefully
  - Prevent duplicate submissions
- Create comprehensive fallback chains:
  - Primary AI service → Backup service → Cached response → Error with retry
  - WebSocket → Long polling → Error with reconnection
  - Audio recording → Text input fallback
- Implement proactive error prevention:
  - Connectivity checks before starting
  - Browser compatibility detection
  - Resource availability validation
  - Predictive error warnings

12. PERFORMANCE & SCALABILITY:
- Implement horizontal scaling architecture:
  - Stateless API servers for easy scaling
  - WebSocket server clustering with Redis pub/sub
  - Database read replicas for query distribution
  - CDN for global static asset delivery
  - Auto-scaling groups with load balancing
- Add caching strategies:
  - Redis cache for user sessions
  - CDN edge caching for static content
  - Service worker caching for offline
  - Memoization of expensive calculations
  - Database query result caching
- Optimize for cost efficiency:
  - Compress and deduplicate audio storage
  - Batch AI API calls when possible
  - Use spot instances for non-critical workloads
  - Implement request coalescing
  - Optimize database indexes for query efficiency

DELIVERABLES:
1. Adaptive difficulty system with skill tracking
2. Advanced audio processing with noise cancellation
3. Collaborative interview features
4. Complete gamification system with achievements
5. Advanced analytics dashboard with predictions
6. Full internationalization support (3+ languages)
7. Enhanced accessibility features (WCAG 2.1 AAA)
8. PWA with offline capabilities
9. Data export and integration features
10. Extensive customization options
11. Professional video walkthrough (3-5 minutes)
12. Marketing website and materials
13. Advanced error recovery and session resume
14. Horizontally scalable architecture
15. Comprehensive feature documentation
16. User testimonials and case studies

SUCCESS CRITERIA:
- Adaptive difficulty correctly adjusts based on performance
- Noise cancellation improves audio quality measurably
- Live observation works flawlessly with 10+ concurrent observers
- Achievement system drives 30%+ increase in user engagement
- Analytics provide actionable insights with clear visualizations
- Application supports 3+ languages with complete translations
- PWA installs and functions offline for reviewing history
- Session resume works 99%+ of the time after interruption
- Video walkthrough clearly demonstrates all core features
- Application scales to 1000+ concurrent users without degradation
- User satisfaction score >4.5/5 based on feedback
- Zero critical bugs in production after Phase 5 deployment
```

Based on the assessment requirements and architectural philosophy, I'll draft ultra-comprehensive implementation prompts for each phase of the Voice-Based AI Interview Agent project.

***

# 🏗️ Voice-Based AI Interview Agent - Implementation Roadmap

## **PHASE 0: Foundation & Infrastructure Setup**

### **Implementation Prompt**

**Context**: Establish the foundational infrastructure, development environment, and CI/CD pipeline for a voice-first AI interview platform. This phase sets architectural standards that will guide all subsequent development.

**Objectives**:
- Create monorepo structure with clear separation of concerns
- Establish PostgreSQL database with migration strategy
- Configure development, staging, and production environments
- Implement core observability and error tracking
- Set up authentication foundation

**Technical Specifications**:

#### Project Structure
```
voice-interview-agent/
├── .github/
│   └── workflows/
│       ├── ci-frontend.yml
│       ├── ci-backend.yml
│       └── deploy.yml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── interviews/
│   │   │   └── ai/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── pipes/
│   │   ├── config/
│   │   └── database/
│   │       └── migrations/
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── .env.example
└── README.md
```

#### Database Schema Design
```sql
-- Users table with secure authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

-- Interview sessions
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    difficulty_level VARCHAR(50), -- 'junior', 'mid', 'senior'
    topic VARCHAR(100), -- 'algorithms', 'system-design', 'javascript'
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    overall_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interview questions
CREATE TABLE interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    difficulty VARCHAR(50),
    category VARCHAR(100),
    expected_concepts TEXT[], -- Array of key concepts to look for
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    asked_at TIMESTAMP WITH TIME ZONE
);

-- Interview answers
CREATE TABLE interview_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    transcript TEXT NOT NULL,
    audio_duration_seconds INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    evaluation_score DECIMAL(5,2),
    evaluation_feedback TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    key_concepts_covered TEXT[]
);

-- Create indexes for performance
CREATE INDEX idx_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_sessions_status ON interview_sessions(status);
CREATE INDEX idx_questions_session_id ON interview_questions(session_id);
CREATE INDEX idx_answers_question_id ON interview_answers(question_id);
CREATE INDEX idx_users_email ON users(email);
```

#### Backend NestJS Configuration

**Core Dependencies**:
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/typeorm": "^10.0.1",
    "typeorm": "^0.3.17",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "@nestjs/throttler": "^5.1.1"
  }
}
```

**Environment Configuration** (.env.example):
```env
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=voice_interview_dev

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRATION=30d

# AI Services (placeholder - will configure in Phase 2)
OPENAI_API_KEY=
DEEPGRAM_API_KEY=

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

#### Frontend React Configuration

**Core Dependencies**:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.14.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

**Docker Compose Setup**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: voice_interview_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: voice_interview_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: voice_interview_api
    environment:
      NODE_ENV: development
      DATABASE_HOST: postgres
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run start:dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: voice_interview_web
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
```

**Deliverables**:
1. ✅ Fully initialized monorepo with both frontend and backend
2. ✅ PostgreSQL database running with migration framework
3. ✅ Docker Compose for local development
4. ✅ TypeScript configured with strict mode
5. ✅ ESLint and Prettier with shared configuration
6. ✅ Git hooks with Husky for pre-commit validation
7. ✅ Basic CI/CD pipeline with GitHub Actions
8. ✅ Comprehensive README with setup instructions

**Success Criteria**:
- `npm install` works in both frontend and backend
- `docker-compose up` starts all services successfully
- Database migrations run without errors
- TypeScript compilation succeeds with zero errors
- ESLint passes with no warnings

***

## **PHASE 1: Authentication & User Management**

### **Implementation Prompt**

**Context**: Build a production-grade authentication system using JWT tokens with email/password login. Implement secure password hashing, token refresh mechanism, and protected route infrastructure.

**Security Requirements**:
- Passwords must be hashed using bcrypt (minimum 12 rounds)
- JWT tokens expire after 7 days with refresh token mechanism
- Rate limiting on authentication endpoints (5 attempts per 15 minutes)
- Input validation on all user inputs
- SQL injection prevention through parameterized queries
- XSS protection headers

**Backend Implementation**:

#### Auth Module Structure
```
backend/src/modules/auth/
├── dto/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   └── refresh-token.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── local-auth.guard.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts
```

#### DTOs with Validation
```typescript
// register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password too long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number, and special character' }
  )
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;
}

// login.dto.ts
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

#### Auth Service Implementation
```typescript
// auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = this.usersRepository.create({
      email: registerDto.email.toLowerCase(),
      passwordHash: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    await this.usersRepository.save(user);

    const { passwordHash, ...result } = user;
    return {
      user: result,
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase(), isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersRepository.update(user.id, { lastLogin: new Date() });

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    return {
      user,
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user),
    };
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, { 
      expiresIn: '30d',
      secret: process.env.JWT_REFRESH_SECRET 
    });
  }
}
```

#### JWT Strategy
```typescript
// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return { userId: user.id, email: user.email };
  }
}
```

#### Auth Controller with Rate Limiting
```typescript
// auth.controller.ts
import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }
}
```

**Frontend Implementation**:

#### Auth Context/Store
```typescript
// src/contexts/AuthContext.tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
      isAuthenticated: () => get().accessToken !== null,
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

#### Axios Interceptor with Token Refresh
```typescript
// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

#### Protected Route Component
```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

#### Login/Register Forms
```typescript
// src/components/LoginForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>
      {loginMutation.isError && (
        <div className="text-red-600 text-sm">
          Invalid credentials. Please try again.
        </div>
      )}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

**Deliverables**:
1. ✅ Register endpoint with email validation and password hashing
2. ✅ Login endpoint with JWT token generation
3. ✅ Token refresh mechanism
4. ✅ Protected route middleware/guard
5. ✅ Frontend auth store with persistence
6. ✅ Login and registration forms
7. ✅ Axios interceptor for automatic token attachment
8. ✅ Rate limiting on auth endpoints

**Testing Requirements**:
- Unit tests for AuthService methods
- E2E tests for registration and login flows
- Test token expiration and refresh mechanism
- Test rate limiting triggers correctly
- Test SQL injection attempts are prevented

***

## **PHASE 2: AI Integration Layer**

### **Implementation Prompt**

**Context**: Integrate AI services for speech-to-text (STT), text-to-speech (TTS), and question generation/evaluation using OpenAI GPT-4 and Deepgram. Design a modular AI service layer that abstracts provider-specific implementations.

**AI Service Requirements**:
- Real-time audio streaming for STT
- Low-latency TTS with natural-sounding voice
- Context-aware interview question generation
- Intelligent answer evaluation with structured feedback
- Fallback mechanisms for API failures

**Backend Implementation**:

#### AI Module Structure
```
backend/src/modules/ai/
├── providers/
│   ├── deepgram/
│   │   ├── deepgram-stt.service.ts
│   │   └── deepgram-tts.service.ts
│   ├── openai/
│   │   ├── openai-chat.service.ts
│   │   └── openai-prompts.ts
│   └── interfaces/
│       ├── stt-provider.interface.ts
│       └── tts-provider.interface.ts
├── dto/
│   ├── generate-question.dto.ts
│   ├── evaluate-answer.dto.ts
│   └── transcribe-audio.dto.ts
├── ai.controller.ts
├── ai.service.ts
└── ai.module.ts
```

#### AI Service Dependencies
```json
{
  "dependencies": {
    "@deepgram/sdk": "^3.4.0",
    "openai": "^4.20.0",
    "@google-cloud/text-to-speech": "^5.0.0", // Alternative TTS
    "ws": "^8.16.0", // WebSocket for streaming
    "multer": "^1.4.5-lts.1" // File upload handling
  }
}
```

#### Deepgram STT Service
```typescript
// deepgram-stt.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeepgramSTTService {
  private readonly logger = new Logger(DeepgramSTTService.name);
  private deepgram;

  constructor(private configService: ConfigService) {
    this.deepgram = createClient(this.configService.get('DEEPGRAM_API_KEY'));
  }

  async transcribeStream(audioStream: ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      let transcript = '';

      const connection = this.deepgram.listen.live({
        model: 'nova-2',
        language: 'en',
        smart_format: true,
        interim_results: false,
        punctuate: true,
        utterance_end_ms: 1500, // Silence detection for auto-next-question
      });

      connection.on(LiveTranscriptionEvents.Open, () => {
        this.logger.log('Deepgram connection opened');

        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const transcription = data.channel.alternatives[0].transcript;
          if (transcription && data.is_final) {
            transcript += transcription + ' ';
          }
        });

        connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
          this.logger.log('Utterance ended - triggering next question');
          resolve(transcript.trim());
        });

        connection.on(LiveTranscriptionEvents.Error, (error) => {
          this.logger.error('Deepgram error', error);
          reject(error);
        });

        // Pipe audio stream to Deepgram
        audioStream.pipeTo(new WritableStream({
          write(chunk) {
            if (connection.getReadyState() === 1) {
              connection.send(chunk);
            }
          },
          close() {
            connection.finish();
          },
        }));
      });
    });
  }

  async transcribeFile(audioBuffer: Buffer): Promise<string> {
    const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: 'en',
        smart_format: true,
        punctuate: true,
      }
    );

    if (error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }

    return result.results.channels[0].alternatives[0].transcript;
  }
}
```

#### Deepgram TTS Service
```typescript
// deepgram-tts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@deepgram/sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeepgramTTSService {
  private readonly logger = new Logger(DeepgramTTSService.name);
  private deepgram;

  constructor(private configService: ConfigService) {
    this.deepgram = createClient(this.configService.get('DEEPGRAM_API_KEY'));
  }

  async synthesizeSpeech(text: string): Promise<Buffer> {
    try {
      const response = await this.deepgram.speak.request(
        { text },
        {
          model: 'aura-asteria-en', // Natural, professional voice
          encoding: 'linear16',
          sample_rate: 24000,
        }
      );

      const stream = await response.getStream();
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error('TTS synthesis failed', error);
      throw error;
    }
  }

  async streamSpeech(text: string): Promise<ReadableStream> {
    const response = await this.deepgram.speak.request(
      { text },
      {
        model: 'aura-asteria-en',
        encoding: 'linear16',
        sample_rate: 24000,
      }
    );

    return response.getStream();
  }
}
```

#### OpenAI Chat Service
```typescript
// openai-chat.service.ts
import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { InterviewPrompts } from './openai-prompts';

interface QuestionGenerationParams {
  difficulty: 'junior' | 'mid' | 'senior';
  topic: string;
  previousQuestions?: string[];
  candidateResponses?: string[];
}

interface AnswerEvaluationParams {
  question: string;
  answer: string;
  expectedConcepts: string[];
}

@Injectable()
export class OpenAIChatService {
  private readonly logger = new Logger(OpenAIChatService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async generateInterviewQuestion(params: QuestionGenerationParams): Promise<{
    question: string;
    expectedConcepts: string[];
    difficulty: string;
  }> {
    try {
      const systemPrompt = InterviewPrompts.getQuestionGenerationPrompt(params.difficulty, params.topic);
      const userPrompt = this.buildQuestionContext(params);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8, // Creative but focused
        response_format: { type: 'json_object' },
      });

      const response = JSON.parse(completion.choices[0].message.content);
      
      return {
        question: response.question,
        expectedConcepts: response.expected_concepts || [],
        difficulty: params.difficulty,
      };
    } catch (error) {
      this.logger.error('Question generation failed', error);
      throw error;
    }
  }

  async evaluateAnswer(params: AnswerEvaluationParams): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    conceptsCovered: string[];
  }> {
    try {
      const systemPrompt = InterviewPrompts.getEvaluationPrompt();
      const userPrompt = `
Question: ${params.question}

Expected Concepts: ${params.expectedConcepts.join(', ')}

Candidate's Answer: ${params.answer}

Evaluate this answer comprehensively.
      `.trim();

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // More deterministic for evaluation
        response_format: { type: 'json_object' },
      });

      const evaluation = JSON.parse(completion.choices[0].message.content);

      return {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        conceptsCovered: evaluation.concepts_covered || [],
      };
    } catch (error) {
      this.logger.error('Answer evaluation failed', error);
      throw error;
    }
  }

  private buildQuestionContext(params: QuestionGenerationParams): string {
    let context = `Generate a technical interview question for a ${params.difficulty} level candidate on the topic: ${params.topic}.`;

    if (params.previousQuestions?.length) {
      context += `\n\nPrevious questions asked:\n${params.previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
      context += '\n\nGenerate a question that builds upon previous topics but explores new aspects.';
    }

    return context;
  }
}
```

#### OpenAI Prompts Library
```typescript
// openai-prompts.ts
export class InterviewPrompts {
  static getQuestionGenerationPrompt(difficulty: string, topic: string): string {
    return `You are an experienced technical interviewer conducting a ${difficulty}-level interview on ${topic}.

Your task is to generate ONE high-quality technical interview question that:
1. Matches the ${difficulty} difficulty level appropriately
2. Tests practical understanding, not just memorization
3. Encourages the candidate to explain their thought process
4. Has clear evaluation criteria

Difficulty guidelines:
- Junior: Fundamental concepts, basic syntax, simple problem-solving
- Mid: Design patterns, optimization, trade-offs, real-world scenarios
- Senior: System design, architecture decisions, scalability, advanced concepts

Return a JSON object with this structure:
{
  "question": "The interview question text",
  "expected_concepts": ["concept1", "concept2", "concept3"],
  "difficulty": "${difficulty}"
}

Keep the question conversational and open-ended to encourage discussion.`;
  }

  static getEvaluationPrompt(): string {
    return `You are an expert technical interviewer evaluating a candidate's answer.

Evaluate the answer based on:
1. Technical accuracy (40%)
2. Depth of understanding (30%)
3. Communication clarity (20%)
4. Completeness (10%)

Provide:
- A score from 0-100
- Constructive feedback (2-3 sentences)
- 2-3 specific strengths
- 2-3 areas for improvement
- List of key concepts the candidate covered

Return a JSON object:
{
  "score": 85,
  "feedback": "Detailed evaluation...",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "concepts_covered": ["concept1", "concept2"]
}

Be fair but thorough. Partial credit for incomplete but accurate explanations.`;
  }
}
```

#### AI Controller with Streaming Support
```typescript
// ai.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  UploadedFile, 
  UseInterceptors,
  Res,
  StreamableFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribeAudio(@UploadedFile() file: Express.Multer.File) {
    const transcript = await this.aiService.transcribeAudio(file.buffer);
    return { transcript };
  }

  @Post('synthesize')
  async synthesizeSpeech(
    @Body('text') text: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const audioBuffer = await this.aiService.synthesizeSpeech(text);
    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length,
    });
    return new StreamableFile(audioBuffer);
  }

  @Post('generate-question')
  async generateQuestion(@Body() params: any) {
    return this.aiService.generateQuestion(params);
  }

  @Post('evaluate-answer')
  async evaluateAnswer(@Body() params: any) {
    return this.aiService.evaluateAnswer(params);
  }
}
```

**Frontend Implementation**:

#### Audio Recording Hook
```typescript
// src/hooks/useAudioRecorder.ts
import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
  };
}
```

#### AI Service Client
```typescript
// src/services/ai.service.ts
import api from './api';

export class AIService {
  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const { data } = await api.post('/ai/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.transcript;
  }

  static async synthesizeSpeech(text: string): Promise<Blob> {
    const { data } = await api.post('/ai/synthesize', { text }, {
      responseType: 'blob',
    });

    return data;
  }

  static async playAudio(audioBlob: Blob): Promise<void> {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    });
  }
}
```

**Deliverables**:
1. ✅ Deepgram integration for real-time STT
2. ✅ Deepgram TTS with natural voice synthesis
3. ✅ OpenAI GPT-4 for question generation
4. ✅ OpenAI GPT-4 for answer evaluation
5. ✅ Frontend audio recording hook
6. ✅ Audio playback functionality
7. ✅ Streaming support for real-time transcription
8. ✅ Error handling and fallback mechanisms

**Testing Requirements**:
- Test audio recording in multiple browsers
- Verify transcription accuracy with sample audio
- Test TTS latency and audio quality
- Validate question generation produces relevant questions
- Test evaluation scoring consistency

***

## **PHASE 3: Interview Session Management**

### **Implementation Prompt**

**Context**: Build the core interview engine that orchestrates the entire interview flow: session creation, question generation, answer recording, automatic progression, and evaluation storage. This is the heart of the application.

**Core Interview Flow**:
1. User creates a new interview session (selects difficulty, topic)
2. System generates first question using AI
3. Question is displayed and spoken via TTS
4. User answers (voice recorded and transcribed)
5. System evaluates answer and stores results
6. Silence detection triggers next question automatically
7. Process repeats for 5-7 questions
8. Session completes with overall score and feedback

**Backend Implementation**:

#### Interview Module Structure
```
backend/src/modules/interviews/
├── entities/
│   ├── interview-session.entity.ts
│   ├── interview-question.entity.ts
│   └── interview-answer.entity.ts
├── dto/
│   ├── create-session.dto.ts
│   ├── submit-answer.dto.ts
│   └── session-response.dto.ts
├── interviews.controller.ts
├── interviews.service.ts
├── interviews.gateway.ts  // WebSocket for real-time updates
└── interviews.module.ts
```

#### TypeORM Entities
```typescript
// interview-session.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InterviewQuestion } from './interview-question.entity';

@Entity('interview_sessions')
export class InterviewSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column()
  title: string;

  @Column()
  difficultyLevel: string; // 'junior' | 'mid' | 'senior'

  @Column()
  topic: string;

  @Column({ default: 'in_progress' })
  status: string; // 'in_progress' | 'completed' | 'abandoned'

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  durationSeconds: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore: number;

  @OneToMany(() => InterviewQuestion, question => question.session, { cascade: true })
  questions: InterviewQuestion[];
}

// interview-question.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { InterviewSession } from './interview-session.entity';
import { InterviewAnswer } from './interview-answer.entity';

@Entity('interview_questions')
export class InterviewQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InterviewSession, session => session.questions)
  session: InterviewSession;

  @Column('text')
  questionText: string;

  @Column()
  questionOrder: number;

  @Column()
  difficulty: string;

  @Column()
  category: string;

  @Column('text', { array: true })
  expectedConcepts: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  askedAt: Date;

  @OneToOne(() => InterviewAnswer, answer => answer.question, { cascade: true })
  answer: InterviewAnswer;
}

// interview-answer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { InterviewQuestion } from './interview-question.entity';

@Entity('interview_answers')
export class InterviewAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => InterviewQuestion, question => question.answer)
  @JoinColumn()
  question: InterviewQuestion;

  @Column('text')
  transcript: string;

  @Column({ nullable: true })
  audioDurationSeconds: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  answeredAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  evaluationScore: number;

  @Column('text', { nullable: true })
  evaluationFeedback: string;

  @Column('text', { array: true, nullable: true })
  strengths: string[];

  @Column('text', { array: true, nullable: true })
  weaknesses: string[];

  @Column('text', { array: true, nullable: true })
  keyConceptsCovered: string[];
}
```

#### Interviews Service with Business Logic
```typescript
// interviews.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewSession } from './entities/interview-session.entity';
import { InterviewQuestion } from './entities/interview-question.entity';
import { InterviewAnswer } from './entities/interview-answer.entity';
import { OpenAIChatService } from '../ai/providers/openai/openai-chat.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class InterviewsService {
  private readonly QUESTIONS_PER_SESSION = 6;

  constructor(
    @InjectRepository(InterviewSession)
    private sessionsRepository: Repository<InterviewSession>,
    @InjectRepository(InterviewQuestion)
    private questionsRepository: Repository<InterviewQuestion>,
    @InjectRepository(InterviewAnswer)
    private answersRepository: Repository<InterviewAnswer>,
    private openAIService: OpenAIChatService,
  ) {}

  async createSession(userId: string, createDto: CreateSessionDto): Promise<InterviewSession> {
    const session = this.sessionsRepository.create({
      user: { id: userId } as any,
      title: createDto.title || `${createDto.topic} Interview`,
      difficultyLevel: createDto.difficulty,
      topic: createDto.topic,
      status: 'in_progress',
    });

    await this.sessionsRepository.save(session);

    // Generate first question immediately
    await this.generateNextQuestion(session.id);

    return this.sessionsRepository.findOne({
      where: { id: session.id },
      relations: ['questions', 'questions.answer'],
    });
  }

  async generateNextQuestion(sessionId: string): Promise<InterviewQuestion> {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId },
      relations: ['questions', 'questions.answer'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if we've reached the question limit
    if (session.questions.length >= this.QUESTIONS_PER_SESSION) {
      await this.completeSession(sessionId);
      return null;
    }

    // Get previous questions for context
    const previousQuestions = session.questions.map(q => q.questionText);
    const candidateResponses = session.questions
      .filter(q => q.answer)
      .map(q => q.answer.transcript);

    // Generate new question using AI
    const generatedQuestion = await this.openAIService.generateInterviewQuestion({
      difficulty: session.difficultyLevel as any,
      topic: session.topic,
      previousQuestions,
      candidateResponses,
    });

    const question = this.questionsRepository.create({
      session,
      questionText: generatedQuestion.question,
      questionOrder: session.questions.length + 1,
      difficulty: generatedQuestion.difficulty,
      category: session.topic,
      expectedConcepts: generatedQuestion.expectedConcepts,
      askedAt: new Date(),
    });

    await this.questionsRepository.save(question);

    return question;
  }

  async submitAnswer(questionId: string, submitDto: SubmitAnswerDto, userId: string): Promise<InterviewAnswer> {
    const question = await this.questionsRepository.findOne({
      where: { id: questionId },
      relations: ['session', 'session.user'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Verify ownership
    if (question.session.user.id !== userId) {
      throw new ForbiddenException('Not authorized to answer this question');
    }

    // Evaluate answer using AI
    const evaluation = await this.openAIService.evaluateAnswer({
      question: question.questionText,
      answer: submitDto.transcript,
      expectedConcepts: question.expectedConcepts,
    });

    const answer = this.answersRepository.create({
      question,
      transcript: submitDto.transcript,
      audioDurationSeconds: submitDto.audioDurationSeconds,
      evaluationScore: evaluation.score,
      evaluationFeedback: evaluation.feedback,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      keyConceptsCovered: evaluation.conceptsCovered,
    });

    await this.answersRepository.save(answer);

    // Automatically generate next question
    await this.generateNextQuestion(question.session.id);

    return answer;
  }

  async completeSession(sessionId: string): Promise<InterviewSession> {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId },
      relations: ['questions', 'questions.answer'],
    });

    // Calculate overall score (average of all answer scores)
    const scores = session.questions
      .filter(q => q.answer?.evaluationScore)
      .map(q => q.answer.evaluationScore);

    const overallScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + Number(score), 0) / scores.length
      : 0;

    // Calculate duration
    const duration = Math.floor(
      (new Date().getTime() - session.startedAt.getTime()) / 1000
    );

    session.status = 'completed';
    session.completedAt = new Date();
    session.overallScore = overallScore;
    session.durationSeconds = duration;

    await this.sessionsRepository.save(session);

    return session;
  }

  async getUserSessions(userId: string, page: number = 1, limit: number = 10) {
    const [sessions, total] = await this.sessionsRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['questions'],
      order: { startedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      sessions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSessionDetail(sessionId: string, userId: string): Promise<InterviewSession> {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId },
      relations: ['user', 'questions', 'questions.answer'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.user.id !== userId) {
      throw new ForbiddenException('Not authorized to view this session');
    }

    return session;
  }
}
```

#### WebSocket Gateway for Real-Time Updates
```typescript
// interviews.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN },
  namespace: 'interviews',
})
@UseGuards(WsJwtGuard)
export class InterviewsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-session')
  handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() sessionId: string,
  ) {
    client.join(`session:${sessionId}`);
    return { event: 'joined', sessionId };
  }

  @SubscribeMessage('leave-session')
  handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() sessionId: string,
  ) {
    client.leave(`session:${sessionId}`);
    return { event: 'left', sessionId };
  }

  // Emit events to specific session rooms
  emitToSession(sessionId: string, event: string, data: any) {
    this.server.to(`session:${sessionId}`).emit(event, data);
  }

  notifyNewQuestion(sessionId: string, question: any) {
    this.emitToSession(sessionId, 'new-question', question);
  }

  notifyAnswerEvaluated(sessionId: string, evaluation: any) {
    this.emitToSession(sessionId, 'answer-evaluated', evaluation);
  }

  notifySessionCompleted(sessionId: string, summary: any) {
    this.emitToSession(sessionId, 'session-completed', summary);
  }
}
```

**Frontend Implementation**:

#### Interview Session Hook
```typescript
// src/hooks/useInterviewSession.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { useAuthStore } from '../contexts/AuthContext';

interface InterviewSession {
  id: string;
  title: string;
  difficultyLevel: string;
  topic: string;
  status: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
}

interface InterviewQuestion {
  id: string;
  questionText: string;
  questionOrder: number;
  answer?: InterviewAnswer;
}

interface InterviewAnswer {
  id: string;
  transcript: string;
  evaluationScore: number;
  evaluationFeedback: string;
  strengths: string[];
  weaknesses: string[];
}

export function useInterviewSession(sessionId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Fetch session data
  const { data: session, refetch } = useQuery({
    queryKey: ['interview-session', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/interviews/${sessionId}`);
      return data;
    },
    enabled: !!sessionId,
  });

  // WebSocket connection
  useEffect(() => {
    if (!sessionId || !accessToken) return;

    const newSocket = io(`${import.meta.env.VITE_WS_URL}/interviews`, {
      auth: { token: accessToken },
    });

    newSocket.on('connect', () => {
      console.log('Connected to interview session');
      newSocket.emit('join-session', sessionId);
    });

    newSocket.on('new-question', (question) => {
      console.log('New question received:', question);
      setCurrentQuestion(question);
      refetch();
    });

    newSocket.on('answer-evaluated', (evaluation) => {
      console.log('Answer evaluated:', evaluation);
      refetch();
    });

    newSocket.on('session-completed', (summary) => {
      console.log('Session completed:', summary);
      refetch();
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-session', sessionId);
      newSocket.close();
    };
  }, [sessionId, accessToken]);

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, transcript, audioDuration }: any) => {
      const { data } = await api.post(`/interviews/questions/${questionId}/answer`, {
        transcript,
        audioDurationSeconds: audioDuration,
      });
      return data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  return {
    session,
    currentQuestion: currentQuestion || session?.questions?.[session.questions.length - 1],
    submitAnswer: submitAnswerMutation.mutate,
    isSubmitting: submitAnswerMutation.isPending,
    refetch,
  };
}
```

#### Interview Interface Component
```typescript
// src/components/InterviewInterface.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { AIService } from '../services/ai.service';

export function InterviewInterface() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, currentQuestion, submitAnswer, isSubmitting } = useInterviewSession(sessionId!);
  const { isRecording, audioBlob, startRecording, stopRecording } = useAudioRecorder();
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-play question when it changes
  useEffect(() => {
    if (currentQuestion) {
      playQuestion(currentQuestion.questionText);
    }
  }, [currentQuestion?.id]);

  // Auto-submit when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleTranscribeAndSubmit();
    }
  }, [audioBlob, isRecording]);

  const playQuestion = async (text: string) => {
    try {
      const audioBlob = await AIService.synthesizeSpeech(text);
      await AIService.playAudio(audioBlob);
    } catch (error) {
      console.error('Failed to play question:', error);
    }
  };

  const handleTranscribeAndSubmit = async () => {
    if (!audioBlob || !currentQuestion) return;

    setIsProcessing(true);
    try {
      const transcribedText = await AIService.transcribeAudio(audioBlob);
      setTranscript(transcribedText);

      const audioDuration = Math.floor(audioBlob.size / 16000); // Rough estimate
      submitAnswer({
        questionId: currentQuestion.id,
        transcript: transcribedText,
        audioDuration,
      });
    } catch (error) {
      console.error('Failed to process answer:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!session) {
    return <div>Loading interview...</div>;
  }

  if (session.status === 'completed') {
    return <InterviewSummary session={session} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{session.title}</h1>
        <div className="text-sm text-gray-600">
          Question {currentQuestion?.questionOrder} of {session.questions.length}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Question:</h2>
        <p className="text-lg mb-6">{currentQuestion?.questionText}</p>

        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing || isSubmitting}
            className={`
              w-32 h-32 rounded-full flex items-center justify-center text-white text-lg font-semibold
              ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}
              ${(isProcessing || isSubmitting) && 'opacity-50 cursor-not-allowed'}
            `}
          >
            {isRecording ? 'Stop' : 'Start'} Recording
          </button>

          {isProcessing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Processing your answer...</p>
            </div>
          )}

          {isSubmitting && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Evaluating your response...</p>
            </div>
          )}
        </div>
      </div>

      {transcript && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-2">Your Response:</h3>
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}

      {currentQuestion?.answer && (
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Evaluation:</h3>
          <div className="mb-2">
            <span className="font-medium">Score:</span>{' '}
            <span className="text-lg font-bold text-green-600">
              {currentQuestion.answer.evaluationScore}/100
            </span>
          </div>
          <p className="text-gray-700 mb-4">{currentQuestion.answer.evaluationFeedback}</p>
          
          {currentQuestion.answer.strengths.length > 0 && (
            <div className="mb-3">
              <span className="font-medium">Strengths:</span>
              <ul className="list-disc list-inside mt-1">
                {currentQuestion.answer.strengths.map((strength, idx) => (
                  <li key={idx} className="text-green-700">{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {currentQuestion.answer.weaknesses.length > 0 && (
            <div>
              <span className="font-medium">Areas for Improvement:</span>
              <ul className="list-disc list-inside mt-1">
                {currentQuestion.answer.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-orange-700">{weakness}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Deliverables**:
1. ✅ Interview session creation endpoint
2. ✅ Dynamic question generation flow
3. ✅ Answer submission and evaluation
4. ✅ Automatic next-question trigger
5. ✅ WebSocket real-time updates
6. ✅ Session completion logic with scoring
7. ✅ Full interview UI with recording
8. ✅ Live transcript display

**Testing Requirements**:
- Test complete interview flow end-to-end
- Verify questions progress automatically
- Test silence detection triggers correctly
- Validate evaluation scores are saved
- Test WebSocket reconnection handling

***

## **PHASE 4: Dashboard & History**

### **Implementation Prompt**

**Context**: Build a comprehensive dashboard where users can view their interview history, detailed results, performance analytics, and start new interviews. Focus on data visualization and intuitive UX.

**Dashboard Features**:
- List of all past interviews with key metrics
- Detailed view of individual interview sessions
- Performance trends over time
- Topic-wise performance breakdown
- "Start New Interview" workflow

**Backend Implementation**:

#### Analytics Endpoints
```typescript
// interviews.controller.ts (additions)
@Get('analytics')
@UseGuards(JwtAuthGuard)
async getUserAnalytics(@Request() req) {
  return this.interviewsService.getUserAnalytics(req.user.userId);
}

@Get('recent')
@UseGuards(JwtAuthGuard)
async getRecentSessions(
  @Request() req,
  @Query('limit') limit: number = 5
) {
  return this.interviewsService.getRecentSessions(req.user.userId, limit);
}

@Get('topics')
@UseGuards(JwtAuthGuard)
async getAvailableTopics() {
  return {
    topics: [
      { value: 'javascript', label: 'JavaScript', icon: '📜' },
      { value: 'python', label: 'Python', icon: '🐍' },
      { value: 'algorithms', label: 'Algorithms & Data Structures', icon: '🧮' },
      { value: 'system-design', label: 'System Design', icon: '🏗️' },
      { value: 'react', label: 'React', icon: '⚛️' },
      { value: 'nodejs', label: 'Node.js', icon: '🟢' },
      { value: 'databases', label: 'Databases', icon: '🗄️' },
      { value: 'devops', label: 'DevOps', icon: '🔧' },
    ],
    difficulties: ['junior', 'mid', 'senior'],
  };
}
```

#### Analytics Service Methods
```typescript
// interviews.service.ts (additions)
async getUserAnalytics(userId: string) {
  const sessions = await this.sessionsRepository.find({
    where: { user: { id: userId }, status: 'completed' },
    relations: ['questions', 'questions.answer'],
  });

  const totalSessions = sessions.length;
  const averageScore = sessions.reduce((sum, s) => sum + (Number(s.overallScore) || 0), 0) / (totalSessions || 1);
  
  // Topic-wise performance
  const topicPerformance = sessions.reduce((acc, session) => {
    const topic = session.topic;
    if (!acc[topic]) {
      acc[topic] = { count: 0, totalScore: 0, averageScore: 0 };
    }
    acc[topic].count++;
    acc[topic].totalScore += Number(session.overallScore) || 0;
    acc[topic].averageScore = acc[topic].totalScore / acc[topic].count;
    return acc;
  }, {} as Record<string, any>);

  // Difficulty distribution
  const difficultyDistribution = sessions.reduce((acc, session) => {
    acc[session.difficultyLevel] = (acc[session.difficultyLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent trend (last 10 sessions)
  const recentTrend = sessions
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .slice(0, 10)
    .reverse()
    .map(s => ({
      date: s.startedAt,
      score: s.overallScore,
      topic: s.topic,
    }));

  return {
    totalSessions,
    averageScore: Math.round(averageScore * 100) / 100,
    topicPerformance,
    difficultyDistribution,
    recentTrend,
    totalQuestionsAnswered: sessions.reduce((sum, s) => sum + s.questions.length, 0),
  };
}

async getRecentSessions(userId: string, limit: number = 5) {
  const sessions = await this.sessionsRepository.find({
    where: { user: { id: userId } },
    order: { startedAt: 'DESC' },
    take: limit,
    relations: ['questions'],
  });

  return sessions.map(session => ({
    id: session.id,
    title: session.title,
    topic: session.topic,
    difficulty: session.difficultyLevel,
    status: session.status,
    score: session.overallScore,
    startedAt: session.startedAt,
    questionsCount: session.questions.length,
  }));
}
```

**Frontend Implementation**:

#### Dashboard Page
```typescript
// src/pages/Dashboard.tsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function Dashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get('/interviews/analytics');
      return data;
    },
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['recent-sessions'],
    queryFn: async () => {
      const { data } = await api.get('/interviews/recent');
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Interview Dashboard</h1>
        <Link
          to="/interviews/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
        >
          + New Interview
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Interviews"
          value={analytics?.totalSessions || 0}
          icon="📝"
        />
        <StatCard
          title="Average Score"
          value={`${analytics?.averageScore || 0}%`}
          icon="⭐"
        />
        <StatCard
          title="Questions Answered"
          value={analytics?.totalQuestionsAnswered || 0}
          icon="💬"
        />
        <StatCard
          title="Current Streak"
          value="5 days"
          icon="🔥"
        />
      </div>

      {/* Performance Chart */}
      {analytics?.recentTrend && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Performance Trend</h2>
          <PerformanceChart data={analytics.recentTrend} />
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Interviews</h2>
        <div className="space-y-3">
          {recentSessions?.map((session: any) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>

      {/* Topic Performance */}
      {analytics?.topicPerformance && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Performance by Topic</h2>
          <TopicPerformanceGrid topics={analytics.topicPerformance} />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function SessionCard({ session }: any) {
  return (
    <Link
      to={`/interviews/${session.id}`}
      className="block border rounded-lg p-4 hover:bg-gray-50 transition"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold">{session.title}</h3>
          <div className="flex gap-3 mt-2 text-sm text-gray-600">
            <span>📚 {session.topic}</span>
            <span>⚡ {session.difficulty}</span>
            <span>❓ {session.questionsCount} questions</span>
          </div>
        </div>
        <div className="text-right">
          {session.status === 'completed' ? (
            <div className="text-2xl font-bold text-green-600">
              {session.score}%
            </div>
          ) : (
            <span className="text-sm text-orange-600 font-medium">
              In Progress
            </span>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {new Date(session.startedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Link>
  );
}
```

#### New Interview Flow
```typescript
// src/pages/NewInterview.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function NewInterview() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [title, setTitle] = useState('');

  const { data: options } = useQuery({
    queryKey: ['interview-options'],
    queryFn: async () => {
      const { data } = await api.get('/interviews/topics');
      return data;
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const { data } = await api.post('/interviews', sessionData);
      return data;
    },
    onSuccess: (data) => {
      navigate(`/interviews/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSessionMutation.mutate({
      title: title || `${selectedTopic} Interview`,
      topic: selectedTopic,
      difficulty: selectedDifficulty,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Start New Interview</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Interview Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My JavaScript Interview"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Select Topic *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {options?.topics.map((topic: any) => (
              <button
                key={topic.value}
                type="button"
                onClick={() => setSelectedTopic(topic.value)}
                className={`
                  p-4 border-2 rounded-lg text-left transition
                  ${selectedTopic === topic.value 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="text-2xl mb-1">{topic.icon}</div>
                <div className="font-medium">{topic.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Select Difficulty *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {options?.difficulties.map((difficulty: string) => (
              <button
                key={difficulty}
                type="button"
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`
                  py-3 border-2 rounded-lg font-medium transition capitalize
                  ${selectedDifficulty === difficulty 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!selectedTopic || !selectedDifficulty || createSessionMutation.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createSessionMutation.isPending ? 'Starting Interview...' : 'Start Interview'}
        </button>
      </form>
    </div>
  );
}
```

**Deliverables**:
1. ✅ Dashboard with analytics overview
2. ✅ Recent interviews list
3. ✅ Performance visualization chart
4. ✅ Topic-wise performance breakdown
5. ✅ "New Interview" creation flow
6. ✅ Detailed interview results view
7. ✅ Session history pagination

**Testing Requirements**:
- Test dashboard loads with no interviews
- Verify analytics calculations are accurate
- Test pagination for interview history
- Validate new interview creation flow

***

## **PHASE 5: Polish, Testing & Documentation**

### **Implementation Prompt**

**Context**: Finalize the application with comprehensive testing, error handling, performance optimization, security hardening, and complete documentation.

**Quality Assurance Checklist**:

#### Backend Testing
```typescript
// backend/test/interviews.e2e-spec.ts
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Interviews E2E', () => {
  let app;
  let authToken;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Register and login
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      });

    authToken = registerResponse.body.accessToken;
  });

  it('should create an interview session', async () => {
    const response = await request(app.getHttpServer())
      .post('/interviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'JavaScript Test',
        topic: 'javascript',
        difficulty: 'mid',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.topic).toBe('javascript');
  });

  // Add more E2E tests...
});
```

#### Security Hardening

**Helmet Configuration**:
```typescript
// main.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

**CORS Configuration**:
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Input Sanitization**:
```typescript
// Add XSS protection middleware
import * as xss from 'xss-clean';
app.use(xss());
```

#### Performance Optimization

**Database Indexing** (already added in schema)
```sql
CREATE INDEX idx_sessions_user_status ON interview_sessions(user_id, status);
CREATE INDEX idx_questions_session_order ON interview_questions(session_id, question_order);
```

**Response Caching**:
```typescript
// Use CacheModule for frequently accessed data
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 100, // maximum number of items in cache
    }),
  ],
})
```

#### README.md Template
```markdown
# Voice-Based AI Interview Agent

A full-stack application that conducts technical interviews through natural spoken conversation using AI.

## 🚀 Features

- 🎤 Voice-first interface with real-time speech-to-text
- 🤖 AI-powered question generation and evaluation
- 📊 Performance analytics and interview history
- 🔒 Secure authentication with JWT
- ⚡ Real-time updates via WebSocket
- 🎯 Multiple difficulty levels and topics

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Zustand for state management
- React Query for server state
- Socket.io-client for WebSockets

**Backend:**
- NestJS with TypeScript
- PostgreSQL database
- TypeORM for database management
- Passport JWT authentication
- Socket.io for real-time communication

**AI Services:**
- OpenAI GPT-4 for question generation and evaluation
- Deepgram for speech-to-text and text-to-speech

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- OpenAI API key
- Deepgram API key

## 🔧 Installation

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/voice-interview-agent.git
cd voice-interview-agent
\`\`\`

### 2. Setup Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migration:run
npm run start:dev
\`\`\`

### 3. Setup Frontend
\`\`\`bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
\`\`\`

### 4. Using Docker (Alternative)
\`\`\`bash
docker-compose up -d
\`\`\`

## 🔑 Environment Variables

### Backend (.env)
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/interview_db
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
\`\`\`

### Frontend (.env)
\`\`\`env
VITE_API_URL=http://localhost:3001/api/v1
VITE_WS_URL=http://localhost:3001
\`\`\`

## 📚 API Documentation

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

### Interviews
- `POST /interviews` - Create interview session
- `GET /interviews` - List user's interviews
- `GET /interviews/:id` - Get interview details
- `POST /interviews/questions/:id/answer` - Submit answer

### AI
- `POST /ai/transcribe` - Transcribe audio
- `POST /ai/synthesize` - Generate speech
- `POST /ai/generate-question` - Generate interview question
- `POST /ai/evaluate-answer` - Evaluate candidate answer

## 🧪 Testing

\`\`\`bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
\`\`\`

## 🚢 Deployment

### Production Build
\`\`\`bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
\`\`\`

### Deploy to Cloud
- Backend: Deploy to AWS/GCP/Azure with PM2 or Docker
- Frontend: Deploy to Vercel/Netlify
- Database: Use managed PostgreSQL (RDS, Cloud SQL, etc.)

## 📝 License

MIT License - see LICENSE file for details

## 👥 Authors

- Your Name - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Deepgram for speech services
- NestJS and React communities
\`\`\`

**Deliverables**:
1. ✅ Comprehensive E2E test suite
2. ✅ Unit tests for critical services
3. ✅ Security hardening (Helmet, CORS, rate limiting)
4. ✅ Performance optimization (caching, indexing)
5. ✅ Complete README with setup instructions
6. ✅ API documentation
7. ✅ Error handling and logging
8. ✅ Production deployment configuration
9. ✅ (Optional) Loom/YouTube demo video

---

## 🎯 **Final Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Login   │  │Dashboard │  │Interview │  │ Results  │  │
│  │  /Register│  │          │  │Interface │  │          │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │              │              │        │
│       └─────────────┴──────────────┴──────────────┘        │
│                         │                                   │
│                    React Router                             │
│                         │                                   │
│         ┌───────────────┼───────────────┐                  │
│         │               │               │                   │
│    Auth Store    WebSocket Client   API Client             │
│    (Zustand)     (Socket.io)       (Axios)                 │
└─────────┼───────────────┼───────────────┼──────────────────┘
          │               │               │
          │               │               │ HTTP/REST
          │               │ WebSocket     │
          │               │               │
┌─────────┼───────────────┼───────────────┼──────────────────┐
│         │               │               │     BACKEND       │
│    ┌────▼────┐    ┌────▼────┐    ┌─────▼──────┐           │
│    │  Auth   │    │WebSocket│    │  REST API  │           │
│    │ Module  │    │ Gateway │    │ Controllers│           │
│    └────┬────┘    └────┬────┘    └─────┬──────┘           │
│         │              │               │                    │
│         └──────────────┼───────────────┘                    │
│                        │                                    │
│         ┌──────────────┼──────────────┐                    │
│         │              │              │                     │
│    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐               │
│    │Interview│   │   AI    │   │  Users  │               │
│    │ Service │   │ Service │   │ Service │               │
│    └────┬────┘   └────┬────┘   └────┬────┘               │
│         │             │              │                     │
│         │    ┌────────▼─────┐       │                     │
│         │    │ OpenAI GPT-4 │       │                     │
│         │    │  Deepgram    │       │                     │
│         │    └──────────────┘       │                     │
│         │                            │                     │
│         └────────────┬───────────────┘                     │
│                      │                                     │
│              ┌───────▼────────┐                           │
│              │   PostgreSQL   │                           │
│              │    Database    │                           │
│              └────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```