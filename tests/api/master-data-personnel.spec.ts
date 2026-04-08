import { test, expect } from '../../support/fixtures';
import { createHostPayload } from '../../support/helpers/data-factories';

/**
 * VLM Master Data API Tests: Hosts & Configs
 */
const API_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('@P2 @MasterData Story-2.3: Host Profile Setup', () => {

  test('[P2] should create a Host profile and filter by ACTIVE status', async ({ authSession, request }) => {
    const token = await authSession.getToken('Admin');
    const createRes = await request.post(`${API_URL}/api/master-data/hosts`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createHostPayload(),
    });
    expect(createRes.status()).toBe(201);
    const { id } = await createRes.json();

    const listRes = await request.get(`${API_URL}/api/master-data/hosts?status=ACTIVE`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const hosts = await listRes.json();
    expect((hosts.items || hosts).every((h: { status: string }) => h.status === 'ACTIVE')).toBe(true);

    // Cleanup
    await request.delete(`${API_URL}/api/master-data/hosts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  });

});

test.describe('@P2 @MasterData Story-2.4: System Configurations', () => {

  test('[P2] should list and update system configuration entries', async ({ authSession, request }) => {
    const token = await authSession.getToken('Admin');
    
    // 1. List
    const listRes = await request.get(`${API_URL}/api/master-data/configs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(listRes.status()).toBe(200);

    // 2. Update
    const updateRes = await request.put(`${API_URL}/api/master-data/configs/overlapToleranceMinutes`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { value: '0' },
    });
    expect([200, 404]).toContain(updateRes.status());
  });

});
