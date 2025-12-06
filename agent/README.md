# LiveKit Interview Agent

Python agent for conducting voice-based technical interviews using LiveKit and Gemini Live API.

## Prerequisites

- Python 3.13+ (recommended: 3.13)
- [uv](https://github.com/astral-sh/uv) - Modern Python package manager

## Setup

### 1. Install uv (if not already installed)

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows:**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Using pip:**
```bash
pip install uv
```

### 2. Install dependencies

```bash
# Navigate to agent directory
cd agent

# Create virtual environment and install all dependencies
uv sync

# Or install without dev dependencies
uv sync --no-dev
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your credentials:
# - LiveKit URL, API Key, API Secret
# - Google Gemini API Key
# - NestJS API URL
```

### 4. Download Silero VAD models

```bash
uv run python -m livekit.plugins.silero download-models
```

## Running Locally

### Development mode (hot reload):
```bash
uv run python src/agent.py dev
```

### Production mode:
```bash
uv run python src/agent.py start
```

## Adding Dependencies

```bash
# Add production dependency
uv add <package-name>

# Add dev dependency
uv add --dev <package-name>

# Update all dependencies
uv sync --upgrade
```

## Deployment to LiveKit Cloud

### 1. Install LiveKit CLI

```bash
curl -sSL https://get.livekit.io/cli | bash
```

### 2. Deploy agent

```bash
livekit-cli deploy agent src/agent.py
```

## Architecture

- **agent.py**: Main entry point, sets up voice assistant
- **interview_orchestrator.py**: Manages interview flow and questions
- **api_client.py**: Communicates with NestJS backend
- **config.py**: Configuration management with Pydantic

## How It Works

1. Agent joins LiveKit room when user starts interview
2. Fetches interview questions from NestJS API
3. Uses Gemini Live API for natural voice conversation
4. Asks questions sequentially
5. Detects when user finishes speaking (Silero VAD)
6. Sends transcript to NestJS for evaluation
7. Moves to next question
8. Completes interview and notifies backend

## Development

### Code formatting
```bash
uv run black src/
```

### Linting
```bash
uv run ruff check src/
```

### Running tests
```bash
uv run pytest
```

## Troubleshooting

### Virtual environment not activated
uv automatically manages the virtual environment. Use `uv run` prefix for all commands.

### Dependency conflicts
```bash
# Reset and reinstall
rm -rf .venv uv.lock
uv sync
```

### Model download issues
```bash
# Manually download Silero VAD models
uv run python -m livekit.plugins.silero download-models --force
```
