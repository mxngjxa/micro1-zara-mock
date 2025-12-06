#!/bin/bash
echo "Starting LiveKit Agent in development mode..."
echo "Agent will connect when a user joins a room"
echo
echo "Using uv for dependency management..."

cd agent
uv sync  # Ensure dependencies are installed
uv run python -m src.agent dev  # Run as module, not script
