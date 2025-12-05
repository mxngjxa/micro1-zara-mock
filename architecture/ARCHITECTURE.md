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

## **IMPLEMENTATION PHASES**

### **PHASE 0: FOUNDATION (Week 1)**

**Objective**: Establish monorepo structure, development environment, database schema, and shared types.

**Deliverables:**
```
/project-root
  /frontend (React + Vite)
  /backend (NestJS)
  /shared (TypeScript types)
  docker-compose.yml
```

**Key Tasks:**
1. Initialize monorepo with proper folder structure
2. Configure TypeScript (strict mode) for both projects
3. Set up PostgreSQL with TypeORM migrations
4. Create database entities: User, Interview, Question, Answer
5. Implement global error handling and logging (Winston)
6. Configure Docker Compose for local development
7. Set up environment variables with validation
8. Create shared TypeScript interfaces and DTOs

**Database Schema:**
- **users**: id, email, password_hash, email_verified, created_at, last_login
- **interviews**: id, user_id, job_role, difficulty, topics[], status, overall_score, completed_questions, started_at
- **questions**: id, interview_id, content, expected_answer, difficulty, topic, order, evaluation_criteria
- **answers**: id, question_id, transcript, audio_url, evaluation_json, score, feedback, duration_seconds

**Acceptance Criteria:**
✓ `docker-compose up` starts all services
✓ Database migrations execute successfully
✓ Backend API accessible with Swagger docs
✓ Frontend runs with hot-reload
✓ Zero TypeScript errors across projects

***

### **PHASE 1: AUTHENTICATION (Week 1-2)**

**Objective**: Implement secure JWT-based authentication with email verification and session management.

**Backend Implementation:**
```typescript
PSEUDOCODE - Auth Module:

1. User Service:
   - create(email, password): Hash with bcrypt (10 rounds), generate verification token
   - findByEmail(email): Query user for login
   - validatePassword(user, password): Compare with bcrypt
   - verifyEmail(token): Mark email as verified

2. Auth Service:
   - register(dto): Create user, generate JWT tokens (access: 24h, refresh: 7d)
   - login(dto): Validate credentials, return tokens
   - refreshToken(token): Generate new access token
   - validateUser(userId): Verify user exists for JWT strategy

3. JWT Strategy:
   - Extract Bearer token from Authorization header
   - Validate signature with JWT_SECRET
   - Attach user to request

4. Guards & Decorators:
   - JwtAuthGuard: Protect routes requiring authentication
   - @Public(): Decorator to bypass auth on specific endpoints
   - @CurrentUser(): Extract user from request

5. DTOs with Validation:
   - RegisterDto: @IsEmail, @MinLength(8), password complexity regex
   - LoginDto: @IsEmail, @IsNotEmpty
```

**Frontend Implementation:**
```typescript
PSEUDOCODE - Auth Client:

1. Auth Service (services/auth.service.ts):
   - register(email, password): POST /auth/register, store tokens
   - login(email, password): POST /auth/login, store tokens
   - logout(): Clear tokens, redirect to /login
   - getCurrentUser(): GET /auth/me
   - refreshToken(): POST /auth/refresh with refresh token
   - Token storage: localStorage (with XSS protection via DOMPurify)

2. Auth Store (Zustand):
   - State: user, isAuthenticated, isLoading
   - Actions: login, register, logout, checkAuth, setUser

3. API Client with Interceptors:
   - Request: Attach Authorization header from localStorage
   - Response: Handle 401 by refreshing token or redirecting to login

4. Protected Route Component:
   - Check isAuthenticated from store
   - Show loading spinner while checking
   - Redirect to /login if not authenticated

5. UI Components:
   - LoginPage: Email/password inputs, error display, "Remember me"
   - RegisterPage: Email, password, confirm password, strength indicator
   - EmailVerificationPage: Token-based verification
```

**Security Requirements:**
- Password hashing with bcrypt (never store plaintext)
- JWT signature validation on every protected request
- Rate limiting on auth endpoints (5 attempts per 15 min)
- HTTPS in production with HSTS headers
- CORS whitelist for allowed origins
- Input sanitization with class-validator

**Acceptance Criteria:**
✓ Users can register with email/password
✓ Email verification flow works
✓ Login returns valid JWT tokens
✓ Protected routes require authentication
✓ Token refresh works before expiration
✓ Password complexity enforced
✓ Unit tests >80% coverage

***

### **PHASE 2: GEMINI INTEGRATION & VOICE INFRASTRUCTURE (Week 2-3)**

