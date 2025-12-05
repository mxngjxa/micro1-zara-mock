# **PHASE 0: FOUNDATION - Implementation Prompts**

***

## **PROMPT 1: FRONTEND ENGINEER**

### **Objective**
Set up the React + Vite frontend application with TypeScript strict mode, routing structure, state management, and API client configuration. Establish the foundational UI architecture for a voice-first interview platform.

### **Project Context**
You're building the client-side interface for a voice-based AI interview agent. The application must support real-time voice interaction, live transcription display, and seamless navigation between authentication, interview setup, interview session, and report pages.

### **Tasks**

**1. Initialize Frontend Application**
- Navigate to `/apps/frontend` directory
- Initialize Vite React project with TypeScript template
- Enable TypeScript strict mode in `tsconfig.json`
- Configure path aliases for clean imports (e.g., `@/components`, `@/services`)
- Set up `.env.example` with required environment variables

**2. Install Core Dependencies**
- React Router DOM for client-side routing
- TanStack React Query for server state management and caching
- Zustand for lightweight client state (auth, UI state)
- Axios for HTTP client with interceptor support
- Socket.io-client for WebSocket communication
- TailwindCSS with PostCSS and Autoprefixer for styling
- DOMPurify for XSS protection
- React Hook Form with validation resolver

**3. Create Folder Structure**
```
/apps/frontend/src
  /components          # Reusable UI components
    /common           # Buttons, inputs, cards, modals
    /layout           # Header, footer, sidebar
    /auth             # Login/register forms
    /interview        # Interview-specific components
  /pages              # Route-level components
    /auth             # Login, Register, VerifyEmail
    /dashboard        # User dashboard
    /interview        # Setup, Session, Report
  /hooks              # Custom React hooks
    /useAudioRecorder.ts
    /useAudioPlayer.ts
    /useSilenceDetection.ts
  /services           # API clients and business logic
    /api.client.ts    # Axios instance with interceptors
    /auth.service.ts
    /interview.service.ts
    /voice.socket.ts  # WebSocket client
  /stores             # Zustand state stores
    /auth.store.ts
    /interview.store.ts
  /types              # Component-specific TypeScript types
  /utils              # Helper functions and constants
  /config             # Configuration files
```

**4. Configure TailwindCSS**
- Initialize Tailwind with custom design tokens
- Define color palette (primary, secondary, success, error)
- Set up typography scale and spacing system
- Configure breakpoints for responsive design
- Add custom utilities for voice UI (pulse animations, audio visualizers)

**5. Set Up Routing**
- Configure React Router with these routes:
  - `/` - Landing page (public)
  - `/login` - Login page (public)
  - `/register` - Register page (public)
  - `/verify-email` - Email verification (public)
  - `/dashboard` - User dashboard (protected)
  - `/interview/setup` - Interview configuration (protected)
  - `/interview/:id` - Interview session (protected)
  - `/interview/:id/report` - Interview report (protected)
- Implement `ProtectedRoute` component wrapper
- Add loading states and error boundaries
- Configure scroll restoration and route transitions

**6. Create API Client Service**
- Initialize Axios instance with base URL from environment
- Implement request interceptor to attach JWT token from localStorage
- Implement response interceptor to:
  - Handle 401 errors (token expiration) → attempt refresh or logout
  - Handle network errors with user-friendly messages
  - Log all API errors for debugging
- Add retry logic with exponential backoff for failed requests
- Export typed API client for use in services

**7. Set Up State Management**
- Create auth store with Zustand:
  - State: `user`, `isAuthenticated`, `isLoading`
  - Actions: `login`, `logout`, `checkAuth`, `setUser`
  - Persist tokens in localStorage with secure access patterns
- Create interview store for session state management
- Configure React Query with appropriate cache times and stale thresholds

**8. Build Core UI Components**
- `Button` - Variants: primary, secondary, danger, ghost
- `Input` - Text, email, password with validation states
- `Card` - Container component with elevation
- `Modal` - Reusable modal with overlay
- `Loader` - Loading spinner with size variants
- `ErrorBoundary` - Catch and display component errors gracefully
- `Toast` - Notification system for success/error messages

