#!/bin/bash
# burn-in.sh: Run burn-in loop for flaky detection

ITERATIONS=${1:-10}
echo "🔥 Starting burn-in loop with $ITERATIONS iterations..."

for i in $(seq 1 "$ITERATIONS"); do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔥 Burn-in iteration $i/$ITERATIONS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  npm run test:e2e || { echo "❌ Failed at iteration $i"; exit 1; }
done

echo "✅ Burn-in complete - no flaky tests detected"
