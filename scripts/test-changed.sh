#!/bin/bash
# test-changed.sh: Run Playwright tests only for changed files

echo "🔍 Detecting changed test files..."

# Get list of changed files compared to main
CHANGED_FILES=$(git diff --name-only main...HEAD | grep '\.spec\.ts$' || true)

if [ -z "$CHANGED_FILES" ]; then
  echo "✅ No changed test files found. Running all tests."
  npm run test:e2e
else
  echo "🧪 Running tests for changed files:"
  echo "$CHANGED_FILES"
  npx playwright test $CHANGED_FILES
fi