**Objective**: Integrate Gemini API for AI capabilities and implement real-time voice communication.

**Backend Implementation:**

```typescript
PSEUDOCODE - Gemini Service:

1. Initialize Gemini SDK:
   import { GoogleGenerativeAI } from '@google/generative-ai'
   
   genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
   model = genAI.getGenerativeModel({ model: 'gemini-pro' })

2. Question Generation:
   generateQuestions(jobRole, difficulty, topics, count):
     - Build prompt: "Generate {count} questions for {jobRole} at {difficulty} level"
     - Specify JSON output format with: content, expected_answer, difficulty, topic
     - Call model.generateContent(prompt)
     - Parse JSON response
     - Validate and return questions
     - Implement retry with exponential backoff (3 attempts)
     - Cache common question sets (Redis or in-memory)

3. Answer Evaluation:
   evaluateAnswer(question, expectedAnswer, transcript):
     - Build evaluation prompt with scoring rubric
     - Request JSON output: correctness, completeness, clarity, feedback, strengths, improvements
     - Calculate overall_score = (correctness * 0.5 + completeness * 0.3 + clarity * 0.2)
     - Return structured evaluation object
     - Log all evaluations for quality assurance

4. Conversational Interactions:
   generateResponse(context, userInput):
     - Generate natural responses for interview guidance
     - Handle edge cases (unclear answers, off-topic responses)
     - Return encouraging, professional feedback
```

```typescript
PSEUDOCODE - Speech Services:

1. Text-to-Speech (Google Cloud TTS):
   synthesize(text, voice='en-US-Neural2-A'):
     - Call Google Cloud TTS API
     - Configuration: audioEncoding='MP3', speakingRate=1.0
     - Return audio buffer (MP3 format)
     - Cache common phrases (< 200 chars) to reduce API calls
     - Implement rate limiting and exponential backoff

2. Speech-to-Text (Google Cloud Speech):
   createStreamingRecognition():
     - Initialize streaming recognize with config:
       * encoding='LINEAR16', sampleRate=16000, language='en-US'
       * enableAutomaticPunctuation=true
       * model='latest_long' for better accuracy
     - Return stream and onTranscript callback
     - Emit both interim (partial) and final results
     - Handle errors gracefully with fallback

   transcribeAudioBuffer(audioBuffer):
     - For batch transcription of complete recordings
     - Use for stored audio file processing
```

```typescript
PSEUDOCODE - WebSocket Gateway:

@WebSocketGateway({ namespace: '/voice', cors: true })
VoiceGateway:

1. Connection Management:
   - handleConnection(client): Log connection, initialize session
   - handleDisconnect(client): Cleanup session, end STT stream

2. Event Handlers:
   
   @SubscribeMessage('startInterview'):
     - Initialize interview session
     - Get first question from database
     - Generate TTS audio for question
     - Emit 'question' event with audio buffer (base64)
   
   @SubscribeMessage('audioStream'):
     - Receive audio chunks (base64 encoded)
     - Convert to buffer and accumulate
     - Stream to STT service
     - Emit 'transcript' events (partial and final)
   
   @SubscribeMessage('stopRecording'):
     - End STT stream
     - Get final transcript
     - Emit 'processing' status
     - Evaluate answer with Gemini
     - Save answer and evaluation to database
     - Determine next question based on score:
       * Score >= 80: Increase difficulty
       * Score 50-79: Same difficulty
       * Score < 50: Decrease difficulty (min EASY)
     - If interview complete: emit 'interviewComplete' with report
     - Else: emit next 'question' event
   
   @SubscribeMessage('skipQuestion'):
     - Mark answer as skipped
     - Proceed to next question

3. Session Management:
   - In-memory Map with clientId as key
   - Store: interviewId, currentQuestion, audioChunks, transcript, sttStream
   - Cleanup on disconnect or interview completion
```

**Frontend Implementation:**

```typescript
PSEUDOCODE - Audio Hooks:

1. useAudioRecorder():
   State: isRecording, audioLevel, permissionStatus
   
   Methods:
   - requestPermission(): getUserMedia({ audio: true })
   - startRecording(onChunk):
     * Initialize MediaRecorder with 'audio/webm;codecs=opus'
     * Setup Web Audio API for visualization (AnalyserNode)
     * Start recording with 250ms chunks
     * Calculate RMS amplitude for audio level meter
     * Call onChunk callback for each audio chunk
   
   - stopRecording(): Stop MediaRecorder, reset state
   - cleanup(): Stop all tracks, close AudioContext

2. useAudioPlayer():
   State: isPlaying, duration, currentTime
   
   Methods:
   - play(audioUrl): Load and play audio using HTML5 Audio API
   - pause(): Pause playback
   - onEnded: Callback when playback completes

3. useSilenceDetection(audioLevel, threshold=0.05, duration=1500):
   - Track consecutive silence duration
   - Reset on any speech detection
   - Emit 'silenceDetected' after duration threshold
   - Used for automatic question advancement
```

