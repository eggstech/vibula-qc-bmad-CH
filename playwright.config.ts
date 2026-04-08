import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config();

export default defineConfig({
  testDir: './',
  testMatch: ['e2e/**/*.spec.ts', 'tests/**/*.spec.ts'],
  timeout: 60 * 1000, // 60s test
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results/junit-results.xml' }],
    ['list']
  ],
  use: {
    actionTimeout: 15 * 1000, // action 15s
    navigationTimeout: 30 * 1000, // navigation 30s
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add additional targets as needed depending on test design
  ],
});
