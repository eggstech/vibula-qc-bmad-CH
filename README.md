# VLM Testing Framework

## Setup Instructions
1. Install Node.js v24 (refer to `.nvmrc`).
2. Run `npm install` to install Playwright and dependencies.
3. Setup an `.env` file based on `.env.example` with correct `BASE_URL` and `API_URL`.

## Running Tests
- Headless execution: `npm run test:e2e`
- Interactive UI mode: `npm run test:ui` 
- Debug mode: `npx playwright test --debug`

## Architecture Overview
- `e2e/`: Main End-to-End and API test declarations grouped by scope.
- `support/fixtures/`: Playwright Fixtures providing execution context isolating states per test via `test.extend()`.
- `support/helpers/`: Reusable pure utility logic for actions like API calls.
- `support/page-objects/`: Page Object Models abstracting specific dashboard pages.

## Best Practices
- **Selectors:** Exclusively utilize `data-testid` natively by relying on `page.getByTestId()`.
- **Isolation:** Every test must instantiate its individual testing context/scenario natively ensuring total domain isolation without sharing user state.
- **Cleanup:** All fixtures generating persistent background data must include automatic teardown steps implemented within the fixture closure.

## CI Integration
Playwright handles parallelism safely and hooks dynamically into Jenkins / GitHub Actions via defined `playwright.config.ts` profiles out of the box. Output is configured for Native JUnit format compatible automatically with the Allure Reporter.
