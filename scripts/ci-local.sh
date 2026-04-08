#!/bin/bash
set -e

# ci-local.sh: Run tests in a CI-like environment locally

echo "🚀 Preparing CI-like environment..."
export CI=true
export NODE_ENV=test

# Ensure .env exists
if [ ! -f .env ]; then
  echo "⚠️ .env file missing. Copying from .env.example..."
  cp .env.example .env
fi

echo "📦 Installing dependencies..."
npm install

echo "🌐 Installing browsers..."
npx playwright install chromium

echo "🧪 Running E2E tests (Shard 1/1)..."
npm run test:e2e