**9. Implement Authentication Pages (UI Only)**
- **LoginPage**: Email/password form, validation, loading states, error display, link to register
- **RegisterPage**: Email, password, confirm password, strength indicator, terms checkbox
- **VerifyEmailPage**: Token validation display, success/error states
- Wire up forms to call placeholder API functions (actual integration in Phase 1)

**10. Create Dashboard Layout**
- Top navigation bar with logo and user menu
- Sidebar (optional) for future navigation
- Main content area with responsive grid
- Footer with links and version info
- Ensure layout works on mobile, tablet, desktop

**11. Environment Configuration**
- Create `.env.example` with:
  - `VITE_API_BASE_URL` - Backend API URL
  - `VITE_WS_URL` - WebSocket server URL
  - `VITE_ENV` - Development/production flag
- Document all environment variables in README
- Add `.env` to `.gitignore`

**12. Set Up Development Scripts**
- `dev` - Start development server with hot reload
- `build` - Production build with type checking
- `preview` - Preview production build locally
- `lint` - Run ESLint with auto-fix
- `format` - Run Prettier formatting
- `type-check` - TypeScript compilation check

### **Deliverables**
✓ React + Vite application running on `http://localhost:5173`
✓ TypeScript strict mode enabled with zero errors
✓ TailwindCSS configured with custom theme
✓ Routing structure with protected routes
✓ API client with interceptors configured
✓ Auth and interview stores initialized
✓ Core UI components library created
✓ Authentication pages (UI only) implemented
✓ Dashboard layout responsive and functional
✓ All dependencies installed and documented
✓ README with setup instructions and component documentation

### **Acceptance Criteria**
✓ `npm run dev` starts application without errors
✓ `npm run build` completes successfully
✓ All routes navigate correctly
✓ Protected routes redirect to login when not authenticated
✓ API client attaches authorization headers
✓ No console errors or warnings
✓ TypeScript compilation passes with strict mode
✓ Responsive design works on all breakpoints
✓ Code follows ESLint and Prettier standards

***

## **PROMPT 2: BACKEND ENGINEER**

### **Objective**
Set up the NestJS backend API with TypeScript, implement global middleware (logging, error handling, validation), configure environment management, establish module structure, and expose Swagger API documentation.

### **Project Context**
You're building the REST API and WebSocket server for a voice-based AI interview platform. The backend must handle secure authentication, interview session management, real-time voice transcription coordination, and AI-driven question generation/evaluation using Gemini API.

### **Tasks**

**1. Initialize NestJS Application**
- Navigate to `/apps/backend` directory
- Initialize NestJS project with CLI
- Enable TypeScript strict mode in `tsconfig.json`
- Configure path aliases for clean imports
- Set up `.env.example` with all required environment variables

**2. Install Core Dependencies**
- `@nestjs/config` - Environment variable management with validation
- `@nestjs/typeorm` and `typeorm` - ORM for PostgreSQL
- `pg` - PostgreSQL driver
- `@nestjs/jwt` and `@nestjs/passport` - Authentication
- `passport-jwt` - JWT strategy
- `bcrypt` and `@types/bcrypt` - Password hashing
- `class-validator` and `class-transformer` - DTO validation
- `@nestjs/websockets` and `@nestjs/platform-socket.io` - WebSocket support
- `winston` and `winston-daily-rotate-file` - Logging
- `@nestjs/swagger` - API documentation
- `helmet` - Security headers
- `@nestjs/throttler` - Rate limiting
- `@google/generative-ai` - Gemini SDK