```typescript
PSEUDOCODE - Voice WebSocket Client:

class VoiceSocketClient:
  - connect(): Initialize socket.io connection to /voice namespace
  - Setup event listeners:
    * 'connect': Log connection
    * 'question': Update UI, play TTS audio
    * 'transcript': Update transcript display in real-time
    * 'evaluation': Show score and feedback
    * 'processing': Show loading indicator
    * 'interviewComplete': Navigate to report page
    * 'error': Display error message
  
  - startInterview(interviewId): Emit to backend
  - sendAudioChunk(blob): Convert to base64 and emit
  - stopRecording(): Signal end of answer
  - skipQuestion(): Skip current question
  - disconnect(): Clean up listeners and close connection
```

```typescript
PSEUDOCODE - Interview Session Page:

InterviewSessionPage Component:
  State:
  - currentQuestion, transcript, isProcessing, progress, error
  - audioLevel (from useAudioRecorder)
  
  Lifecycle:
  - useEffect on mount:
    * Connect to voice WebSocket
    * Setup all event listeners
    * Start interview
    * Cleanup on unmount
  
  UI Sections:
  1. Progress Bar: "Question X of Y" with percentage
  2. Question Display: Large, prominent text
  3. Microphone Control:
     - Large circular button (🎤 or 🔴)
     - Click to start/stop recording
     - Audio level visualization (horizontal bar)
     - Status text: "Click to speak" / "Click to stop"
  4. Live Transcript: Real-time display with auto-scroll
  5. Action Buttons: "Skip Question" (with confirmation)
  6. Processing Indicator: Spinner with "Evaluating..."
  7. Error Display: Red banner for errors
  8. Hidden Audio Element: For TTS playback
  
  User Flow:
  1. Question appears with TTS audio
  2. User clicks mic button to speak
  3. Live transcript updates in real-time
  4. Silence detection (1.5s) auto-stops recording OR user clicks stop
  5. "Evaluating..." message displays
  6. Brief feedback toast shows score
  7. Next question appears automatically
  8. Repeat until all questions answered
  9. Navigate to report page
```

**Acceptance Criteria:**
✓ Gemini generates contextual questions based on job role
✓ Users speak and see live transcription
✓ TTS plays questions with clear audio
✓ Silence detection triggers automatic advance after 1.5s
✓ WebSocket maintains stable connection
✓ Audio latency <500ms
✓ Evaluation completes <3 seconds
✓ Microphone permission handled gracefully
✓ Fallback to text input if voice unavailable
✓ Works on Chrome, Firefox, Safari

***

### **PHASE 3: INTERVIEW ENGINE & BUSINESS LOGIC (Week 3-4)**

**Objective**: Complete interview lifecycle management with adaptive difficulty and comprehensive reporting.

**Backend Implementation:**

```typescript
PSEUDOCODE - Interviews Service:

1. Create Interview:
   create(userId, dto):
     - Validate: 5 <= total_questions <= 20
     - Create interview entity (status=PENDING)
     - Generate questions using Gemini
     - Save questions to database with order
     - Return interview with first question

2. Start Interview:
   start(id):
     - Update status to IN_PROGRESS
     - Set started_at timestamp
     - Return interview

3. Question Sequencing:
   getNextQuestion(interviewId, previousScore):
     - Get all questions ordered by 'order' field
     - Find first unanswered question
     - Adaptive difficulty logic:
       * If previousScore >= 80: Prefer HARD questions from remaining
       * If previousScore 50-79: Same difficulty
       * If previousScore < 50: Prefer EASY questions from remaining
     - Return next question or null if complete

4. Complete Interview:
   complete(id):
     - Calculate overall_score (average of all answer scores)
     - Analyze performance trend:
       * Compare first half vs second half scores
       * IMPROVING if difference > 5
       * DECLINING if difference < -5
       * CONSISTENT otherwise
     - Calculate duration_minutes
     - Update status to COMPLETED
     - Set completed_at timestamp

5. Generate Report:
   generateReport(id):
     - Aggregate all answers with evaluations
     - Calculate category scores (correctness, completeness, clarity)
     - Generate personalized insights using Gemini:
       * Analyze overall performance
       * Identify strengths and weaknesses
       * Provide 3-5 actionable recommendations
       * Suggest learning resources
     - Return comprehensive report object

6. User Access Control:
   - Ensure users can only access their own interviews
   - Implement authorization checks in all methods
   - Log all access attempts for audit trail
```

