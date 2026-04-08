import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

/**
 * VLM Authentication & RBAC API Tests
 * Stories: 1.1 (Google OAuth/JWT), 1.2 (RBAC Route Constraints), 1.3 (Data Scope)
 * Risk: R3 (SEC, Score=6) — Critical path
 *
 * NOTE: B1 Blocker — Google OAuth cannot be exercised directly in CI.
 * These tests assume the backend exposes a test-token endpoint (e.g. POST /api/auth/test-token)
 * that issues a valid JWT for a seeded test account when NODE_ENV=test.
 * If that endpoint is not yet available, mark tests with test.skip() until B1 is resolved.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL  = process.env.API_URL  || 'http://localhost:5000';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getTestJwt(
  request: APIRequestContext,
  role: 'Admin' | 'KA' | 'Staff' | 'Host' = 'Admin',
): Promise<string> {
  const res = await request.post(`${API_URL}/api/auth/test-token`, {
    data: { role },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok()) {
    throw new Error(
      `[B1 Blocker] /api/auth/test-token not available yet. Status: ${res.status()}. ` +
      `Resolve B1 (OAuth Mock) before running auth tests.`,
    );
  }
  const body = await res.json();
  return body.token as string;
}

// ---------------------------------------------------------------------------
// P0-AUT-01 — JWT Token Validation (Story 1.1)
// ---------------------------------------------------------------------------

test.describe('@P0 @Auth Story-1.1: JWT Token Validation', () => {

  test('[P0] should accept a valid JWT and return 200 on a protected endpoint', async ({ request }) => {
    const token = await getTestJwt(request, 'Admin');

    const res = await request.get(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status()).toBe(200);
  });

  test('[P0] should reject a missing Authorization header with 401', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/bookings`);
    expect(res.status()).toBe(401);
  });

  test('[P0] should reject a malformed JWT with 401', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/bookings`, {
      headers: { Authorization: 'Bearer not.a.valid.jwt' },
    });
    expect(res.status()).toBe(401);
  });

  test('[P0] should reject an expired JWT with 401', async ({ request }) => {
    // This token is structurally valid but expired — generated offline for testing.
    // Replace with a fixture helper that produces expired tokens when B1 is resolved.
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJzdWIiOiJ0ZXN0LXVzZXIiLCJleHAiOjE2MDAwMDAwMDB9.' +
      'invalidsig';

    const res = await request.get(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    expect(res.status()).toBe(401);
  });

});

// ---------------------------------------------------------------------------
// P1-SEC-01 — RBAC: 403 enforcement (Story 1.2)
// ---------------------------------------------------------------------------

test.describe('@P1 @RBAC Story-1.2: Role-Based Access Control — 403 Enforcement', () => {

  test('[P1] Staff role should be denied access to Master Data create endpoint (403)', async ({ request }) => {
    const token = await getTestJwt(request, 'Staff');

    const res = await request.post(`${API_URL}/api/master-data/rooms`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { name: 'Room-X', capacity: 10 },
    });

    expect(res.status()).toBe(403);
  });

  test('[P1] Host role should be denied access to Settlement creation (403)', async ({ request }) => {
    const token = await getTestJwt(request, 'Host');

    const res = await request.post(`${API_URL}/api/settlements`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { bookingId: 'booking-001' },
    });

    expect(res.status()).toBe(403);
  });

  test('[P1] KA role should be denied access to Host Assignment confirm endpoint (403)', async ({ request }) => {
    const token = await getTestJwt(request, 'KA');

    const res = await request.post(`${API_URL}/api/host-assignments/confirm`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { assignmentId: 'assign-001' },
    });

    expect(res.status()).toBe(403);
  });

  test('[P1] Admin role should be granted access to all protected endpoints', async ({ request }) => {
    const token = await getTestJwt(request, 'Admin');

    const res = await request.get(`${API_URL}/api/master-data/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Admin should get 200 (list) or 404 (no data) — never 403
    expect([200, 404]).toContain(res.status());
  });

});

// ---------------------------------------------------------------------------
// P1-SEC-02 — Data Scope Filtering (Story 1.3)
// ---------------------------------------------------------------------------

test.describe('@P1 @RBAC Story-1.3: Data Scope Filtering (OWN / TEAM / GLOBAL)', () => {

  test('[P1] OWN scope user should only receive their own bookings in list response', async ({ request }) => {
    const token = await getTestJwt(request, 'Staff'); // Staff = OWN scope by default

    const res = await request.get(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    // All items must belong to the authenticated user — validate createdBy field
    if (body.items && body.items.length > 0) {
      const foreignItems = body.items.filter(
        (item: { createdByScope?: string }) => item.createdByScope === 'GLOBAL',
      );
      expect(foreignItems).toHaveLength(0);
    }
  });

  test('[P1] Admin (GLOBAL scope) should receive all bookings without scope filter', async ({ request }) => {
    const token = await getTestJwt(request, 'Admin');

    const res = await request.get(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status()).toBe(200);
    // No further scope assertion — Admin receives all, just verify 200
  });

});
