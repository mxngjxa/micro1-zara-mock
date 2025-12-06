# 🎙️ Voice-Based AI Interview Agent

Essentiall, a mid clone of `micro1`'s zara ai interview agent.

<div align="center">

![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.0.7-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)

![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC-00A1E0?logo=livekit&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini-Live_API-4285F4?logo=google&logoColor=white)
![Deepgram](https://img.shields.io/badge/Deepgram-STT/TTS-13EF93?logo=deepgram&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)

</div>

A production-grade, voice-first AI interview platform that conducts technical interviews through natural conversation using **LiveKit's Agent Platform** and **Google Gemini Live API**. This system provides real-time speech interaction, AI-driven question generation, adaptive difficulty adjustment, and comprehensive interview evaluation.

---

## ✨ Features

- **🎤 Voice-First Interface**: Real-time bidirectional voice communication via LiveKit WebRTC
- **🤖 AI Interview Agent**: Python-based LiveKit agent powered by Gemini Live API
- **🧠 Adaptive Difficulty**: Dynamic question difficulty based on candidate performance
- **🔍 Comprehensive Evaluation**: Multi-dimensional scoring (correctness, completeness, clarity)
- **📊 Detailed Reports**: Visual analytics with personalized recommendations
- **🔐 Secure Authentication**: JWT-based auth with bcrypt password hashing
- **🏗️ Monorepo Architecture**: Unified workspace managing frontend, backend, and agent

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16, React 19
- **Styling**: Tailwind CSS v4
- **Voice UI**: LiveKit Components React
- **State**: Zustand
- **Validation**: Zod, React Hook Form

### Backend
- **Framework**: NestJS 11 (TypeScript)
- **Database**: PostgreSQL 15 + TypeORM
- **Authentication**: JWT (Passport.js) + bcrypt
- **API Docs**: Swagger/OpenAPI
- **Logging**: Winston

### Voice AI Agent
- **Runtime**: Python 3.13
- **Platform**: LiveKit Agent Platform
- **AI Model**: Google Gemini Live API
- **Audio**: Silero VAD (Voice Activity Detection)
- **Package Manager**: `uv`

---

## 📂 Project Structure

```bash
micro1-zara-mock/
├── backend/              # NestJS REST API
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── interviews/  # Interview management
│   │   ├── questions/   # Question service
│   │   ├── answers/     # Answer evaluation
│   │   ├── livekit/     # LiveKit token service
│   │   ├── gemini/      # Gemini API integration
│   │   └── database/    # Entities & migrations
│   └── .env             # Backend configuration
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/        # Next.js 13+ app router
│   │   ├── components/ # React components
│   │   ├── lib/        # API clients & utilities
│   │   └── store/      # Zustand state management
│   └── .env.local      # Frontend configuration
├── agent/               # Python LiveKit agent
│   ├── src/
│   │   ├── agent.py           # Main agent entry
│   │   ├── interview_orchestrator.py
│   │   ├── api_client.py      # Backend API integration
│   │   └── config.py          # Config management
│   ├── pyproject.toml   # Python dependencies (uv)
│   └── .env             # Agent configuration
├── packages/shared/     # Shared TypeScript types
├── docker-compose.yml   # PostgreSQL + Adminer
├── package.json         # Root workspace config
└── .env                 # Root environment variables
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ (LTS recommended)
- **Python** 3.13
- **PostgreSQL** 15+ (Docker or local)
- **uv** (Python package manager)
- **LiveKit Cloud Account** (free tier available)
- **Google Gemini API Key**

---

## 🚀 Quick Start

### 1️⃣ Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/mxngjxa/micro1-zara-mock.git
cd micro1-zara-mock

# Install Node.js dependencies (root, backend, frontend)
npm install

# Install Python dependencies for agent
uv sync
```

### 2️⃣ Environment Configuration

#### **Root `.env`**
Create `.env` in project root:

```
# frontend
PORT=3001

# database
DATABASE_URL="postgresql://user:password@localhost:5432/interview_db"

# ai api keys
DEEPGRAM_API_KEY=your-deepgram-api-key
GOOGLE_API_KEY=your-gogole-api-key

#livekit api keys
LIVEKIT_URL=wss://livekiturl
LIVEKIT_API_KEY=livekit-api-key-here
LIVEKIT_API_SECRET=livekit-api-secret-here

# nestjs backend
NESTJS_API_URL=http://localhost:3000
LOG_LEVEL=INFO
```

#### **Backend `backend/.env`**
Create `backend/.env`:

```
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=interview_db

LOG_LEVEL=info

# JWT Configuration
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-jwt-refresh-secret-here
JWT_REFRESH_EXPIRATION=7d

# LiveKit Configuration
LIVEKIT_URL=wss://livekiturl
LIVEKIT_API_KEY=livekit-api-key-here
LIVEKIT_API_SECRET=livekit-api-secret-here

# Application
FRONTEND_URL=http://localhost:3001
FRONTEND_ORIGIN=http://localhost:3001

# Google Gemini API
GOOGLE_API_KEY=your-gogole-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.7
```

> **Note**: Replace all `<XXX_API_KEY=your-XXX-api-key>` with actual values.

#### **Frontend `frontend/.env.local`**
Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### 3️⃣ Database Setup

```
# Start PostgreSQL and Adminer via Docker Compose
docker compose up -d

# Verify services are running
docker compose ps
# Expected: db (postgres) and adminer containers running

# Run database migrations
npm run migration:run -w backend

# Verify migrations applied successfully
npx ts-node backend/src/scripts/check-migrations.ts

# Verify tables created
npx ts-node backend/src/scripts/check-tables.ts

# (Optional) Seed test data
npx ts-node backend/src/scripts/seed.ts
```

---

## 🏃 Running the Application

You need **three terminal windows** to run all services:

### **Terminal 1: Backend (NestJS)**

```bash
npm run dev:backend
```

> **Note**: If port 3000 is blocked, run `lsof -i :3000` to see the `PID`, then run `kill -9 PID` to kill process blocking port.


✅ Backend runs at: **http://localhost:3000**  
📄 Swagger API docs: **http://localhost:3000/api/docs**

### **Terminal 2: Frontend (Next.js)**

```bash
npm run dev:frontend
```

✅ Frontend runs at: **http://localhost:3001**

### **Terminal 3: LiveKit Agent (Python)**

```bash
uv run python agent/agent.py dev
```

✅ Agent connects to LiveKit Cloud and listens for interview sessions

---

## 🔗 Service Endpoints

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | React UI for interviews |
| **Backend API** | http://localhost:3000 | NestJS REST API |
| **Swagger Docs** | http://localhost:3000/api/docs | API documentation |
| **PostgreSQL** | localhost:5432 | Database server |
| **Adminer** | http://localhost:8080 | DB admin interface |

**Adminer Login:**
- Server: `db`
- Username: `postgres`
- Password: `postgres`
- Database: `interview_db`

---

## 🧪 Testing

```
# Run all tests
npm run test

# Backend unit tests
npm run test -w backend

# Backend E2E tests
npm run test:e2e -w backend

# Backend test coverage
npm run test:cov -w backend
```

---

## 🏗️ Build for Production

```
# Build all workspaces
npm run build

# Start backend in production mode
npm run start:prod -w backend
```

---

## 📖 API Documentation

### Core Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new user | Public |
| `POST` | `/auth/login` | Login & get JWT | Public |
| `POST` | `/interviews` | Create interview | Required |
| `POST` | `/interviews/:id/start` | Start interview & get LiveKit token | Required |
| `GET` | `/interviews/:id` | Get interview details | Required |
| `POST` | `/interviews/:id/complete` | Complete interview | Required |
| `GET` | `/agent/interviews/:id?roomname=` | Get interview for agent | Public* |

> **Note**: Agent endpoints use room name validation instead of JWT

Full API documentation available at: **http://localhost:3000/api/docs**

---

## 🛠️ Database Migrations

```
# Generate new migration
npm run migration:generate -w backend src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run -w backend

# Revert last migration
npm run migration:revert -w backend
```

---

## 🐛 Troubleshooting

### Port Conflicts

```
# Check if ports are in use
lsof -i :3000  # Backend
lsof -i :3001  # Frontend
lsof -i :5432  # PostgreSQL
lsof -i :8080  # Adminer
```

### Database Connection Issues

- Verify Docker PostgreSQL is running: `docker compose ps`
- Check `DATABASE_*` variables in `backend/.env` match `docker-compose.yml`
- Default credentials: `postgres/postgres` on `localhost:5432`
- Test connection: `npx ts-node backend/src/scripts/test-db-connection.ts`

### Migration Errors

```
# Revert and retry
npm run migration:revert -w backend
npm run migration:run -w backend
```

### Workspace Issues

```
# Reinstall dependencies
rm -rf node_modules */node_modules
npm install
```

### Frontend Build Errors

```
# Clear Next.js cache
rm -rf frontend/.next
npm run dev:frontend
```

### Agent Connection Issues

```
# Verify Silero VAD models downloaded
cd agent
uv run python verify_setup.py

# Re-download if needed
uv run python -m livekit.plugins.silero download-models --force
```

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Next.js)                 │
│  - Authentication UI                                        │
│  - LiveKit Voice Components (useVoiceAssistant)            │
│  - Interview Management & Reports                          │
└─────────────────────────────────────────────────────────────┘
         │ HTTP/REST                          │ WebRTC
         ▼                                    ▼
┌──────────────────────┐         ┌────────────────────────────┐
│   NESTJS BACKEND     │         │   LIVEKIT CLOUD/SERVER     │
│  - Auth Service      │         │  - Room Management         │
│  - Interview Service │◄──RPC───│  - WebRTC Transport        │
│  - Question Service  │         │  - Agent Dispatcher        │
│  - Evaluation Service│         └────────────────────────────┘
│  - LiveKit Token Svc │                     │
│  - PostgreSQL + ORM  │                     ▼
└──────────────────────┘         ┌────────────────────────────┐
                                 │ LIVEKIT AGENT (Python)     │
                                 │  - Gemini Live API         │
                                 │  - Interview Orchestrator  │
                                 │  - Turn Detection (VAD)    │
                                 │  - NestJS Integration      │
                                 └────────────────────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────────┐
                                 │   GOOGLE GEMINI API        │
                                 │  - Live Voice Conversation │
                                 │  - Question Generation     │
                                 │  - Answer Evaluation       │
                                 └────────────────────────────┘
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues or questions, please open an issue on [GitHub](https://github.com/mxngjxa/micro1-zara-mock/issues).

---

**Built with ❤️ using LiveKit, Gemini Live API, NestJS, and Next.js**