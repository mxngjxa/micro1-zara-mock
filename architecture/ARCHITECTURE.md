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

***

## **CURRENT STATUS: PHASE 0 - IN PROGRESS**

**✅ Completed:**
- Monorepo structure initialized (backend with NestJS)
- TypeScript configuration (strict mode)
- Basic project scaffolding
- Development environment setup

**🚧 In Progress:**
- Database schema definition and migrations
- Environment configuration
- Docker Compose setup
- Shared types and interfaces

***

## **IMPLEMENTATION PHASES**

### **PHASE 0: FOUNDATION** (Week 1) - **CURRENT**

**Objective**: Complete monorepo structure, database schema, and LiveKit setup.

**Requirements:**

#### Project Structure
```
/project-root
  /frontend              # React + Vite + LiveKit Components
  /backend               # NestJS REST API (currently in progress)
  /agent                 # Python LiveKit Agent
  /shared                # TypeScript types/interfaces
  docker-compose.yml
  README.md
```

#### Database Schema
**Required Entities:**
- **users**: id (UUID), email (unique), password_hash, email_verified (boolean), created_at, last_login
- **interviews**: id (UUID), user_id (FK), job_role, difficulty (ENUM: EASY/MEDIUM/HARD), topics (array), status (ENUM: PENDING/IN_PROGRESS/COMPLETED), overall_score, completed_questions, started_at, completed_at
- **questions**: id (UUID), interview_id (FK), content (text), expected_answer (text), difficulty, topic, order (integer), evaluation_criteria (text)
- **answers**: id (UUID), question_id (FK), transcript (text), audio_url (optional), evaluation_json (jsonb), score (0-100), feedback (text), duration_seconds, created_at
- **interview_sessions**: id (UUID), interview_id (FK), livekit_room_name, livekit_session_id, started_at, ended_at, status

#### Environment Configuration
**Backend (.env):**
```
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRATION=24h
REFRESH_TOKEN_EXPIRATION=7d

# LiveKit
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

# Google Gemini
GOOGLE_API_KEY=...
```

**Agent (.env):**
```
LIVEKIT_URL=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
GOOGLE_API_KEY=...
NESTJS_API_URL=http://localhost:3000
```

#### Key Deliverables
- TypeORM migrations for all entities
- Global error handling middleware (NestJS)
- Winston logger configuration
- Docker Compose for PostgreSQL
- Swagger/OpenAPI documentation setup
- Shared TypeScript types exported from `/shared`

**Acceptance Criteria:**
- ✓ `docker-compose up` starts PostgreSQL
- ✓ Database migrations run successfully
- ✓ Backend API accessible at `http://localhost:3000`
- ✓ Swagger docs at `http://localhost:3000/api/docs`
- ✓ Zero TypeScript errors
- ✓ LiveKit account created and API keys obtained

***

### **PHASE 1: AUTHENTICATION** (Week 1-2)

**Objective**: Secure JWT-based authentication with email verification.

#### Backend Requirements

**Auth Module Components:**
1. **User Service**
   - Create user with bcrypt password hashing (10 rounds)
   - Email verification token generation
   - Password validation
   - User lookup by email

2. **Auth Service**
   - User registration with JWT token generation
   - Login with credential validation
   - Refresh token mechanism
   - Token validation strategy

3. **Security Middleware**
   - JWT strategy with Bearer token extraction
   - JwtAuthGuard for protected routes
   - @Public() decorator for public endpoints
   - @CurrentUser() decorator for user extraction

4. **DTOs with Validation**
   - RegisterDto: Email validation, minimum 8 chars, password complexity
   - LoginDto: Email and password required
   - Use class-validator decorators

#### Frontend Requirements

**Auth Client Components:**
1. **Auth Service**
   - Registration, login, logout methods
   - Token management in localStorage (with XSS protection)
   - Auto-refresh token before expiration
   - Current user fetching

2. **State Management (Zustand)**
   - user, isAuthenticated, isLoading state
   - login, register, logout, checkAuth actions