```typescript
PSEUDOCODE - Questions Service:

1. createBulk(interviewId, questions[]):
   - Create question entities with interview_id
   - Assign order (1, 2, 3, ...)
   - Store evaluation_criteria from Gemini response
   - Bulk insert to database

2. findById(id):
   - Query question with answer relation
   - Throw NotFoundException if not found

3. Adaptive Difficulty Selection:
   selectQuestionByDifficulty(unanswered[], preferredDifficulty):
     - Filter questions by preferred difficulty
     - If none available, select closest difficulty
     - Return question or fallback to first unanswered
```

```typescript
PSEUDOCODE - Answers Service:

1. create(dto):
   - Create answer entity with:
     * question_id
     * transcript (from STT)
     * evaluation_json (from Gemini)
     * score (overall score from evaluation)
     * feedback (text feedback)
     * duration_seconds
   - Save to database
   - Update interview.completed_questions counter
   - Return answer

2. findByQuestionId(questionId):
   - Query answer for specific question
   - Used to check if question already answered
```

**Frontend Implementation:**

```typescript
PSEUDOCODE - Interview Setup Page:

InterviewSetupPage Component:
  Form fields:
  - Job Role: Dropdown (Frontend, Backend, Data Science, DevOps) + "Custom"
  - Difficulty: Radio buttons (Junior, Mid, Senior)
  - Topics: Multi-select checkboxes (React, TypeScript, Node.js, Python, SQL, etc.)
  - Question Count: Slider (5-20 questions)
  
  Display:
  - Estimated duration: {count * 3} minutes
  - Question preview: Sample questions for selected role
  
  Validation:
  - At least 1 topic selected
  - Valid question count range
  
  Submit:
  - POST /api/interviews with DTO
  - Navigate to /interview/:id on success
  - Show error toast on failure
```

```typescript
PSEUDOCODE - Interview Report Page:

InterviewReportPage Component:
  Data fetching:
  - useEffect: GET /api/interviews/:id/report
  - Loading state with skeleton
  
  UI Sections:
  1. Overall Score Card:
     - Large circular gauge (0-100)
     - Color-coded: Green (80+), Yellow (60-79), Red (<60)
     - Performance trend badge (↗ Improving, ↘ Declining, → Consistent)
  
  2. Category Breakdown (Horizontal bar charts):
     - Technical Accuracy: X/100
     - Completeness: X/100
     - Communication: X/100
  
  3. Question-by-Question Analysis (Expandable accordion):
     For each question:
     - Question text
     - User's transcript (expandable)
     - Score and color indicator
     - AI feedback
     - Strengths (green checkmarks)
     - Improvements (yellow suggestions)
     - Audio playback button (if stored)
  
  4. Insights & Recommendations:
     - Personalized insights from Gemini
     - Actionable next steps
     - Learning resource links
  
  5. Actions:
     - Download Report (PDF)
     - Retake Interview (new session)
     - Share Report (optional feature)
```

```typescript
PSEUDOCODE - Dashboard Page:

DashboardPage Component:
  Display:
  - User greeting with name
  - Statistics cards:
    * Total interviews taken
    * Average score
    * Best performance (job role)
    * Time spent interviewing
  
  - Interview history table:
    * Date, Job Role, Difficulty, Score, Status
    * Click row to view report
    * "Continue" button for IN_PROGRESS interviews
  
  - "Start New Interview" prominent button
  
  Data:
  - GET /api/interviews (user's interviews)
  - Sort by most recent
  - Pagination (10 per page)
```

**Acceptance Criteria:**
✓ Interview creation with custom parameters
✓ Questions generated by Gemini contextually
✓ Adaptive difficulty based on performance
✓ All interview data persisted
✓ Comprehensive post-interview report
✓ Personalized insights from Gemini
✓ Users can only access their own data
✓ Question generation <5 seconds
✓ Answer evaluation <3 seconds
✓ Report generation <2 seconds

***

### **PHASE 4: SECURITY, TESTING & PRODUCTION (Week 4-5)**

**Objective**: Harden security, implement comprehensive testing, and prepare for production deployment.

