# CI/CD Pipeline Guide

This project uses **GitHub Actions** for continuous integration and quality gates.

## Pipeline Overview

The pipeline is defined in `.github/workflows/test.yml` and includes the following stages:

1.  **Test**: Runs Playwright E2E tests in parallel across 4 shards.
2.  **Burn-In**: Runs 10 iterations of the test suite on PRs to detect flaky tests.
3.  **Report**: Collects results and uploads failure artifacts (traces, videos, screenshots).

## Local Usage

You can mirror the CI environment locally using the provided helper scripts:

-   `./scripts/ci-local.sh`: Runs a full setup and test cycle.
-   `./scripts/burn-in.sh [num]`: Runs the flaky detection loop (default 10).
-   `./scripts/test-changed.sh`: Only runs tests for files changed since `main`.

## Debugging Failures

If the CI fails:
1.  Go to the **Actions** tab in GitHub.
2.  Select the failed run.
3.  Download the **artifacts** (e.g., `test-results-1`).
4.  Open the trace files using: `npx playwright show-trace path/to/trace.zip`.