3. **API Client**
   - Axios interceptors for Authorization header
   - 401 handling with token refresh or redirect

4. **UI Components**
   - LoginPage with form validation
   - RegisterPage with password strength indicator
   - EmailVerificationPage
   - ProtectedRoute wrapper component

#### Security Requirements
- Password hashing with bcrypt (never store plaintext)
- JWT signature validation
- Rate limiting: 5 attempts per 15 minutes on auth endpoints
- HTTPS in production with HSTS headers
- CORS whitelist configuration
- Input sanitization with class-validator

**Acceptance Criteria:**
- ✓ User registration with email/password
- ✓ Email verification flow
- ✓ JWT token issuance and validation
- ✓ Protected routes require authentication
- ✓ Token refresh mechanism
- ✓ Password complexity enforcement
- ✓ Unit test coverage >80%

***

### **PHASE 2: LIVEKIT INTEGRATION & VOICE INFRASTRUCTURE** (Week 2-3)

**Objective**: Integrate LiveKit Agent Platform with Gemini Live API for voice communication.

#### LiveKit Agent Requirements (Python)

**Agent Configuration:**
- Install dependencies: `livekit-agents[google]`, `livekit-plugins-noise-cancellation`, `httpx`
- Download model files for turn detection and noise cancellation
- Configure AgentSession with Gemini Live API integration

**Agent Capabilities:**
1. **Interview Orchestration**
   - Connect to LiveKit rooms based on metadata
   - Fetch interview details from NestJS backend
   - Ask questions sequentially using Gemini Live API
   - Detect when user finishes speaking (turn detection)
   - Send transcripts to NestJS for evaluation
   - Handle interview completion

2. **Gemini Live API Integration**
   - Model: `gemini-2.5-flash-native-audio-preview-09-2025`
   - Voice: Configurable (default: "Puck")
   - Temperature: 0.7 for natural conversation
   - Modalities: Audio-only for voice interaction
   - System instructions for professional interviewer behavior

3. **Audio Processing**
   - Multilingual turn detection
   - Noise cancellation for audio input
   - Real-time audio streaming
   - Transcript event handling (interim and final)

#### NestJS Backend Requirements

**LiveKit Integration Service:**
1. **Token Generation**
   - Generate short-lived access tokens (1 hour)
   - Room-specific grants
   - Participant identity management

2. **Room Management**
   - Create rooms with interview metadata
   - Set room timeout (5 minutes for empty rooms)
   - Delete rooms after interview completion
   - Limit participants (1 user + 1 agent)

**Interview Service Updates:**
1. **Interview Lifecycle**
   - Create interview and generate questions via Gemini API
   - Start interview: Create LiveKit room, return token and URL
   - Get interview details for agent
   - Get next question based on adaptive difficulty
   - Complete interview: Calculate scores, delete room

2. **Question Generation (Gemini API)**
   - Generate N questions for job role and difficulty
   - Parse JSON response with structured format
   - Validate question structure
   - Implement retry with exponential backoff
   - Cache common question sets

3. **Answer Evaluation (Gemini API)**
   - Evaluate transcript against expected answer
   - Return structured scores: correctness, completeness, clarity
   - Calculate overall_score with weighted formula
   - Provide constructive feedback

**Answers Service:**
- Create answer with transcript from agent
- Trigger evaluation via Gemini API
- Store evaluation results in database
- Update interview progress

#### Frontend Requirements (React + LiveKit)

**LiveKit React Components:**
1. **Interview Session Page**
   - LiveKitRoom component with server URL and token
   - useVoiceAssistant hook for agent state
   - BarVisualizer for audio visualization
   - RoomAudioRenderer for audio playback
   - VoiceAssistantControlBar for controls

2. **UI State Management**
   - Display current question
   - Show agent state (initializing, listening, thinking, speaking)
   - Audio level visualization
   - Processing indicators
   - Error handling and display

3. **User Flow**
   - Connect to LiveKit room on interview start
   - Listen to questions from agent
   - Speak answers (auto-detected when finished)
   - Show real-time feedback
   - Navigate to report on completion