**3. Create Module Structure**
```
/apps/backend/src
  /modules
    /auth              # Authentication & authorization
      auth.module.ts
      auth.service.ts
      auth.controller.ts
      /strategies
        jwt.strategy.ts
      /guards
        jwt-auth.guard.ts
      /dto
        register.dto.ts
        login.dto.ts
    /users             # User management
      users.module.ts
      users.service.ts
      users.controller.ts
      /dto
        create-user.dto.ts
    /interviews        # Interview lifecycle
      interviews.module.ts
      interviews.service.ts
      interviews.controller.ts
      /dto
        create-interview.dto.ts
    /questions         # Question management
      questions.module.ts
      questions.service.ts
      questions.controller.ts
    /answers           # Answer storage & evaluation
      answers.module.ts
      answers.service.ts
    /gemini            # Gemini API integration
      gemini.module.ts
      gemini.service.ts
      gemini-questions.service.ts
      gemini-evaluation.service.ts
    /voice             # WebSocket voice gateway
      voice.module.ts
      voice.gateway.ts
      voice.service.ts
  /common              # Shared utilities
    /guards
      jwt-auth.guard.ts
      roles.guard.ts
    /decorators
      current-user.decorator.ts
      public.decorator.ts
    /filters
      all-exceptions.filter.ts
      http-exception.filter.ts
    /interceptors
      logging.interceptor.ts
      transform.interceptor.ts
    /pipes
      validation.pipe.ts
    /interfaces
      api-response.interface.ts
  /config              # Configuration modules
    database.config.ts
    jwt.config.ts
    app.config.ts
  /database            # Database related
    /entities          # (Created in Database section)
    /migrations        # TypeORM migrations
    /seeds             # Database seed data
  main.ts              # Application entry point
  app.module.ts        # Root module
```

**4. Configure Environment Management**
- Set up `ConfigModule` to load and validate environment variables
- Create Joi validation schema for all required variables:
  - Database connection (host, port, user, password, name)
  - JWT secrets and expiration times
  - Gemini API key and configuration
  - CORS origin whitelist
  - Port and environment (dev/prod)
- Throw errors on startup if required variables are missing
- Document all variables in `.env.example`

**5. Implement Global Middleware**

**Logging Service (Winston):**
- Create `LoggerService` with Winston configuration
- Log levels: error, warn, info, debug
- Console transport for development (colorized output)
- Daily rotate file transport for production
- Include timestamp, context, and metadata in all logs
- Create custom logger method for HTTP requests/responses

**Global Exception Filter:**
- Catch all unhandled exceptions
- Transform errors into standardized API response format:
  ```typescript
  {
    success: false,
    error: {
      code: string,
      message: string,
      statusCode: number,
      timestamp: string
    }
  }
  ```
- Log all errors with stack trace
- Handle specific exception types (ValidationError, HttpException, TypeORM errors)
- Never expose internal error details in production

**Global Validation Pipe:**
- Apply `class-validator` to all DTOs automatically
- Configuration: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- Return detailed validation errors with field names
- Strip unknown properties from requests

**Logging Interceptor:**
- Log all incoming HTTP requests (method, URL, user ID, timestamp)
- Log all outgoing responses (status code, duration)
- Exclude sensitive data (passwords, tokens) from logs
- Add request ID for tracing

**6. Configure Database Connection**
- Set up TypeORM module with PostgreSQL configuration
- Connection details from environment variables
- Enable synchronize: false (use migrations instead)
- Configure logging for SQL queries in development
- Set up SSL for production database connections
- Add connection pooling configuration
- Define entities path pattern

**7. Implement JWT Authentication Strategy**
- Create JWT configuration from environment variables
- Implement `JwtStrategy` extending `PassportStrategy`:
  - Extract JWT from Authorization header (Bearer token)
  - Validate token signature and expiration
  - Query user from database using payload.sub (user ID)
  - Attach user object to request
  - Handle invalid tokens gracefully
- Create `JwtAuthGuard` to protect routes
- Create `@Public()` decorator to bypass authentication
- Create `@CurrentUser()` decorator to extract user from request

**8. Set Up Rate Limiting**
- Configure `@nestjs/throttler` module
- Set default limits: 100 requests per 15 minutes
- Apply stricter limits to sensitive endpoints:
  - Auth endpoints: 5 requests per 15 minutes
  - Interview creation: 3 per hour
- Store rate limit data in Redis (if available) or in-memory
- Return 429 Too Many Requests with retry-after header

**9. Configure Security Headers (Helmet)**
- Apply helmet middleware globally
- Configure Content Security Policy
- Set X-Frame-Options to DENY
- Set X-Content-Type-Options to nosniff
- Set Strict-Transport-Security for HTTPS
- Configure CORS with environment-based whitelist

