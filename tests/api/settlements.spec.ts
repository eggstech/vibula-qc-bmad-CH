import { test, expect } from '../../support/fixtures';

/**
 * Story 6.4: Settlement Accuracy (BBNT Rollup)
 * Verifies the financial integrity of host payments and tax calculations.
 */

test.describe.parallel('@P0 @Settlements Story 6.4: Settlement Math', () => {

  test('[P0] 6.4-API-001: Should rollup multiple VERIFIED bookings into one BBNT', async ({ request, authSession, seedFactory }) => {
    // 1. Setup: Create a host and 2 verified bookings (Total Payable = 200k + 300k = 500k)
    const adminToken = await authSession.getToken('Admin');
    const { customerId, brandId } = await seedFactory.createCustomerWithBrand();
    const host = await seedFactory.createUser({ role: 'Host' } as any); // Use generic seeding or specific Host API
    
    // Seed verified bookings for Aug 2026
    await seedFactory.createBooking({ 
      hostId: host.id, 
      customerId, brandId, 
      status: 'VERIFIED', 
      startDate: '2026-08-01',
      totalPayable: 200000 
    } as any);

    await seedFactory.createBooking({ 
      hostId: host.id, 
      customerId, brandId, 
      status: 'VERIFIED', 
      startDate: '2026-08-15',
      totalPayable: 300000 
    } as any);

    // 2. Action: Create BBNT for host/Aug 2026
    const res = await request.post('/api/Admins/AcceptanceReport/CreateAcceptanceReport', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        hostId: host.id,
        date: '2026-08-01T00:00:00Z'
      }
    });

    // 3. Assert: Verify rollup total
    expect(res.status()).toBe(200);
    const report = await res.json();
    expect(report.data.totalValueBeforeTax).toBe(500000);
    
    // PIT Check: 500,000 / 0.9 = 555,555. PIT = 55,555
    expect(report.data.personalIncomeTax).toBeGreaterThan(55000);
  });

  test('[P1] 6.4-API-002: Should exclude WIP bookings from the settlement rollup', async ({ request, authSession, seedFactory }) => {
    // 1. Setup: Host with 1 Verified and 1 WIP booking
    const adminToken = await authSession.getToken('Admin');
    const host = await seedFactory.createUser({ role: 'Host' } as any);

    await seedFactory.createBooking({ hostId: host.id, status: 'VERIFIED', startDate: '2026-08-01', totalPayable: 100000 } as any);
    await seedFactory.createBooking({ hostId: host.id, status: 'WIP', startDate: '2026-08-02', totalPayable: 100000 } as any);

    // 2. Action: Create report
    const res = await request.post('/api/Admins/AcceptanceReport/CreateAcceptanceReport', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { hostId: host.id, date: '2026-08-01T00:00:00Z' }
    });

    // 3. Assert: Only 100k included
    const report = await res.json();
    expect(report.data.totalValueBeforeTax).toBe(100000);
  });

});