**Interview Service (Frontend):**
- Create interview
- Start interview and receive LiveKit credentials
- List user's interviews
- Get interview report

**Acceptance Criteria:**
- ✓ LiveKit agent connects to rooms automatically
- ✓ Gemini Live API provides natural voice interaction
- ✓ Turn detection works seamlessly (no manual stop)
- ✓ Noise cancellation improves audio quality
- ✓ Transcripts sent to NestJS in real-time
- ✓ Questions flow naturally from agent
- ✓ Audio latency <500ms
- ✓ Frontend visualizer shows agent state
- ✓ Interview completes and room is cleaned up
- ✓ Works on Chrome, Firefox, Safari

***

### **PHASE 3: INTERVIEW ENGINE & BUSINESS LOGIC** (Week 3-4)

**Objective**: Complete interview lifecycle with adaptive difficulty and comprehensive reporting.

#### Backend Requirements

**Interview Engine:**
1. **Interview Creation**
   - Validate parameters (5-20 questions)
   - Generate contextual questions via Gemini
   - Store questions with order and metadata
   - Support multiple job roles and difficulties

2. **Adaptive Difficulty Logic**
   - Track previous answer scores
   - Adjust question difficulty based on performance:
     * Score ≥80: Increase to HARD
     * Score 50-79: Maintain difficulty
     * Score <50: Decrease to EASY
   - Select next unanswered question with preferred difficulty

3. **Interview Completion**
   - Calculate overall score (average of all answers)
   - Analyze performance trend (improving/declining/consistent)
   - Calculate interview duration
   - Update status and timestamps

4. **Report Generation**
   - Aggregate all answers with evaluations
   - Calculate category scores
   - Generate personalized insights via Gemini:
     * Overall performance analysis
     * Strengths and weaknesses identification
     * 3-5 actionable recommendations
     * Learning resource suggestions

5. **Access Control**
   - User-specific interview access
   - Authorization checks on all endpoints
   - Audit logging for compliance

**Questions Service:**
- Bulk question creation with ordering
- Question lookup with relations
- Adaptive difficulty selection algorithm

**Answers Service:**
- Answer creation with transcript
- Trigger async evaluation
- Store evaluation results
- Update interview progress counter

#### Frontend Requirements

**Interview Setup Page:**
- Job role selection (dropdown with common roles + custom)
- Difficulty level (Junior/Mid/Senior radio buttons)
- Topic selection (multi-select checkboxes)
- Question count slider (5-20)
- Estimated duration display
- Question preview samples
- Form validation and submission

**Interview Report Page:**
1. **Overall Score Section**
   - Circular gauge visualization (0-100)
   - Color-coded performance (green/yellow/red)
   - Performance trend indicator

2. **Category Breakdown**
   - Horizontal bar charts
   - Technical Accuracy score
   - Completeness score
   - Communication score

3. **Question-by-Question Analysis**
   - Expandable accordion for each question
   - User transcript display
   - Score with color indicator
   - AI feedback and suggestions
   - Strengths and improvements lists

4. **Insights & Recommendations**
   - Personalized insights from Gemini
   - Actionable next steps
   - Learning resource links

5. **Action Buttons**
   - Download report (PDF)
   - Retake interview
   - Share report (optional)

**Dashboard Page:**
- User greeting and statistics cards
- Interview history table with sorting
- Quick actions (start new interview, continue in-progress)
- Pagination for interview list

**Acceptance Criteria:**
- ✓ Interview creation with custom parameters
- ✓ Questions generated contextually by Gemini
- ✓ Adaptive difficulty based on performance
- ✓ All interview data persisted
- ✓ Comprehensive post-interview report
- ✓ Personalized insights from Gemini
- ✓ Users can only access own data
- ✓ Question generation <5 seconds
- ✓ Answer evaluation <3 seconds
- ✓ Report generation <2 seconds

***

### **PHASE 4: SECURITY, TESTING & PRODUCTION** (Week 4-5)

**Objective**: Harden security, implement comprehensive testing, deploy to production.