**10. Set Up API Documentation (Swagger)**
- Configure Swagger module at `/api/docs` endpoint
- Add API metadata (title, description, version)
- Document authentication scheme (Bearer JWT)
- Add decorators to controllers for API documentation
- Group endpoints by tags (Auth, Users, Interviews, etc.)
- Generate example request/response bodies
- Make Swagger available only in development (disable in production)

**11. Create Standardized Response Format**
- Create `ApiResponse<T>` interface for all endpoints
- Success response structure:
  ```typescript
  {
    success: true,
    data: T,
    timestamp: string
  }
  ```
- Error response structure:
  ```typescript
  {
    success: false,
    error: { code, message, statusCode },
    timestamp: string
  }
  ```
- Create response transformation interceptor

**12. Implement Health Check Endpoint**
- Create `/health` endpoint (public, no auth required)
- Check database connection status
- Check external service availability (Gemini API)
- Return system status and version information
- Use for monitoring and load balancer health checks

**13. Set Up Development Scripts**
- `start` - Start production server
- `start:dev` - Start development server with watch mode
- `start:debug` - Start with debugging enabled
- `build` - Compile TypeScript to JavaScript
- `lint` - Run ESLint with auto-fix
- `format` - Run Prettier formatting
- `test` - Run unit tests
- `test:e2e` - Run end-to-end tests
- `test:cov` - Generate test coverage report

### **Deliverables**
✓ NestJS application running on `http://localhost:3000`
✓ TypeScript strict mode enabled with zero errors
✓ Module structure with clear separation of concerns
✓ Global error handling and logging configured
✓ JWT authentication strategy implemented
✓ Rate limiting on all endpoints
✓ Security headers applied (Helmet)
✓ Swagger documentation at `/api/docs`
✓ Health check endpoint functional
✓ Environment validation on startup
✓ All dependencies installed and documented
✓ README with API documentation and setup instructions

### **Acceptance Criteria**
✓ `npm run start:dev` starts application without errors
✓ `npm run build` completes successfully
✓ Swagger UI accessible at `http://localhost:3000/api/docs`
✓ Health check endpoint returns 200 OK
✓ Invalid JWT returns 401 Unauthorized
✓ Missing environment variables prevent startup
✓ All HTTP requests logged with context
✓ Validation errors return detailed field-level messages
✓ TypeScript compilation passes with strict mode
✓ Code follows ESLint and Prettier standards

***

## **PROMPT 3: DATABASE ENGINEER**

### **Objective**
Design and implement the PostgreSQL database schema with TypeORM entities, establish relationships, create migrations, set up indexes for query optimization, and prepare seed data for development.

### **Project Context**
You're designing the data layer for a voice-based AI interview platform. The schema must support multi-user authentication, interview session management with questions and answers, evaluation storage, and efficient querying for reports and analytics.

### **Tasks**

**1. Set Up TypeORM Configuration**
- Navigate to `/apps/backend/src/database` directory
- Configure TypeORM in `app.module.ts` to connect to PostgreSQL
- Use environment variables for all connection parameters
- Enable migration auto-run in development (manual in production)
- Configure naming strategy for consistent column/table names
- Set up entity path pattern to auto-discover entities

**2. Define Database Entities**

**User Entity** (`entities/user.entity.ts`):
- Primary key: UUID (`id`)
- Fields:
  - `email` - String, unique, lowercase, indexed
  - `password_hash` - String, excluded from JSON serialization
  - `email_verified` - Boolean, default false
  - `verification_token` - String, nullable
  - `reset_token` - String, nullable
  - `reset_token_expires` - Timestamp, nullable
  - `created_at` - Timestamp, auto-generated
  - `updated_at` - Timestamp, auto-updated
  - `last_login` - Timestamp, nullable
- Relationships:
  - One-to-Many with Interview entity
- Validation:
  - Email format validation
  - Password hash never returned in responses
- Methods:
  - `toJSON()` - Exclude sensitive fields
- Indexes:
  - Unique index on email
  - Index on created_at for sorting

**Interview Entity** (`entities/interview.entity.ts`):
- Primary key: UUID (`id`)
- Foreign keys:
  - `user_id` - References User.id, on delete CASCADE
