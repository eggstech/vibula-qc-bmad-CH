import { test, expect } from '../../support/fixtures';

/**
 * VLM Conflict Detection API Tests: Room
 */
const API_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('@P0 @RoomConflict Story-4.1: Room Conflict Detection', () => {

  const ROOM_ID = 'test-room-002';
  const START   = '2026-06-16T10:00:00Z';
  const END     = '2026-06-16T12:00:00Z';

  test('[P0] should block Room assignment to an overlapping time slot', async ({ authSession, seedFactory, request }) => {
    const token = await authSession.getToken('Admin');
    
    // Seed existing booking
    await seedFactory.createBookingSlot({ roomId: ROOM_ID, startTime: START, endTime: END });

    const res = await request.post(`${API_URL}/api/room-assignments/validate`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { roomId: ROOM_ID, startTime: START, endTime: END },
    });

    expect(res.status()).toBe(409);
    expect((await res.json()).conflictType).toBe('HARD');
  });

  test('[P0] should allow Room assignment to a non-overlapping slot', async ({ authSession, request }) => {
    const token = await authSession.getToken('Admin');
    const res = await request.post(`${API_URL}/api/room-assignments/validate`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { roomId: ROOM_ID, startTime: '2026-06-16T13:00:00Z', endTime: '2026-06-16T15:00:00Z' },
    });
    expect(res.status()).toBe(200);
  });

});
