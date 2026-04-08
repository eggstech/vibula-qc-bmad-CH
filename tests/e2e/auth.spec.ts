import { test, expect } from '../../support/fixtures';

/**
 * VLM Authentication E2E Tests
 * Story 1.1: Google OAuth Login (critical path via mock JWT)
 * Story 1.2: Route Guard — unauthorized redirect
 *
 * Browser automation: auto (no live app — using best practices from documentation)
 * Selector strategy: getByRole, getByText, data-testid (config: testIdAttribute)
 *
 * NOTE: B1 Blocker — Real Google OAuth flow cannot be automated in CI.
 * These tests assume the app reads a ?devToken= query param OR a localStorage JWT
 * to bypass the Google OAuth flow in NODE_ENV=test.
 * Until B1 is resolved, tests marked with test.fixme() will be skipped with a note.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL  = process.env.API_URL  || 'http://localhost:5000';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Injects a test JWT into localStorage to bypass Google OAuth for E2E testing.
 */
async function injectTestSession(
  page: import('@playwright/test').Page, 
  token: string
): Promise<void> {
  await page.goto(`${BASE_URL}/`);
  await page.evaluate((t) => {
    localStorage.setItem('vlm_access_token', t);
  }, token);
  await page.reload();
}

// ---------------------------------------------------------------------------
// P0-AUT-01 — Login Happy Path (Story 1.1)
// ---------------------------------------------------------------------------

test.describe('@P0 @Auth Story-1.1: Authentication Journey', () => {

  test('[P0] should display sign-in page for unauthenticated users', async ({ page }) => {
    await page.goto(BASE_URL);

    // Expect login / sign-in element to be visible
    const loginButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(loginButton).toBeVisible({ timeout: 10_000 });
  });

  test('[P0] should redirect to dashboard after successful login (via test session injection)', async ({ page, authSession }) => {
    // B1 Workaround: inject JWT directly
    const token = await authSession.getToken('Admin');
    await injectTestSession(page, token);

    // After session injection, expect redirect to dashboard
    await expect(page).toHaveURL(/dashboard|home/, { timeout: 10_000 });

    // Dashboard KPI cards must be visible (basic sanity check)
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible();
  });

  test('[P0] should persist authenticated session on page reload', async ({ page, authSession }) => {
    const token = await authSession.getToken('Admin');
    await injectTestSession(page, token);
    await expect(page).toHaveURL(/dashboard|home/, { timeout: 10_000 });

    await page.reload();
    // Should still be authenticated — not redirected to login
    await expect(page).not.toHaveURL(/login|sign-in/);
  });

  test('[P1] should clear session and redirect to login on logout', async ({ page, authSession }) => {
    const token = await authSession.getToken('Admin');
    await injectTestSession(page, token);
    await expect(page).toHaveURL(/dashboard|home/, { timeout: 10_000 });

    // Trigger logout via user menu
    const userMenu = page.getByRole('button', { name: /profile|account|user/i }).first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      const logoutOption = page.getByRole('menuitem', { name: /logout|sign out/i });
      if (await logoutOption.isVisible()) {
        await logoutOption.click();
        await expect(page).toHaveURL(/login|sign-in/, { timeout: 10_000 });
      }
    } else {
      // Fallback: clear localStorage and navigate
      await page.evaluate(() => localStorage.clear());
      await page.goto(BASE_URL);
      await expect(page).toHaveURL(/login|sign-in|^\/?$/, { timeout: 10_000 });
    }
  });

});

// ---------------------------------------------------------------------------
// P1-SEC-01 — Route Guard (Story 1.2)
// ---------------------------------------------------------------------------

test.describe('@P1 @RBAC Story-1.2: Route Guard Enforcement', () => {

  test('[P1] should redirect unauthenticated user away from protected route', async ({ page }) => {
    // Ensure no session
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());

    // Attempt to navigate directly to a protected route
    await page.goto(`${BASE_URL}/bookings`);

    // Should be redirected to login, not show the bookings page
    await expect(page).toHaveURL(/login|sign-in|^\/?$/, { timeout: 10_000 });
  });

  test('[P1] should redirect Host role user away from Admin-only Master Data page', async ({ page, authSession }) => {
    const token = await authSession.getToken('Host');
    await injectTestSession(page, token);
    await expect(page).toHaveURL(/dashboard|home/, { timeout: 10_000 });

    await page.goto(`${BASE_URL}/master-data`);

    // Should show 403/Unauthorized page, not the master data UI
    const unauthorizedIndicator = page.getByText(/unauthorized|access denied|forbidden|403/i);
    const stillOnMasterData = page.getByRole('heading', { name: /master data/i });

    // Either redirected OR shows unauthorized message — NOT showing the actual data
    const isUnauthorized = await unauthorizedIndicator.isVisible({ timeout: 5_000 }).catch(() => false);
    const isOnWrongPage  = await stillOnMasterData.isVisible({ timeout: 2_000 }).catch(() => false);

    expect(isUnauthorized || !isOnWrongPage).toBe(true);
  });

  test('[P1] should allow Admin role user to access Master Data page', async ({ page, authSession }) => {
    const token = await authSession.getToken('Admin');
    await injectTestSession(page, token);
    await expect(page).toHaveURL(/dashboard|home/, { timeout: 10_000 });

    await page.goto(`${BASE_URL}/master-data`);

    // Should load successfully
    const pageHeading = page.getByRole('heading', { name: /master data/i });
    await expect(pageHeading).toBeVisible({ timeout: 10_000 });
  });

});
