import { test, expect } from '../../support/fixtures';
import { createSettlementPayload } from '../../support/helpers/data-factories';

/**
 * VLM Financial Settlements API Tests: Logic & Statistics
 * Story 6.2 (Creation), 6.1 (List & Stats)
 */
const API_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('@P0 @Settlements Story-6.2: Verified-Only Settlement Creation Logic', () => {

  test('[P0] should create a settlement only mapping verified slots', async ({ authSession, seedFactory, request }) => {
    const token = await authSession.getToken('Accounting');
    
    // Seed one verified, one unverified
    const verifiedSlot = await seedFactory.createBookingSlot({ verified: true });
    const unverifiedSlot = await seedFactory.createBookingSlot({ verified: false });

    const res = await request.post(`${API_URL}/api/settlements`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createSettlementPayload([verifiedSlot.id, unverifiedSlot.id]),
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    
    const mappedIds = body.slots.map((s: { id: string }) => s.id);
    expect(mappedIds).toContain(verifiedSlot.id);
    expect(mappedIds).not.toContain(unverifiedSlot.id);
  });

  test('[P0] should compute correct host pay amount (baseRate × duration)', async ({ authSession, seedFactory, request }) => {
    const token = await authSession.getToken('Accounting');
    
    // 200,000 VND/hour × 2 hours = 400,000 VND
    const slot = await seedFactory.createBookingSlot({ 
      verified: true, 
      baseRate: 200000, 
      durationMinutes: 120 
    });

    const res = await request.post(`${API_URL}/api/settlements`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createSettlementPayload([slot.id]),
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    const settlementSlot = body.slots.find((s: { id: string }) => s.id === slot.id);
    expect(settlementSlot.calculatedPay).toBe(400000);
  });

});

test.describe('@P2 @Settlements Story-6.1: Settlements List & Statistics', () => {

  test('[P2] should return settlements list with pagination', async ({ authSession, request }) => {
    const token = await authSession.getToken('Accounting');
    const res = await request.get(`${API_URL}/api/settlements?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.items).toBeDefined();
    expect(body.items.length).toBeLessThanOrEqual(10);
  });

  test('[P2] should return settlement statistics dashboard data', async ({ authSession, request }) => {
    const token = await authSession.getToken('Accounting');
    const res = await request.get(`${API_URL}/api/settlements/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('draft');
    expect(body).toHaveProperty('pending');
  });

});
