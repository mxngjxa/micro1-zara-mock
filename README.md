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

