#!/bin/bash

# Test agent locally with development room

echo "Starting LiveKit Agent in development mode..."
echo "Agent will connect when a user joins a room"
echo ""
echo "Using uv for dependency management..."

# Ensure dependencies are installed
uv sync

# Run agent in dev mode
uv run python agent/src/agent.py dev

# Agent will automatically connect to rooms matching pattern "interview-*"