**Security Implementation:**

```typescript
PSEUDOCODE - Security Measures:

1. Rate Limiting:
   - Auth endpoints: 5 requests/15min per IP
   - Interview start: 3 requests/hour per user
   - Question generation: 20 requests/hour per session
   - General API: 100 requests/15min per user
   - Use @nestjs/throttler or express-rate-limit
   - Store limits in Redis for distributed systems

2. Input Validation & Sanitization:
   - class-validator on all DTOs
   - whitelist: true (strip unknown properties)
   - transform: true (auto-type conversion)
   - Custom validators for business rules
   - Sanitize HTML in frontend with DOMPurify

3. Security Headers (helmet middleware):
   - Content-Security-Policy: default-src 'self'
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Strict-Transport-Security: max-age=31536000

4. SQL Injection Prevention:
   - TypeORM parameterized queries (default)
   - Never concatenate user input into queries
   - Validate all IDs as UUIDs

5. XSS Protection:
   - Sanitize all user-generated content
   - Use React's built-in JSX escaping
   - DOMPurify for rich text
   - Validate file uploads (if audio storage)

6. CSRF Protection:
   - SameSite=Strict on cookies
   - CSRF tokens for state-changing operations
   - Validate origin header

7. Audit Logging:
   - Log all auth events (login, register, logout)
   - Log interview operations (create, start, complete)
   - Log sensitive data access
   - Include: userId, timestamp, action, result, IP
```

**Testing Strategy:**

```typescript
PSEUDOCODE - Testing Implementation:

1. Backend Unit Tests (Jest):
   - Test all service methods in isolation
   - Mock dependencies (repositories, external APIs)
   - Test coverage >80%
   
   Example test suites:
   - AuthService: register, login, refresh token
   - GeminiService: question generation, evaluation
   - InterviewsService: create, complete, scoring
   - QuestionsService: adaptive difficulty selection

2. Backend Integration Tests:
   - Test API endpoints with supertest
   - Use test database (separate from dev)
   - Test authentication flows
   - Test WebSocket events
   
   Example tests:
   - POST /auth/register → 201 Created
   - POST /auth/login with invalid credentials → 401
   - POST /interviews without auth → 401
   - GET /interviews/:id with wrong user → 403

3. Frontend Unit Tests (Vitest + React Testing Library):
   - Test components in isolation
   - Mock API calls and WebSocket
   - Test user interactions
   
   Example tests:
   - LoginPage: Form submission, error handling
   - InterviewSessionPage: Mic button toggle, transcript update
   - ProtectedRoute: Redirect when not authenticated

4. E2E Tests (Cypress or Playwright):
   - Test complete user journeys
   - Use test environment with seeded data
   
   Example flows:
   - User registration → email verification → login → dashboard
   - Create interview → complete interview → view report
   - Voice recording → transcription → evaluation

5. Load Testing (Artillery or k6):
   - Concurrent interview sessions
   - WebSocket connection limits
   - Database query performance
   - API response times under load
```

**Production Deployment:**

```typescript
PSEUDOCODE - Deployment Configuration:

1. Environment Setup:
   Production .env:
   - NODE_ENV=production
   - Strong JWT secrets (256-bit random)
   - Database: Managed PostgreSQL (AWS RDS, Google Cloud SQL)
   - HTTPS enforced (Let's Encrypt or cloud provider)
   - CORS: Specific domain whitelist

2. Database Migrations:
   - Run migrations as part of deployment pipeline
   - Backup database before migrations
   - Test migrations in staging first
   - Rollback plan for failed migrations

3. Docker Production Images:
   Multi-stage builds:
   - Stage 1: Build (npm install, compile TypeScript)
   - Stage 2: Production (copy dist, prune dev dependencies)
   - Use .dockerignore to exclude node_modules, .env
   - Security scan images with Trivy

4. Infrastructure:
   - Container orchestration: Kubernetes or Docker Swarm
   - Load balancer for horizontal scaling
   - Redis for caching and rate limiting
   - CDN for static assets
   - S3 or equivalent for audio storage

5. Monitoring & Observability:
   - Application monitoring: New Relic, Datadog, or open-source Grafana
   - Log aggregation: ELK stack or cloud provider
   - Error tracking: Sentry
   - Uptime monitoring: Pingdom, UptimeRobot
   - Metrics: Response times, error rates, active users
   
   Key metrics to track:
   - API response times (p50, p95, p99)
   - WebSocket connection count
   - Interview completion rate
   - Gemini API latency and cost
   - Database query performance

6. CI/CD Pipeline:
   GitHub Actions / GitLab CI:
   - On push to main:
     * Run linters (ESLint, Prettier)
     * Run unit tests
     * Run integration tests
     * Build Docker images
     * Push to container registry
   - On push to production branch:
     * Run E2E tests
     * Deploy to staging
     * Manual approval
     * Deploy to production
     * Run smoke tests
   - Rollback on failure

7. Backup & Disaster Recovery:
   - Automated daily database backups
   - Retain backups for 30 days
   - Test restore process monthly
   - Multi-region deployment for high availability
```