- Fields:
  - `job_role` - String, max 100 chars
  - `difficulty` - Enum ('JUNIOR', 'MID', 'SENIOR')
  - `topics` - Array of strings (TypeORM simple-array)
  - `status` - Enum ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'), default 'PENDING'
  - `overall_score` - Decimal (5,2), nullable
  - `performance_trend` - String, nullable ('IMPROVING', 'DECLINING', 'CONSISTENT')
  - `completed_questions` - Integer, default 0
  - `total_questions` - Integer
  - `duration_minutes` - Integer, nullable
  - `started_at` - Timestamp, auto-generated
  - `completed_at` - Timestamp, nullable
- Relationships:
  - Many-to-One with User entity
  - One-to-Many with Question entity (cascade all)
- Indexes:
  - Composite index on (user_id, status) for filtering
  - Index on started_at for sorting
- Constraints:
  - completed_questions <= total_questions
  - overall_score between 0 and 100

**Question Entity** (`entities/question.entity.ts`):
- Primary key: UUID (`id`)
- Foreign keys:
  - `interview_id` - References Interview.id, on delete CASCADE
- Fields:
  - `content` - Text, required
  - `expected_answer` - Text, nullable
  - `difficulty` - Enum ('EASY', 'MEDIUM', 'HARD')
  - `topic` - String, max 100 chars
  - `order` - Integer (position in interview)
  - `evaluation_criteria` - JSONB, nullable
  - `time_limit_seconds` - Integer, nullable
  - `gemini_prompt` - Text, nullable (stores original prompt)
  - `created_at` - Timestamp, auto-generated
- Relationships:
  - Many-to-One with Interview entity
  - One-to-One with Answer entity (cascade all)
- Indexes:
  - Composite index on (interview_id, order) for sequential retrieval
  - Index on difficulty for filtering
- Constraints:
  - order must be positive
  - Unique constraint on (interview_id, order)

**Answer Entity** (`entities/answer.entity.ts`):
- Primary key: UUID (`id`)
- Foreign keys:
  - `question_id` - References Question.id, on delete CASCADE
- Fields:
  - `transcript` - Text, required
  - `audio_url` - String, nullable (S3/cloud storage link)
  - `evaluation_json` - JSONB, nullable (full evaluation details)
  - `feedback` - Text, nullable
  - `score` - Decimal (5,2), nullable
  - `confidence_score` - Decimal (5,2), nullable (AI confidence)
  - `duration_seconds` - Integer, nullable
  - `created_at` - Timestamp, auto-generated
  - `updated_at` - Timestamp, auto-updated
- Relationships:
  - One-to-One with Question entity
- Indexes:
  - Unique index on question_id
  - Index on score for analytics
- Constraints:
  - score between 0 and 100
  - confidence_score between 0 and 100

**3. Define Relationships and Cascade Rules**
- User → Interview: One-to-Many, cascade delete (deleting user removes all interviews)
- Interview → Question: One-to-Many, cascade all (deleting interview removes questions)
- Question → Answer: One-to-One, cascade all (deleting question removes answer)
- Configure eager/lazy loading appropriately:
  - Eager load: Only when explicitly needed (e.g., interview with questions for reports)
  - Lazy load: Default behavior for better performance

**4. Create Database Migrations**
- Generate initial migration for all entities:
  - `npm run migration:generate -- -n InitialSchema`
- Migration should include:
  - CREATE TABLE statements for all entities
  - Foreign key constraints with proper on delete behavior
  - Index creation statements
  - Enum type definitions for PostgreSQL
  - Default values and check constraints
- Test migration rollback functionality
- Document migration execution order in README

**5. Optimize Indexes for Query Patterns**

**Expected Query Patterns:**
- Find user by email (authentication)
- Find all interviews for a user, sorted by date
- Find interview by ID with all questions and answers (report generation)
- Find next unanswered question in an interview
- Aggregate statistics (average scores, completion rates)

**Index Strategy:**
- Single-column indexes: user.email, interview.started_at
- Composite indexes:
  - (user_id, status) - Filter user's active/completed interviews
  - (interview_id, order) - Sequential question retrieval