#### Security Requirements

**Rate Limiting:**
- Auth endpoints: 5 requests/15min per IP
- Interview start: 3 requests/hour per user
- Question generation: 20 requests/hour per session
- General API: 100 requests/15min per user
- Use @nestjs/throttler with Redis for distributed systems

**Input Validation:**
- class-validator on all DTOs
- whitelist: true (strip unknown properties)
- transform: true (auto-type conversion)
- Custom validators for business rules
- DOMPurify for frontend sanitization

**Security Headers:**
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- Use helmet middleware

**SQL Injection Prevention:**
- TypeORM parameterized queries
- Never concatenate user input
- Validate all IDs as UUIDs

**XSS Protection:**
- Sanitize user-generated content
- React JSX escaping
- DOMPurify for rich text

**CSRF Protection:**
- SameSite=Strict cookies
- CSRF tokens for state-changing ops
- Origin header validation

**Audit Logging:**
- Log auth events
- Log interview operations
- Log sensitive data access
- Include: userId, timestamp, action, result, IP

**LiveKit-Specific Security:**
- Short-lived tokens (1 hour max)
- Room-specific grants
- Participant identity validation
- Room timeout (5 minutes empty)
- Delete rooms after completion

#### Testing Requirements

**Backend Unit Tests (Jest):**
- Test all service methods in isolation
- Mock dependencies (repositories, external APIs)
- Coverage >80%
- Test suites: AuthService, GeminiService, InterviewsService, QuestionsService

**Backend Integration Tests:**
- Test API endpoints with supertest
- Use test database
- Test authentication flows
- Test WebSocket events if applicable

**Frontend Unit Tests (Vitest + React Testing Library):**
- Test components in isolation
- Mock API calls and LiveKit
- Test user interactions
- Test suites: LoginPage, InterviewSessionPage, ProtectedRoute

**E2E Tests (Cypress/Playwright):**
- Test complete user journeys
- Registration → login → interview → report
- Voice recording and transcription flow
- Use seeded test data

**Load Testing (Artillery/k6):**
- Concurrent interview sessions
- LiveKit connection limits
- Database performance
- API response times under load

**LiveKit Integration Tests:**
- Agent initialization
- Question flow orchestration
- NestJS API integration
- Error handling

#### Production Deployment Requirements

**Environment Setup:**
- Strong JWT secrets (256-bit random)
- Managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- HTTPS enforced
- CORS whitelist for specific domains

**Database:**
- Automated migrations in CI/CD
- Pre-migration backups
- Staging environment testing
- Rollback procedures

**Docker:**
- Multi-stage builds for optimization
- Prune dev dependencies in production
- Security scan with Trivy
- .dockerignore configuration

**Infrastructure:**
- Container orchestration (Kubernetes/Docker Swarm)
- Load balancer for horizontal scaling
- Redis for caching and rate limiting
- CDN for static assets
- S3/equivalent for audio storage (if needed)

**Monitoring & Observability:**
- Application monitoring (New Relic, Datadog, Grafana)
- Log aggregation (ELK stack or cloud)
- Error tracking (Sentry)
- Uptime monitoring
- Key metrics: API response times, WebSocket connections, interview completion rate, Gemini API latency/cost

**CI/CD Pipeline:**
- Lint and format check
- Run unit tests
- Run integration tests
- Build Docker images
- Deploy to staging
- Run E2E tests
- Manual approval for production
- Deploy to production
- Smoke tests
- Rollback on failure

**Backup & Recovery:**
- Automated daily database backups
- 30-day retention
- Monthly restore testing
- Multi-region deployment for HA

**LiveKit Agent Deployment:**
- Deploy to LiveKit Cloud via CLI
- Configure scaling (min/max idle agents)
- Set request timeout (5 minutes)
- Environment variables for NestJS API URL

**Acceptance Criteria:**
- ✓ All security headers implemented
- ✓ Rate limiting on endpoints
- ✓ Input validation on all endpoints
- ✓ Unit test coverage >80%
- ✓ Integration tests passing
- ✓ E2E tests covering full flows
- ✓ Docker images optimized and scanned
- ✓ CI/CD pipeline configured
- ✓ Monitoring and logging in place
- ✓ Documentation complete
- ✓ Production deployment successful

