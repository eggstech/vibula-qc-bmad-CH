import { test, expect } from '../../support/fixtures';
import { createHostAssignment } from '../../support/helpers/data-factories';

/**
 * VLM Conflict Detection API Tests: Host
 */
const API_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('@P0 @HostConflict Story-4.1: Host Conflict Detection', () => {

  const HOST_ID = 'test-host-001';
  const START   = '2026-06-15T09:00:00Z';
  const END     = '2026-06-15T11:00:00Z';

  test('[P0] should block Host assignment to overlapping time slots', async ({ authSession, seedFactory, request }) => {
    const token = await authSession.getToken('Admin');
    
    // Seed existing booking via seedFactory (deterministic dates)
    await seedFactory.createBookingSlot({ hostId: HOST_ID, startTime: START, endTime: END });

    // 1. Exact overlap
    const res1 = await request.post(`${API_URL}/api/host-assignments/validate`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createHostAssignment({ hostId: HOST_ID, startTime: START, endTime: END }),
    });
    expect(res1.status()).toBe(409);
    expect((await res1.json()).conflictType).toBe('HARD');

    // 2. Partial overlap (start inside)
    const res2 = await request.post(`${API_URL}/api/host-assignments/validate`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createHostAssignment({ hostId: HOST_ID, startTime: '2026-06-15T10:00:00Z', endTime: '2026-06-15T12:00:00Z' }),
    });
    expect(res2.status()).toBe(409);
  });

  test('[P1] should allow Host assignment to a non-overlapping slot', async ({ authSession, request }) => {
    const token = await authSession.getToken('Admin');
    const res = await request.post(`${API_URL}/api/host-assignments/validate`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createHostAssignment({ hostId: HOST_ID, startTime: '2026-06-15T14:00:00Z', endTime: '2026-06-15T16:00:00Z' }),
    });
    expect(res.status()).toBe(200);
  });

});
