import { test, expect } from '../../support/fixtures';

/**
 * VLM Booking Creation E2E Tests
 * Story 3.2: Single Booking Creation via Slide-in Drawer (UX-DR1)
 * Story 3.3: Bulk Booking Creation (Spreadsheet Engine)
 *
 * Selector strategy:
 *  - getByRole (preferred): buttons, headings, textboxes, dialogs
 *  - getByLabel: form inputs
 *  - data-testid: complex components (data-testid=booking-drawer, booking-status-badge)
 * 
 * Network-first pattern: intercept API calls before navigation to assert requests.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL  = process.env.API_URL  || 'http://localhost:5000';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loginAsKA(page: import('@playwright/test').Page, token: string): Promise<void> {
  await page.goto(`${BASE_URL}/`);
  await page.evaluate((t) => localStorage.setItem('vlm_access_token', t), token);
  await page.reload();
  await page.waitForURL(/dashboard|bookings/, { timeout: 10_000 });
}

// ---------------------------------------------------------------------------
// P1 — Single Booking Creation via Drawer (Story 3.2 / UX-DR1)
// ---------------------------------------------------------------------------

test.describe('@P1 @Booking Story-3.2: Single Booking Creation (UX-DR1 Drawer)', () => {

  test('[P1] should open right-panel drawer when "New Booking" button is clicked', async ({ page, authSession }) => {
    const token = await authSession.getToken('KA');
    await loginAsKA(page, token);
    await page.goto(`${BASE_URL}/bookings`);

    // Click "New Booking" button
    await page.getByRole('button', { name: /new booking/i }).click();

    // Drawer should slide in from the right (UX-DR1)
    const drawer = page.getByTestId('booking-drawer');
    await expect(drawer).toBeVisible({ timeout: 5_000 });
  });

  test('[P1] should create a new booking and save it as DRAFT', async ({ page, authSession }) => {
    const token = await authSession.getToken('KA');
    await loginAsKA(page, token);
    await page.goto(`${BASE_URL}/bookings`);

    // Intercept the booking creation API call
    const bookingApiCall = page.waitForResponse(
      (res) => res.url().includes('/api/bookings') && res.request().method() === 'POST',
    );

    // Open drawer
    await page.getByRole('button', { name: /new booking/i }).click();
    const drawer = page.getByTestId('booking-drawer');
    await expect(drawer).toBeVisible({ timeout: 5_000 });

    // Fill form fields
    await page.getByLabel(/client/i).fill('Test Client');
    await page.getByRole('option', { name: /test client/i }).first().click().catch(() => {});

    await page.getByLabel(/title|booking name/i).fill('E2E Test Booking');

    // Date-time pickers
    const startInput = page.getByTestId('booking-start-time').or(page.getByLabel(/start time/i));
    await startInput.fill('2026-07-20T09:00');

    const endInput = page.getByTestId('booking-end-time').or(page.getByLabel(/end time/i));
    await endInput.fill('2026-07-20T11:00');

    // Save the booking
    await page.getByRole('button', { name: /save|create|submit/i }).click();

    // Wait for API response
    const response = await bookingApiCall;
    expect(response.status()).toBe(201);

    // Drawer should close after successful save
    await expect(drawer).not.toBeVisible({ timeout: 5_000 });

    // New booking should appear in the DRAFT tab
    await page.getByRole('tab', { name: /draft/i }).click();
    await expect(page.getByText('E2E Test Booking').first()).toBeVisible({ timeout: 5_000 });
  });

  test('[P1] should keep user on booking list while drawer is open (context preservation)', async ({ page, authSession }) => {
    const token = await authSession.getToken('KA');
    await loginAsKA(page, token);
    await page.goto(`${BASE_URL}/bookings`);

    await page.getByRole('button', { name: /new booking/i }).click();
    const drawer = page.getByTestId('booking-drawer');
    await expect(drawer).toBeVisible({ timeout: 5_000 });

    // The background booking list should still be visible
    const bookingList = page.getByRole('table').or(page.getByTestId('booking-list'));
    await expect(bookingList).toBeVisible();

    // URL should not change to a new page
    expect(page.url()).toContain('/bookings');
  });

  test('[P1] should close drawer without saving when cancel/close is clicked', async ({ page, authSession }) => {
    const token = await authSession.getToken('KA');
    await loginAsKA(page, token);
    await page.goto(`${BASE_URL}/bookings`);

    await page.getByRole('button', { name: /new booking/i }).click();
    const drawer = page.getByTestId('booking-drawer');
    await expect(drawer).toBeVisible({ timeout: 5_000 });

    // Cancel / close button
    await page.getByRole('button', { name: /cancel|close|dismiss/i }).first().click();
    await expect(drawer).not.toBeVisible({ timeout: 3_000 });
  });

  test('[P1] should show validation errors for missing required fields', async ({ page, authSession }) => {
    const token = await authSession.getToken('KA');
    await loginAsKA(page, token);
    await page.goto(`${BASE_URL}/bookings`);

    await page.getByRole('button', { name: /new booking/i }).click();
    const drawer = page.getByTestId('booking-drawer');
    await expect(drawer).toBeVisible({ timeout: 5_000 });

    // Submit with empty form
    await page.getByRole('button', { name: /save|create|submit/i }).click();

    // Validation error messages should appear
    const errorMessage = page.getByText(/required|please fill|cannot be empty/i).first();
    await expect(errorMessage).toBeVisible({ timeout: 3_000 });
  });

});

// ---------------------------------------------------------------------------
// P1 — Booking Status Tabs & List View (Story 3.1)
// ---------------------------------------------------------------------------

test.describe('@P1 @Booking Story-3.1: Booking Dashboard Status Tabs', () => {

  test('[P1] should show status tabs (Draft, Queue, Assigned, Finished, Rejected)', async ({ page, authSession }) => {
    const token = await authSession.getToken('KA');
    await loginAsKA(page, token);
    await page.goto(`${BASE_URL}/bookings`);

    // All lifecycle state tabs must be visible
    for (const tabLabel of ['Draft', 'Queue', 'Assigned', 'Finished', 'Rejected']) {
      const tab = page.getByRole('tab', { name: new RegExp(tabLabel, 'i') });
      await expect(tab).toBeVisible({ timeout: 5_000 });
    }
  });

  test('[P1] should filter list to show only DRAFT bookings when Draft tab clicked', async ({ page, authSession }) => {
    const token = await authSession.getToken('KA');
    await loginAsKA(page, token);
    await page.goto(`${BASE_URL}/bookings`);

    await page.getByRole('tab', { name: /draft/i }).click();

    // All visible status badges must be DRAFT
    const statusBadges = page.getByTestId('booking-status-badge');
    const count = await statusBadges.count();
    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toHaveText(/draft/i);
    }
  });

});
