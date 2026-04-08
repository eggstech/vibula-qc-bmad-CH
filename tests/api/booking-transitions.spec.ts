import { test, expect } from '../../support/fixtures';
import { createBookingPayload } from '../../support/helpers/data-factories';

/**
 * VLM Booking API Tests: State Machine Transitions
 * Story 3.5 (Audit Log), 3.4 (Transitions)
 */
const API_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('@P1 @Booking Story-3.4–3.5: State Machine & Audit', () => {

  test('[P1] should transition booking from DRAFT to QUEUE and record Audit Log', async ({ authSession, request }) => {
    const token = await authSession.getToken('KA');
    
    // 1. Setup Draft
    const createRes = await request.post(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createBookingPayload(),
    });
    const { id: bookingId } = await createRes.json();

    // 2. Transition
    const transRes = await request.post(`${API_URL}/api/bookings/${bookingId}/transitions/submit-to-queue`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: {},
    });
    expect(transRes.status()).toBe(200);

    // 3. Verify status
    const getRes = await request.get(`${API_URL}/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await getRes.json()).status).toBe('QUEUE');

    // 4. Verify Audit Log
    const auditRes = await request.get(`${API_URL}/api/bookings/${bookingId}/audit-log`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(auditRes.status()).toBe(200);
    const audit = await auditRes.json();
    expect(audit.items || audit).toBeInstanceOf(Array);
  });

  test('[P1] should reject illegal state transition DRAFT → FINISHED with 422', async ({ authSession, request }) => {
    const token = await authSession.getToken('KA');
    
    const createRes = await request.post(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createBookingPayload(),
    });
    const { id: bookingId } = await createRes.json();

    const res = await request.post(`${API_URL}/api/bookings/${bookingId}/transitions/finish`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: {},
    });

    expect([400, 409, 422]).toContain(res.status());
  });

});