***

## **TECHNOLOGY STACK SUMMARY**

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 18 + TypeScript + Vite | UI framework |
| | LiveKit React Components | Voice UI, visualizers, controls |
| | TailwindCSS | Styling and responsive design |
| | Zustand | State management |
| **Backend** | NestJS + TypeScript | REST API and business logic |
| | TypeORM | Database ORM |
| | PostgreSQL | Relational database |
| | JWT + bcrypt | Authentication |
| | Winston | Logging |
| **Voice AI** | LiveKit Agent Platform (Python) | Real-time voice orchestration |
| | Gemini Live API (via LiveKit) | Natural voice conversation |
| | LiveKit Turn Detection | Speech detection |
| | LiveKit Noise Cancellation | Audio enhancement |
| **AI Services** | Google Gemini API | Question generation, evaluation |
| **Infrastructure** | LiveKit Cloud | WebRTC transport, agent hosting |
| | Docker + Docker Compose | Local development |
| | LiveKit CLI | Agent deployment |

***

## **SUCCESS METRICS**

- **Performance**: API response <200ms, Voice latency <300ms, Evaluation <3s
- **Reliability**: 99.9% uptime, Graceful error handling, Auto-reconnection
- **Security**: No vulnerabilities, E2E encryption, Token-based access
- **User Experience**: Natural conversation, Clear feedback, No manual controls
- **Code Quality**: >80% test coverage, TypeScript strict, Well-documented
- **Scalability**: Auto-scaling via LiveKit, Stateless design, Efficient queries

***

## **COST ESTIMATION (LiveKit Cloud)**

**Free Tier:**
- 1,000 agent session minutes/month
- ~33 interviews (30 min each)
- Suitable for MVP and testing

**Production Pricing:**
- Pay-as-you-go: $0.06/minute per participant
- 30-min interview ≈ $1.80
- 1,000 interviews/month ≈ $1,800/month
- Includes WebRTC infrastructure, agent hosting, global edge network

**Alternative:**
- Self-host LiveKit Server (open source)
- Deploy agents to own infrastructure
- Pay only for compute resources

***

## **KEY ARCHITECTURAL DECISIONS**

### **Why LiveKit vs. Custom WebSocket?**
- **Production-ready**: Powers ChatGPT Advanced Voice Mode
- **Lower latency**: WebRTC optimized for audio (<300ms vs. 500ms)
- **Built-in features**: Turn detection, noise cancellation
- **Auto-scaling**: No infrastructure management
- **Cost-effective**: Free tier + reasonable production pricing

### **Why Separate Python Agent?**
- **Native LiveKit support**: Python SDK is mature and feature-complete
- **Gemini Live API**: Best integration via LiveKit plugin
- **Separation of concerns**: Voice logic isolated from business logic
- **Independent scaling**: Agent scales independently of NestJS API

### **Why NestJS for Backend?**
- **TypeScript**: Type safety across stack
- **Dependency injection**: Testable, maintainable code
- **Architecture**: Built-in support for DDD, SOLID
- **Ecosystem**: Rich plugin ecosystem
- **Team familiarity**: Current implementation in progress

***

## **NEXT IMMEDIATE STEPS**

1. **Complete Phase 0** (Database + Environment):
   - Finalize database migrations for all entities
   - Set up Docker Compose with PostgreSQL
   - Configure environment variables
   - Create shared TypeScript types
   - Set up LiveKit Cloud account and obtain API keys

2. **Begin Phase 1** (Authentication):
   - Implement User and Auth services in NestJS
   - Set up JWT strategy and guards
   - Create frontend auth components
   - Implement protected routes

3. **Prepare for Phase 2** (LiveKit):
   - Install LiveKit CLI
   - Study LiveKit Agent quickstart
   - Review Gemini Live API documentation
   - Plan agent-backend integration points