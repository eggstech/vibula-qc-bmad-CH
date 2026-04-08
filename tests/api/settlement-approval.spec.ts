import { test, expect } from '../../support/fixtures';
import { createSettlementPayload } from '../../support/helpers/data-factories';

/**
 * VLM Financial Settlements API Tests: Double Approval Flow
 * Story 6.3 (Audit Log + Double Approval)
 */
const API_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('@P1 @Settlements Story-6.3: Double Approval Flow', () => {

  test('[P1] should require first approval (Accounting) then second approval (Director)', async ({ authSession, seedFactory, request }) => {
    const accToken = await authSession.getToken('Accounting');
    const dirToken = await authSession.getToken('Director');
    
    // Setup: Seed slot and create settlement
    const slot = await seedFactory.createBookingSlot({ verified: true });
    const createRes = await request.post(`${API_URL}/api/settlements`, {
      headers: { Authorization: `Bearer ${accToken}`, 'Content-Type': 'application/json' },
      data: createSettlementPayload([slot.id]),
    });
    const { id: settlementId } = await createRes.json();

    // 1. Attempt final approval before first approval (should fail)
    const failRes = await request.post(`${API_URL}/api/settlements/${settlementId}/approve/final`, {
        headers: { Authorization: `Bearer ${dirToken}`, 'Content-Type': 'application/json' },
        data: {},
    });
    expect([400, 409, 422]).toContain(failRes.status());

    // 2. Perform first approval
    const firstRes = await request.post(`${API_URL}/api/settlements/${settlementId}/approve/first`, {
        headers: { Authorization: `Bearer ${accToken}`, 'Content-Type': 'application/json' },
        data: {},
    });
    expect(firstRes.status()).toBe(200);

    // 3. Status should be PENDING_FINAL
    const getRes = await request.get(`${API_URL}/api/settlements/${settlementId}`, {
        headers: { Authorization: `Bearer ${accToken}` },
    });
    expect((await getRes.json()).status).toBe('PENDING_FINAL');

    // 4. Perform final approval
    const finalRes = await request.post(`${API_URL}/api/settlements/${settlementId}/approve/final`, {
        headers: { Authorization: `Bearer ${dirToken}`, 'Content-Type': 'application/json' },
        data: {},
    });
    expect(finalRes.status()).toBe(200);

    // 5. Final status check: APPROVED
    const finalGet = await request.get(`${API_URL}/api/settlements/${settlementId}`, {
        headers: { Authorization: `Bearer ${accToken}` },
    });
    expect((await finalGet.json()).status).toBe('APPROVED');
  });

  test('[P1] should record Audit Log when settlement status changes to PAID', async ({ authSession, seedFactory, request }) => {
    const dirToken = await authSession.getToken('Director');
    const accToken = await authSession.getToken('Accounting');
    
    // Assume we have an approved settlement ID (using ID from previous step is not isolated, creating one)
    const slot = await seedFactory.createBookingSlot({ verified: true });
    const createRes = await request.post(`${API_URL}/api/settlements`, {
      headers: { Authorization: `Bearer ${accToken}`, 'Content-Type': 'application/json' },
      data: createSettlementPayload([slot.id]),
    });
    const settlementId = (await createRes.json()).id;

    // Fast-track approvals
    await request.post(`${API_URL}/api/settlements/${settlementId}/approve/first`, { headers: { Authorization: `Bearer ${accToken}` }, data: {} });
    await request.post(`${API_URL}/api/settlements/${settlementId}/approve/final`, { headers: { Authorization: `Bearer ${dirToken}` }, data: {} });

    // Transition to PAID
    await request.post(`${API_URL}/api/settlements/${settlementId}/pay`, {
        headers: { Authorization: `Bearer ${dirToken}`, 'Content-Type': 'application/json' },
        data: { paymentReference: 'PAY-REF-001' },
    });

    const auditRes = await request.get(`${API_URL}/api/settlements/${settlementId}/audit-log`, {
      headers: { Authorization: `Bearer ${accToken}` },
    });
    expect(auditRes.status()).toBe(200);
    const audit = await auditRes.json();
    const paidEntry = (audit.items || audit).some((e: { newValue?: string; action?: string }) => 
        e.newValue === 'PAID' || e.action === 'STATUS_CHANGE_TO_PAID'
    );
    expect(paidEntry).toBe(true);
  });

});
