import type { Page, Response } from '@playwright/test';

/**
 * VLM Network Helpers
 * Intercept-first patterns for deterministic API assertions in E2E tests.
 * Usage: intercept → navigate → await intercepted call → assert.
 */

// ---------------------------------------------------------------------------
// Network Interceptor — intercept-before-navigate pattern
// ---------------------------------------------------------------------------

interface InterceptOptions {
  page:    Page;
  url:     string | RegExp;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

/**
 * Sets up a network wait BEFORE navigation occurs.
 * Returns a promise that resolves with the matched Response.
 *
 * Pattern (from intercept-network-call knowledge fragment):
 *   const apiCall = observeApiCall({ page, url: /\/api\/bookings/, method: 'POST' });
 *   await page.getByRole('button', { name: 'Save' }).click();
 *   const response = await apiCall;
 *   expect(response.status()).toBe(201);
 */
export const observeApiCall = (opts: InterceptOptions): Promise<Response> => {
  return opts.page.waitForResponse(
    (res) => {
      const urlMatch =
        typeof opts.url === 'string'
          ? res.url().includes(opts.url)
          : opts.url.test(res.url());
      const methodMatch = opts.method
        ? res.request().method().toUpperCase() === opts.method
        : true;
      return urlMatch && methodMatch;
    },
    { timeout: 15_000 },
  );
};

// ---------------------------------------------------------------------------
// Route Mock — stub API responses for isolated E2E tests
// ---------------------------------------------------------------------------

interface MockRouteOptions {
  page:    Page;
  url:     string | RegExp;
  status?: number;
  body:    unknown;
  headers?: Record<string, string>;
}

/**
 * Mocks a route to return a deterministic response.
 * Must be called BEFORE page.goto() for it to intercept the first load.
 *
 * Usage:
 *   await mockRoute({ page, url: /\/api\/settlements/, status: 200, body: { items: [] } });
 *   await page.goto('/settlements');
 */
export const mockRoute = async (opts: MockRouteOptions): Promise<void> => {
  await opts.page.route(opts.url, (route) => {
    route.fulfill({
      status:      opts.status ?? 200,
      contentType: 'application/json',
      body:        JSON.stringify(opts.body),
      headers:     opts.headers,
    });
  });
};

/**
 * Removes a previously mocked route.
 */
export const unmockRoute = async (page: Page, url: string | RegExp): Promise<void> => {
  await page.unroute(url);
};

// ---------------------------------------------------------------------------
// Error Response Mock — for testing error handling UI
// ---------------------------------------------------------------------------

/**
 * Mocks an API endpoint to return a server error (500).
 * Useful for testing error toasts, retry logic, etc.
 */
export const mockServerError = async (
  page: Page,
  url: string | RegExp,
  statusCode = 500,
  message = 'Internal Server Error',
): Promise<void> => {
  await mockRoute({
    page,
    url,
    status: statusCode,
    body:   { error: message },
  });
};

// ---------------------------------------------------------------------------
// Wait Helpers — deterministic waits (no hard sleep)
// ---------------------------------------------------------------------------

/**
 * Waits for a toast/notification message to appear and dismisses it.
 * Replaces brittle page.waitForTimeout() calls.
 */
export const waitForToast = async (
  page: Page,
  messagePattern: string | RegExp,
  timeoutMs = 5_000,
): Promise<void> => {
  const toast = page.getByRole('alert').filter({ hasText: messagePattern });
  await toast.waitFor({ state: 'visible', timeout: timeoutMs });
};

/**
 * Waits for a loading spinner to disappear before asserting final state.
 */
export const waitForLoadingComplete = async (
  page: Page,
  spinnerSelector = '[data-testid="loading-spinner"]',
  timeoutMs = 10_000,
): Promise<void> => {
  const spinner = page.locator(spinnerSelector);
  const isVisible = await spinner.isVisible().catch(() => false);
  if (isVisible) {
    await spinner.waitFor({ state: 'hidden', timeout: timeoutMs });
  }
};
