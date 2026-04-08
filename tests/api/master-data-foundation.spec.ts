import { test, expect } from '../../support/fixtures';
import { createClientPayload, createRoomPayload } from '../../support/helpers/data-factories';

/**
 * VLM Master Data API Tests: Clients & Rooms
 */
const API_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('@P2 @MasterData Story-2.1: Client Management', () => {

  test('[P2] should create, update, and soft-delete a Client record', async ({ authSession, request }) => {
    const token = await authSession.getToken('Admin');
    
    // 1. Create
    const createRes = await request.post(`${API_URL}/api/master-data/clients`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createClientPayload(),
    });
    expect(createRes.status()).toBe(201);
    const { id } = await createRes.json();

    // 2. Update
    const updateRes = await request.put(`${API_URL}/api/master-data/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { name: 'Updated Client Name' },
    });
    expect(updateRes.status()).toBe(200);

    // 3. Delete
    await request.delete(`${API_URL}/api/master-data/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    
    // 4. Verify status INACTIVE
    const getRes = await request.get(`${API_URL}/api/master-data/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (getRes.status() === 200) {
      expect((await getRes.json()).status).toBe('INACTIVE');
    }
  });

});

test.describe('@P2 @MasterData Story-2.2: Room & Studio Configuration', () => {

  test('[P2] should create a Room and appear in ACTIVE resource list', async ({ authSession, request }) => {
    const token = await authSession.getToken('Admin');
    const createRes = await request.post(`${API_URL}/api/master-data/rooms`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: createRoomPayload(),
    });
    expect(createRes.status()).toBe(201);
    const { id } = await createRes.json();

    const listRes = await request.get(`${API_URL}/api/master-data/rooms?status=ACTIVE`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const rooms = await listRes.json();
    const found = (rooms.items || rooms).some((r: { id: string }) => r.id === id);
    expect(found).toBe(true);

    // Cleanup
    await request.delete(`${API_URL}/api/master-data/rooms/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  });

});