**Documentation:**

```markdown
PSEUDOCODE - README.md Structure:

# Voice-Based AI Interview Agent

## Overview
Brief description of the project

## Architecture
- System diagram (use Mermaid or link to diagram)
- Tech stack summary
- Key design decisions

## Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Google Gemini API key

## Local Development Setup

### 1. Clone Repository
git clone <repo-url>
cd project-root

### 2. Environment Configuration
cp .env.example .env
# Edit .env with your credentials

### 3. Install Dependencies
cd backend && npm install
cd ../frontend && npm install

### 4. Start Services
docker-compose up

### 5. Run Migrations
cd backend && npm run migration:run

### 6. Seed Database (Optional)
npm run seed

## API Documentation
- Swagger UI: http://localhost:3000/api/docs
- Authentication endpoints
- Interview endpoints
- WebSocket events

## Frontend Development
- Development server: npm run dev
- Build: npm run build
- Test: npm run test

## Backend Development
- Development server: npm run start:dev
- Test: npm run test
- Test coverage: npm run test:cov

## Deployment
- Build Docker images
- Deploy to Kubernetes/Cloud provider
- Run database migrations
- Configure environment variables

## Testing
- Unit tests: npm run test
- Integration tests: npm run test:e2e
- E2E tests: npm run test:e2e:ui

## Troubleshooting
Common issues and solutions

## Contributing
Guidelines for contributions

## License
MIT License
```

**Acceptance Criteria:**
✓ All security headers implemented
✓ Rate limiting on sensitive endpoints
✓ Input validation on all endpoints
✓ Unit test coverage >80%
✓ Integration tests for critical flows
✓ E2E tests for user journeys
✓ Docker images optimized and scanned
✓ CI/CD pipeline configured
✓ Monitoring and logging in place
✓ Documentation complete
✓ Production deployment successful

***

## **FINAL DELIVERABLES**

### **Repository Structure**
```
/project-root
  /frontend
    - Complete React application
    - Voice recording and playback
    - Real-time transcription display
    - Interview session UI
    - Report generation UI
  /backend
    - NestJS API with all endpoints
    - Gemini API integration
    - WebSocket gateway
    - Database migrations
    - Comprehensive error handling
  /shared
    - TypeScript types and interfaces
  /docs
    - API documentation
    - Architecture diagrams
    - Deployment guides
  docker-compose.yml
  README.md
  .env.example
```

### **Optional: Demo Video (3-5 minutes)**
1. Project overview and architecture
2. User registration and login
3. Interview setup (job role, difficulty, topics)
4. Live voice interview demonstration
5. Real-time transcription
6. Answer evaluation
7. Final report with insights
8. Code walkthrough (highlights)

***

## **SUCCESS METRICS**

- **Performance**: API response <200ms, Voice latency <500ms, Evaluation <3s
- **Reliability**: 99.9% uptime, Graceful error handling, Session recovery
- **Security**: No vulnerabilities, Data encryption, Access control
- **User Experience**: Intuitive UI, Clear feedback, Natural conversation flow
- **Code Quality**: >80% test coverage, TypeScript strict, Well-documented
- **Scalability**: Horizontal scaling support, Stateless design, Efficient DB queries

***

## **KEY REMINDERS**

1. **Never hardcode values** - Use environment variables and configuration
2. **Think in layers** - Presentation → Business Logic → Data Access
3. **Error handling everywhere** - Graceful degradation, user-friendly messages
4. **Security by default** - Validate input, sanitize output, rate limit
5. **Test as you build** - Don't defer testing to the end
6. **Document decisions** - Why, not just what
7. **Iterate and refactor** - Build → Test → Refine
8. **Monitor from day one** - Logging, metrics, alerts

***

This comprehensive prompt synthesizes all three roadmaps, incorporates Gemini API throughout, and provides a clear step-by-step implementation path with architectural best practices. Each phase builds on the previous one, with clear deliverables and acceptance criteria.