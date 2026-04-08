import { test, expect } from '../../support/fixtures';
import { createBookingPayload } from '../../support/helpers/data-factories';

/**
 * VLM Booking API Tests: Creation & Filtering
 * Story 3.2 (Draft), 3.3 (Bulk), 3.1 (List)
 */
const API_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('@P1 @Booking Story-3.1–3.3: Booking Creation & List', () => {

  test('[P1] should create a new booking in DRAFT state', async ({ authSession, request }) => {
    const token = await authSession.getToken('KA');
    const res = await request.post(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createBookingPayload({ title: 'Single Create Test' }),
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.status).toBe('DRAFT');
  });

  test('[P1] should reject booking creation with missing required fields', async ({ authSession, request }) => {
    const token = await authSession.getToken('KA');
    const res = await request.post(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { title: 'Invalid Booking' }, // Missing clientId, dates
    });

    expect(res.status()).toBe(400);
  });

  test('[P1] should create multiple bookings in bulk', async ({ authSession, request }) => {
    const token = await authSession.getToken('KA');
    const res = await request.post(`${API_URL}/api/bookings/bulk`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: {
        bookings: [
          createBookingPayload({ title: 'Bulk A' }),
          createBookingPayload({ title: 'Bulk B' }),
        ],
      },
    });

    expect([200, 201, 207]).toContain(res.status());
    const body = await res.json();
    const results = body.results || body;
    expect(results.length).toBe(2);
  });

  test('[P1] should filter booking list by status tab', async ({ authSession, request }) => {
    const token = await authSession.getToken('KA');
    const res = await request.get(`${API_URL}/api/bookings?status=DRAFT`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    if (body.items?.length > 0) {
      expect(body.items[0].status).toBe('DRAFT');
    }
  });

});
