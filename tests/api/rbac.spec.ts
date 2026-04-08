import { test, expect } from '../../support/fixtures';

/**
 * Story 3.4: RBAC & Permissions
 * Verifies that roles and permissions correctly restrict access to business actions.
 */

test.describe.parallel('@P0 @RBAC Story 3.4: Role-Based Access Control', () => {

  test('[P0] 3.4-API-001: KA role should be forbidden from Master Data actions', async ({ request, authSession }) => {
    // 1. Setup: Get KA token
    const kaToken = await authSession.getToken('KA');

    // 2. Action: Attempt to create a room (Admin only)
    const res = await request.post('/api/Admins/Room', {
      headers: { Authorization: `Bearer ${kaToken}` },
      data: { name: 'Unauthorized Room', code: 'UNAUTH-01' }
    });

    // 3. Assert: 403 Forbidden
    expect(res.status()).toBe(403);
  });

  test('[P0] 3.4-API-002: Guest/Unauthenticated should be unauthorized', async ({ request }) => {
    // 1. Action: Call a protected endpoint without token
    const res = await request.get('/api/Admins/Booking/List');

    // 2. Assert: 401 Unauthorized
    expect(res.status()).toBe(401);
  });

  test('[P1] 3.4-API-003: Admin should have full access to all endpoints', async ({ request, authSession }) => {
    // 1. Setup: Get Admin token
    const adminToken = await authSession.getToken('Admin');

    // 2. Action: Call Admin Booking List
    const res = await request.get('/api/Admins/Booking/List', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    // 3. Assert: 200 OK
    expect(res.status()).toBe(200);
  });

});
