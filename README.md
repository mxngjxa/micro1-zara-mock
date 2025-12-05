# Voice-Based AI Interview Agent

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.0.7-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC-00A1E0?logo=livekit&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11.0.1-E0234E?logo=nestjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3.28-FE0803?logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-API-4285F4?logo=google&logoColor=white)
![LiveKit Agent](https://img.shields.io/badge/LiveKit_Agent-Python-00A1E0?logo=python&logoColor=white)
![Gemini Live API](https://img.shields.io/badge/Gemini_Live-Voice-4285F4?logo=google&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![Passport](https://img.shields.io/badge/Passport-0.7.0-34E27A?logo=passport&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-6.0.0-338C5F?logo=letsencrypt&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=black)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?logo=jest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9.18.0-4B32C3?logo=eslint&logoColor=white)

A full-stack AI application that conducts technical interviews through a natural, voice-first conversational interface. This agent interviews candidates in real-time, generates dynamic technical questions, and evaluates responses using AI.

![GitHub top language](https://img.shields.io/github/languages/top/mxngjxa/micro1-zara-mock)
![GitHub package.json version](https://img.shields.io/github/package-json/v/mxngjxa/micro1-zara-mock)
![GitHub License](https://img.shields.io/github/license/mxngjxa/micro1-zara-mock)
![GitHub Repo stars](https://img.shields.io/github/stars/mxngjxa/micro1-zara-mock?style=social)
![GitHub forks](https://img.shields.io/github/forks/mxngjxa/micro1-zara-mock?style=social)
![GitHub issues](https://img.shields.io/github/issues/mxngjxa/micro1-zara-mock)
![GitHub pull requests](https://img.shields.io/github/issues-pr/mxngjxa/micro1-zara-mock)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/mxngjxa/micro1-zara-mock?utm_source=oss&utm_medium=github&utm_campaign=mxngjxa%2Fmicro1-zara-mock&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## 🚀 Features

- **Voice-First Interface:** Real-time Speech-to-Text (STT) and Text-to-Speech (TTS) for a natural conversational flow
- **AI Interview Engine:** Generates context-aware technical questions and evaluates answers on the fly
- **Silence Detection:** Automatically triggers the next phase of conversation when the user finishes speaking
- **Live Transcript:** Displays active questions and conversation history in real-time
- **Secure Architecture:** JWT-based authentication with role-based access control
- **Monorepo Structure:** Unified codebase managing both React frontend and NestJS backend

## 🛠 Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, Lucide React
- **Backend:** NestJS 11, TypeORM 0.3
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)

## 📂 Project Structure

This project uses NPM Workspaces to manage the full-stack implementation.

```
├── apps/
│   ├── frontend/         # Next.js application
│   └── backend/          # NestJS API server
├── packages/
│   └── shared/           # Shared TypeScript types and DTOs
└── package.json          # Root configuration with workspace scripts
```

## ⚙️ Prerequisites

- Node.js v18+
- PostgreSQL (Local or Docker)
- API Keys for AI Services (OpenAI, Deepgram, etc.)

## ⚡ Quick Start

### 1. Install Dependencies

From the root directory, install all workspace dependencies:

```bash
npm install
```

### 2. Environment Configuration

**Backend (`apps/backend/.env`):**

```bash
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/interview_db"
JWT_SECRET="your-secure-secret-key"
OPENAI_API_KEY="your-openai-key"
DEEPGRAM_API_KEY="your-deepgram-key"
```

**Frontend (`apps/frontend/.env.local`):**

```bash
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. Database Setup

Start PostgreSQL using Docker:

```bash
docker compose up -d
```

Run database migrations:

```bash
npm run migration:run -w backend
```

Verify migrations (optional):

```bash
npx ts-node apps/backend/src/scripts/check-migrations.ts
```

## 🏃‍♂️ Running the Application

### Option 1: Run Services Separately

**Terminal 1 - Backend (NestJS):**
```bash
npm run dev:backend
# Server runs at http://localhost:3000
```

**Terminal 2 - Frontend (Next.js):**
```bash
npm run dev:frontend
# Client runs at http://localhost:3001
```

### Option 2: Development with Watch Mode

Backend supports hot-reload in development:
```bash
cd apps/backend
npm run start:dev
```

Frontend with custom port:
```bash
cd apps/frontend
npm run dev -- --port 3001
```

## 🔧 Additional Commands

### Database Migrations

Generate new migration:
```bash
npm run migration:generate -w backend src/database/migrations/MigrationName
```

Revert last migration:
```bash
npm run migration:revert -w backend
```

### Testing

Run all workspace tests:
```bash
npm run test
```

Backend tests:
```bash
npm run test -w backend
npm run test:e2e -w backend
npm run test:cov -w backend
```

### Build for Production

Build all workspaces:
```bash
npm run build
```

Start backend in production mode:
```bash
npm run start:prod -w backend
```

## 📖 API Documentation

The backend exposes the following key endpoints:

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Authenticate and receive JWT |
| `POST` | `/interviews/start` | Initialize a new interview session |
| `POST` | `/interviews/:id/response` | Submit a candidate's answer |
| `GET` | `/interviews/:id/transcript` | Retrieve full conversation history |

## 🧠 AI Configuration

- **LLM:** OpenAI GPT models
- **Speech-to-Text:** Deepgram API
- **Text-to-Speech:** ElevenLabs or OpenAI TTS

## 📄 License

MIT