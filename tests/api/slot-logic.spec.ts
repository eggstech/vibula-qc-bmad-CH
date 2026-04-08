import { test, expect } from '../../support/fixtures';
import { faker } from '@faker-js/faker';

/**
 * Story 4.3: Slot Logic (Splitting & Extensions)
 * Verifies that bookings can be decomposed into manageable slots with correct hierarchy.
 */

test.describe.parallel('@P0 @Booking Story 4.3: Slot Logic', () => {

  test('[P0] 4.3-API-001: Should bulk create multiple slots for a booking', async ({ request, authSession, seedFactory }) => {
    // 1. Setup: Create a 4-hour booking (240 mins)
    const adminToken = await authSession.getToken('Admin');
    const booking = await seedFactory.createBooking({ 
      code: `BK-SLOT-${faker.string.alphanumeric(4)}`,
      duration: 240,
      startDate: '2026-09-01',
      startTime: 480 // 08:00
    });

    // 2. Action: Bulk create 2 slots (120 mins each)
    const res = await request.post('/api/Admins/BookingSlot/BulkCreate', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        bookingId: booking.id,
        bookingSlots: [
          { startTime: 480, endTime: 600, duration: 120, note: 'Slot 1' },
          { startTime: 600, endTime: 720, duration: 120, note: 'Slot 2' }
        ]
      }
    });

    // 3. Assert: Success and check data
    expect(res.status()).toBe(200);
    const result = await res.json();
    expect(result.data).toHaveLength(2);
  });

  test('[P0] 4.3-API-002: Should create an extension slot linked to parent', async ({ request, authSession, seedFactory }) => {
    // 1. Setup: Create booking and root slot
    const adminToken = await authSession.getToken('Admin');
    const booking = await seedFactory.createBooking({ duration: 60 });
    const slot = await seedFactory.createBookingSlot({ bookingId: booking.id, durationMinutes: 60 } as any);

    // 2. Action: Create extend slot
    const res = await request.post('/api/Admins/BookingSlot/CreateExtendSlot', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        parentSlotId: slot.id,
        duration: 30,
        startTime: 60, // Relative or absolute? Usually absolute mins from midnight
        endTime: 90
      }
    });

    // 3. Assert
    expect(res.status()).toBe(200);
    const extendResult = await res.json();
    expect(extendResult.data).toBeDefined();
  });

  test('[P1] 4.3-API-003: Should fail when slot is outside booking time range', async ({ request, authSession, seedFactory }) => {
    // 1. Setup: 1-hour booking (08:00 - 09:00)
    const adminToken = await authSession.getToken('Admin');
    const booking = await seedFactory.createBooking({ 
      startTime: 480, 
      endTime: 540,
      duration: 60 
    });

    // 2. Action: Create slot starting at 10:00 (600)
    const res = await request.post('/api/Admins/BookingSlot/BulkCreate', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        bookingId: booking.id,
        bookingSlots: [
          { startTime: 600, endTime: 660, duration: 60 }
        ]
      }
    });

    // 3. Assert: 400 Bad Request (Business Logic Error)
    expect(res.status()).toBe(400);
  });

});
