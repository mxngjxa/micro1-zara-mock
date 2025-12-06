# **VOICE-BASED AI INTERVIEW AGENT - LIVEKIT IMPLEMENTATION**
## **React + NestJS + LiveKit + Gemini Live API**

***

## **PROJECT OVERVIEW**

Production-grade voice-first AI interview platform conducting technical interviews through natural conversation using LiveKit's Agent Platform and Google Gemini Live API.

**Core Technologies:**
- **Frontend**: React 19 + TypeScript + NextJS 16 + TailwindCSS + LiveKit React Components
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

## **Testing Order**

### **Prerequisites**

Before starting services, ensure environment variables are configured:

```bash
# Backend - Create .env file (no .env.example exists in the repo)
touch backend/.env

# Add these required variables to backend/.env:
cat >> backend/.env << 'EOF'
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=interview_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=24h
REFRESH_TOKEN_EXPIRATION=7d

# LiveKit Configuration (for Phase 2+)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

# Google Gemini API (for Phase 2+)
GOOGLE_API_KEY=your-google-gemini-api-key

# Logging
LOG_LEVEL=info

# CORS
FRONTEND_ORIGIN=http://localhost:3001
EOF

# Frontend - Create .env.local file
cat >> frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
EOF
```

### **1. Initialize Infrastructure**

Run from the **repository root**:

```bash
# Start PostgreSQL and Adminer using docker-compose.yml
docker compose up -d 

# Verify services are running
docker compose ps

# Expected output:
# NAME      IMAGE                  STATUS
# db        postgres:15-alpine     Up
# adminer   adminer                Up (accessible at http://localhost:8080)
```

### **2. Database Setup**

Run from the **repository root**:

```bash
# Run database migrations
npm run migration:run -w backend

# Verify migrations applied successfully
npx ts-node backend/src/scripts/check-migrations.ts

# You can also verify tables were created
npx ts-node backend/src/scripts/check-tables.ts

# Use the existing seed script manually
npx ts-node backend/src/scripts/seed.ts
```

### **3. Start Backend Service**

Run from the **repository root**:

```bash
# Start NestJS backend with hot-reload
npm run dev:backend

# Backend will be available at http://localhost:3000
# API documentation (Swagger): http://localhost:3000/api/docs
```

**Available backend scripts:**
- `start:dev` - Development mode with watch
- `start:debug` - Debug mode with watch
- `start:prod` - Production mode
- `migration:run` - Run pending migrations
- `migration:revert` - Revert last migration
- `migration:generate` - Generate new migration

### **4. Start Frontend Service**

Run from the **repository root** (in a new terminal):

```bash
# Start Next.js frontend (configured to run on port 3001)
npm run dev:frontend

# Frontend will be available at http://localhost:3001
```

### **5. Start Livekit-Agent Service**

Run from the **repository root** (in a new terminal):

```bash
# Start livekit python backend
uv run python agent/agent.py dev
```


**Available frontend scripts:**
- `dev` - Development mode with hot-reload
- `build` - Production build
- `start` - Start production server

### **Service Endpoints**

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **PostgreSQL**: localhost:5432 (via Docker)
- **Adminer** (DB GUI): http://localhost:8080 (via Docker)

### **Verification Steps**

1. **Check backend health**: 
   ```bash
   curl http://localhost:3000
   ```

2. **Access Swagger API docs**: Open http://localhost:3000/api/docs

3. **Verify database connection**: Check backend logs for successful TypeORM connection

4. **Access Adminer**: 
   - Open http://localhost:8080
   - Server: `db`, Username: `postgres`, Password: `postgres`, Database: `interview_db`

5. **Access frontend**: Open http://localhost:3001

6. **Test database connection** (optional):
   ```bash
   npx ts-node backend/src/scripts/test-db-connection.ts
   ```

### **Troubleshooting**

- **Port conflicts**: Ensure ports 3000, 3001, 5432, and 8080 are available
  ```bash
  lsof -i :3000  # Check if port 3000 is in use
  lsof -i :3001  # Check if port 3001 is in use
  lsof -i :5432  # Check if port 5432 is in use
  ```

- **Database connection errors**: 
  - Verify Docker PostgreSQL is running: `docker compose ps`
  - Check DATABASE_* variables in `backend/.env` match docker-compose.yml
  - Default credentials: `postgres/postgres` on `localhost:5432`

- **Migration errors**: 
  ```bash
  # Revert and retry
  npm run migration:revert -w backend
  npm run migration:run -w backend
  ```

- **Workspace not found errors**:
  ```bash
  # Reinstall dependencies
  rm -rf node_modules */node_modules
  npm install
  ```

- **Frontend build errors**: 
  ```bash
  # Clear Next.js cache
  rm -rf frontend/.next
  npm run dev:frontend
  ```

- **Backend won't start**: Check for TypeScript errors
  ```bash
  cd backend
  npx tsc --noEmit
  ```

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