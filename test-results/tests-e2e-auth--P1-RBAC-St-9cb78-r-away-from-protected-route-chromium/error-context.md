# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/e2e/auth.spec.ts >> @P1 @RBAC Story-1.2: Route Guard Enforcement >> [P1] should redirect unauthenticated user away from protected route
- Location: tests/e2e/auth.spec.ts:105:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  7   |  *
  8   |  * Browser automation: auto (no live app — using best practices from documentation)
  9   |  * Selector strategy: getByRole, getByText, data-testid (config: testIdAttribute)
  10  |  *
  11  |  * NOTE: B1 Blocker — Real Google OAuth flow cannot be automated in CI.
  12  |  * These tests assume the app reads a ?devToken= query param OR a localStorage JWT
  13  |  * to bypass the Google OAuth flow in NODE_ENV=test.
  14  |  * Until B1 is resolved, tests marked with test.fixme() will be skipped with a note.
  15  |  */
  16  | 
  17  | const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  18  | const API_URL  = process.env.API_URL  || 'http://localhost:5000';
  19  | 
  20  | // ---------------------------------------------------------------------------
  21  | // Helpers
  22  | // ---------------------------------------------------------------------------
  23  | 
  24  | /**
  25  |  * Injects a test JWT into localStorage to bypass Google OAuth for E2E testing.
  26  |  */
  27  | async function injectTestSession(
  28  |   page: import('@playwright/test').Page, 
  29  |   token: string
  30  | ): Promise<void> {
  31  |   await page.goto(`${BASE_URL}/`);
  32  |   await page.evaluate((t) => {
  33  |     localStorage.setItem('vlm_access_token', t);
  34  |   }, token);
  35  |   await page.reload();
  36  | }
  37  | 
  38  | // ---------------------------------------------------------------------------
  39  | // P0-AUT-01 — Login Happy Path (Story 1.1)
  40  | // ---------------------------------------------------------------------------
  41  | 
  42  | test.describe('@P0 @Auth Story-1.1: Authentication Journey', () => {
  43  | 
  44  |   test('[P0] should display sign-in page for unauthenticated users', async ({ page }) => {
  45  |     await page.goto(BASE_URL);
  46  | 
  47  |     // Expect login / sign-in element to be visible
  48  |     const loginButton = page.getByRole('button', { name: /sign in with google/i });
  49  |     await expect(loginButton).toBeVisible({ timeout: 10_000 });
  50  |   });
  51  | 
  52  |   test('[P0] should redirect to dashboard after successful login (via test session injection)', async ({ page, authSession }) => {
  53  |     // B1 Workaround: inject JWT directly
  54  |     const token = await authSession.getToken('Admin');
  55  |     await injectTestSession(page, token);
  56  | 
  57  |     // After session injection, expect redirect to dashboard
  58  |     await expect(page).toHaveURL(/dashboard|home/, { timeout: 10_000 });
  59  | 
  60  |     // Dashboard KPI cards must be visible (basic sanity check)
  61  |     const mainContent = page.getByRole('main');
  62  |     await expect(mainContent).toBeVisible();
  63  |   });
  64  | 
  65  |   test('[P0] should persist authenticated session on page reload', async ({ page, authSession }) => {
  66  |     const token = await authSession.getToken('Admin');
  67  |     await injectTestSession(page, token);
  68  |     await expect(page).toHaveURL(/dashboard|home/, { timeout: 10_000 });
  69  | 
  70  |     await page.reload();
  71  |     // Should still be authenticated — not redirected to login
  72  |     await expect(page).not.toHaveURL(/login|sign-in/);
  73  |   });
  74  | 
  75  |   test('[P1] should clear session and redirect to login on logout', async ({ page, authSession }) => {
  76  |     const token = await authSession.getToken('Admin');
  77  |     await injectTestSession(page, token);
  78  |     await expect(page).toHaveURL(/dashboard|home/, { timeout: 10_000 });
  79  | 
  80  |     // Trigger logout via user menu
  81  |     const userMenu = page.getByRole('button', { name: /profile|account|user/i }).first();
  82  |     if (await userMenu.isVisible()) {
  83  |       await userMenu.click();
  84  |       const logoutOption = page.getByRole('menuitem', { name: /logout|sign out/i });
  85  |       if (await logoutOption.isVisible()) {
  86  |         await logoutOption.click();
  87  |         await expect(page).toHaveURL(/login|sign-in/, { timeout: 10_000 });
  88  |       }
  89  |     } else {
  90  |       // Fallback: clear localStorage and navigate
  91  |       await page.evaluate(() => localStorage.clear());
  92  |       await page.goto(BASE_URL);
  93  |       await expect(page).toHaveURL(/login|sign-in|^\/?$/, { timeout: 10_000 });
  94  |     }
  95  |   });
  96  | 
  97  | });
  98  | 
  99  | // ---------------------------------------------------------------------------
  100 | // P1-SEC-01 — Route Guard (Story 1.2)
  101 | // ---------------------------------------------------------------------------
  102 | 
  103 | test.describe('@P1 @RBAC Story-1.2: Route Guard Enforcement', () => {
  104 | 
  105 |   test('[P1] should redirect unauthenticated user away from protected route', async ({ page }) => {
  106 |     // Ensure no session
> 107 |     await page.goto(BASE_URL);
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  108 |     await page.evaluate(() => localStorage.clear());
  109 | 
  110 |     // Attempt to navigate directly to a protected route
  111 |     await page.goto(`${BASE_URL}/bookings`);
  112 | 
  113 |     // Should be redirected to login, not show the bookings page
  114 |     await expect(page).toHaveURL(/login|sign-in|^\/?$/, { timeout: 10_000 });
  115 |   });
  116 | 
  117 |   test('[P1] should redirect Host role user away from Admin-only Master Data page', async ({ page, authSession }) => {
  118 |     const token = await authSession.getToken('Host');
  119 |     await injectTestSession(page, token);
  120 |     await expect(page).toHaveURL(/dashboard|home/, { timeout: 10_000 });
  121 | 
  122 |     await page.goto(`${BASE_URL}/master-data`);
  123 | 
  124 |     // Should show 403/Unauthorized page, not the master data UI
  125 |     const unauthorizedIndicator = page.getByText(/unauthorized|access denied|forbidden|403/i);
  126 |     const stillOnMasterData = page.getByRole('heading', { name: /master data/i });
  127 | 
  128 |     // Either redirected OR shows unauthorized message — NOT showing the actual data
  129 |     const isUnauthorized = await unauthorizedIndicator.isVisible({ timeout: 5_000 }).catch(() => false);
  130 |     const isOnWrongPage  = await stillOnMasterData.isVisible({ timeout: 2_000 }).catch(() => false);
  131 | 
  132 |     expect(isUnauthorized || !isOnWrongPage).toBe(true);
  133 |   });
  134 | 
  135 |   test('[P1] should allow Admin role user to access Master Data page', async ({ page, authSession }) => {
  136 |     const token = await authSession.getToken('Admin');
  137 |     await injectTestSession(page, token);
  138 |     await expect(page).toHaveURL(/dashboard|home/, { timeout: 10_000 });
  139 | 
  140 |     await page.goto(`${BASE_URL}/master-data`);
  141 | 
  142 |     // Should load successfully
  143 |     const pageHeading = page.getByRole('heading', { name: /master data/i });
  144 |     await expect(pageHeading).toBeVisible({ timeout: 10_000 });
  145 |   });
  146 | 
  147 | });
  148 | 
```