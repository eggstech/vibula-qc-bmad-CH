import { test, expect } from '../../support/fixtures';
import { faker } from '@faker-js/faker';

/**
 * Story 5.3: Auto-Allocate Engine
 * Verifies the scoring logic, conflict prevention, and buffer management.
 */

test.describe.parallel('@P0 @Booking Story 5.3: Auto-Allocate Engine Logic', () => {

  test('[P0] 5.3-API-001: Should allocate room with highest score (Match Customer+Brand)', async ({ request, authSession, seedFactory }) => {
    // 1. Setup: Create Room A (Pref: Cust 1 + Brand 1) and Room B (No pref)
    const { customerId, brandId } = await seedFactory.createCustomerWithBrand();
    const roomA = await seedFactory.createRoom({
      code: 'R-HIGH-PREF',
      preferences: [{ customerId, brandId }]
    });
    const roomB = await seedFactory.createRoom({ code: 'R-NO-PREF' });
    
    // 2. Setup: Create a booking for Customer 1 + Brand 1
    const bookingCode = `BK-AUTO-${faker.string.alphanumeric(5).toUpperCase()}`;
    const booking = await seedFactory.createBooking({
      code: bookingCode,
      customerId,
      brandId,
      startDate: '2026-05-10',
      startTime: 600, // 10:00
      duration: 120, // 2h
      status: 'WIP'
    });

    // 3. Action: Validate Auto-Allocate
    const adminToken = await authSession.getToken('Admin');
    const res = await request.post('/api/Admins/Booking/ValidateAutoAllocateRooms', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { bookingIds: [booking.id] }
    });

    // 4. Assert: Room A should be selected with +20 points
    expect(res.status()).toBe(200);
    const body = await res.json();
    const assignment = body.validItems.find((v: any) => v.bookingId === booking.id);
    expect(assignment.roomId).toBe(roomA.id);
    expect(assignment.totalScore).toBeGreaterThanOrEqual(20);
    expect(assignment.scoreLines.some((l: any) => l.description.includes('khách hàng + thương hiệu'))).toBe(true);
  });

  test('[P0] 5.3-API-003: Should prevent allocation due to Setup/Cleanup buffer conflicts', async ({ request, authSession, seedFactory }) => {
    // 1. Setup: Room X occupied from 10:00 - 12:00
    // System setting: 30min cleanup
    const roomX = await seedFactory.createRoom({ code: 'R-BUFFER-TEST' });
    await seedFactory.createBooking({
      roomId: roomX.id,
      startDate: '2026-06-01',
      startTime: 600, // 10:00
      endTime: 720,   // 12:00
      status: 'CONFIRMED'
    });

    // 2. Setup: New booking at 12:15 (Should conflict with 30min cleanup until 12:30)
    const booking = await seedFactory.createBooking({
      startDate: '2026-06-01',
      startTime: 735, // 12:15
      duration: 60,
      status: 'WIP'
    });

    // 3. Action: Validate Auto-Allocate
    const adminToken = await authSession.getToken('Admin');
    const res = await request.post('/api/Admins/Booking/ValidateAutoAllocateRooms', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { bookingIds: [booking.id] }
    });

    // 4. Assert: Booking should be invalid for Room X
    expect(res.status()).toBe(200);
    const body = await res.json();
    const invalidItem = body.invalidItems.find((i: any) => i.bookingId === booking.id);
    expect(invalidItem.rejectionReason).toContain('trùng khung (kể cả buffer)');
  });

  test('[P1] 5.3-API-004: Should handle batch isolation (virtual occupancy) within a single request', async ({ request, authSession, seedFactory }) => {
    // 1. Setup: Only 1 Room available
    const singleRoom = await seedFactory.createRoom({ code: 'R-SINGLE' });
    
    // 2. Setup: 2 Bookings for the same time slot
    const b1 = await seedFactory.createBooking({ startDate: '2026-07-01', startTime: 600, duration: 60 });
    const b2 = await seedFactory.createBooking({ startDate: '2026-07-01', startTime: 600, duration: 60 });

    // 3. Action: Validate both in one batch
    const adminToken = await authSession.getToken('Admin');
    const res = await request.post('/api/Admins/Booking/ValidateAutoAllocateRooms', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { bookingIds: [b1.id, b2.id] }
    });

    // 4. Assert: One valid, one invalid
    const body = await res.json();
    expect(body.validItems.length).toBe(1);
    expect(body.invalidItems.length).toBe(1);
  });

});
