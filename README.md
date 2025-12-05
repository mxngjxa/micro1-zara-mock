# Voice-Based AI Interview Agent

A full-stack AI application that conducts technical interviews through a natural, voice-first conversational interface. This agent interviews candidates in real-time, generates dynamic technical questions, and evaluates responses using AI.

## 🚀 Features

- **Voice-First Interface:** Real-time Speech-to-Text (STT) and Text-to-Speech (TTS) for a natural conversational flow.
- **AI Interview Engine:** Generates context-aware technical questions and evaluates answers on the fly.
- **Silence Detection:** Automatically triggers the next phase of conversation when the user finishes speaking.
- **Live Transcript:** Displays active questions and conversation history in real-time.
- **Secure Architecture:** JWT-based authentication with role-based access control (users only see their own data).
- **Monorepo Structure:** Unified codebase managing both React frontend and NestJS backend.

## 🛠 Tech Stack

- **Frontend:** React (Next.js), Tailwind CSS, Lucide React
- **Backend:** NestJS (REST API), Prisma/TypeORM
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **AI/ML:**
  - LLM: [INSERT LLM MODEL, e.g., GPT-4o / Claude 3.5]
  - Speech-to-Text: [INSERT PROVIDER, e.g., Deepgram / Whisper]
  - Text-to-Speech: [INSERT PROVIDER, e.g., ElevenLabs / OpenAI TTS]

## 📂 Project Structure

This project uses NPM Workspaces to manage the full-stack implementation.

```
├── apps/
│   ├── frontend/         # React/Next.js application
│   └── backend/          # NestJS API server
├── packages/
│   └── shared/           # Shared TypeScript types and DTOs
├── package.json          # Root configuration
└── README.md
```

## ⚙️ Prerequisites

- Node.js v18+
- PostgreSQL (Local or hosted via [INSERT PROVIDER, e.g., Supabase/Neon])
- API Keys for AI Services ([INSERT SERVICES])

## ⚡ Getting Started

### 1. Clone the Repository
```
git clone [INSERT_REPO_URL]
cd [REPO_NAME]
```

### 2. Install Dependencies
Install all dependencies for frontend, backend, and shared packages from the root directory:
```
npm install
```

### 3. Environment Configuration

**Backend (`apps/backend/.env`):**
Create a `.env` file in the backend directory:
```
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/interview_db"
JWT_SECRET="[INSERT_SECURE_SECRET]"
OPENAI_API_KEY="[INSERT_KEY]"
DEEPGRAM_API_KEY="[INSERT_KEY]"
```

**Frontend (`apps/frontend/.env.local`):**
Create a `.env.local` file in the frontend directory:
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

### 4. Database Setup
Initialize your database schema:
```
# Run migrations (adjust command based on your ORM)
npm run migrate -w backend
```

## 🏃‍♂️ Running the Application

You can run the services individually or concurrently.

**Start Backend (NestJS):**
```
npm run dev:backend
# Server running at http://localhost:3001
```

**Start Frontend (Next.js):**
```
npm run dev:frontend
# Client running at http://localhost:3000
```

## 📖 API Documentation

The backend exposes the following key endpoints. A full Swagger/OpenAPI spec is available at `/api/docs` (if enabled).

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Authenticate and receive JWT |
| `POST` | `/interviews/start` | Initialize a new interview session |
| `POST` | `/interviews/:id/response` | Submit a candidate's answer |
| `GET` | `/interviews/:id/transcript` | Retrieve full conversation history |

## 🧠 AI Configuration

This agent uses **[INSERT_MODEL_NAME]** to drive the interview logic.
- **Prompt Engineering:** The system prompt is located in `apps/backend/src/ai/prompts/`.
- **Voice Latency:** We optimize response time by streaming audio chunks using **[INSERT_STREAMING_TECHNIQUE]**.

## 🎥 Demo

[INSERT LINK TO LOOM/YOUTUBE VIDEO HERE]

## 📄 License

[INSERT LICENSE TYPE, e.g., MIT]