- Covering indexes where beneficial for read-heavy queries
- JSONB indexes on evaluation_json for filtering by specific criteria (if needed)
- Consider partial indexes for common filters (e.g., status = 'COMPLETED')

**6. Implement Data Validation at Database Level**
- Check constraints:
  - Scores must be between 0 and 100
  - Question order must be positive
  - completed_questions <= total_questions
- NOT NULL constraints on required fields
- UNIQUE constraints:
  - user.email
  - (interview_id, question.order)
  - question_id in answers table
- Foreign key constraints with appropriate cascade rules
- Default values for boolean and enum fields

**7. Create Seed Data for Development**
- Create seed script (`seeds/development.seed.ts`)
- Seed data should include:
  - 3 test users with hashed passwords (use bcrypt)
  - 5 sample interviews in various states (pending, in progress, completed)
  - 10 questions per interview with varying difficulties
  - Answers for completed interviews with realistic evaluation data
- Ensure seed data is idempotent (can run multiple times without duplicates)
- Add script to package.json: `npm run seed`
- Document seed user credentials in README for testing

**8. Configure Database Connection Pooling**
- Set up connection pool with appropriate limits:
  - Min connections: 2
  - Max connections: 10 (adjust based on expected load)
  - Idle timeout: 10 seconds
  - Connection timeout: 3 seconds
- Configure connection retry logic with exponential backoff
- Add health checks to verify database connectivity

**9. Implement Soft Delete (Optional Enhancement)**
- Add `deleted_at` timestamp field to User and Interview entities
- Configure TypeORM soft delete functionality
- Update queries to exclude soft-deleted records by default
- Add admin endpoint to permanently delete soft-deleted records

**10. Set Up Database Backup Strategy**
- Document backup procedures in README:
  - Daily automated backups in production
  - Backup retention policy (30 days)
  - Point-in-time recovery configuration
- Create script for local database backup/restore
- Test restore process from backup

**11. Add Database Performance Monitoring**
- Enable query logging in development
- Log slow queries (threshold: >100ms)
- Add database connection metrics:
  - Active connections
  - Query execution time
  - Transaction rollback rate
- Configure alerts for connection pool exhaustion

**12. Create Database Documentation**
- Generate Entity-Relationship Diagram (ERD)
- Document each entity with field descriptions
- Document relationships and cascade rules
- Document indexes and their purpose
- Provide example queries for common operations
- Add schema version tracking

### **Deliverables**
✓ Complete TypeORM entities for User, Interview, Question, Answer
✓ Database relationships with proper cascade rules
✓ Initial migration script tested and executable
✓ Indexes created for optimized query performance
✓ Seed data script with realistic test data
✓ Connection pooling configured
✓ Database documentation (schema, ERD, example queries)
✓ Migration execution scripts in package.json
✓ README with database setup and management instructions

### **Acceptance Criteria**
✓ `npm run migration:run` executes without errors
✓ `npm run migration:revert` successfully rolls back changes
✓ `npm run seed` populates database with test data
✓ All foreign key constraints properly enforced
✓ Check constraints prevent invalid data
✓ Indexes improve query performance (measured with EXPLAIN)
✓ Database connection successful from backend application
✓ Queries for user interviews execute in <50ms
✓ Report generation with full interview data executes in <200ms
✓ TypeScript entity definitions match database schema exactly
✓ No N+1 query problems in common operations

***

## **INTEGRATION VERIFICATION**

### **After All Three Parts Complete:**

**1. Full Stack Connection Test**
- Frontend API client connects to backend successfully
- Backend connects to PostgreSQL database
- Environment variables loaded correctly in all layers
- CORS configured to allow frontend origin

**2. Health Check**
- Frontend health check: Application loads without errors
- Backend health check: `/health` endpoint returns 200
- Database health check: TypeORM connection status healthy

**3. End-to-End Smoke Test**
- Manual test: Register new user → Login → View dashboard
- Verify JWT token stored in frontend
- Verify user created in database
- Check logs for request/response flow

**4. Docker Compose Verification**
- All services start with `docker-compose up`
- Services can communicate over Docker network
- Database data persists across container restarts
- Hot reload works for frontend and backend