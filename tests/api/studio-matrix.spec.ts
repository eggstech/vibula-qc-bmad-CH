import { test, expect } from '../../support/fixtures';

/**
 * Story 5.2: Studio Matrix & Room Conflicts
 * Verifies that the room allocation logic prevents schedule collisions.
 */

test.describe.parallel('@P0 @Studio Story 5.2: Studio Matrix Logic', () => {

  test('[P0] 5.2-API-001: Should prevent hard conflict (core time overlap)', async ({ request, authSession, seedFactory }) => {
    // 1. Setup: Create Room and Booking A (08:00 - 10:00)
    const adminToken = await authSession.getToken('Admin');
    const room = await seedFactory.createRoom({ name: 'Studio A' });
    
    await seedFactory.createBooking({ 
      roomId: room.id,
      startDate: '2026-10-01',
      startTime: 480, // 08:00
      endTime: 600,   // 10:00
      status: 'WIP'
    });

    // 2. Action: Attempt to assign Booking B to same room at 09:00 (Overlap)
    const bookingB = await seedFactory.createBooking({ 
      startDate: '2026-10-01',
      startTime: 540, // 09:00
      duration: 60
    });

    const res = await request.put(`/api/Admins/Booking/AssignToRoom`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        bookingId: bookingB.id,
        roomId: room.id
      }
    });

    // 3. Assert: Blocked with 400 Bad Request
    expect(res.status()).toBe(400);
    const result = await res.json();
    expect(result.message).toContain('đã có booking');
  });

  test('[P1] 5.2-API-002: Should respect setup/cleanup buffers', async ({ request, authSession, seedFactory }) => {
    // 1. Setup: Room and Booking A (08:00 - 10:00)
    // Assume buffers are 30 mins each (Effective: 07:30 - 10:30)
    const adminToken = await authSession.getToken('Admin');
    const room = await seedFactory.createRoom({ name: 'Studio B' });
    
    await seedFactory.createBooking({ 
      roomId: room.id,
      startDate: '2026-10-01',
      startTime: 480, // 08:00
      endTime: 600,   // 10:00
      status: 'WIP'
    });

    // 2. Action: Assign Booking B at 10:15 (Overlaps with Cleanup buffer of A)
    const bookingB = await seedFactory.createBooking({ 
      startDate: '2026-10-01',
      startTime: 615, // 10:15
      duration: 60
    });

    const res = await request.put(`/api/Admins/Booking/AssignToRoom`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        bookingId: bookingB.id,
        roomId: room.id
      }
    });

    // 3. Assert: Blocked by buffer overlap
    expect(res.status()).toBe(400);
  });

});
