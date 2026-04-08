import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VlmRole = 'Admin' | 'KA' | 'Staff' | 'Host' | 'Accounting' | 'Director';

export interface TestUser {
  id: string;
  role: VlmRole;
  name: string;
  email: string;
  token: string;
}

export interface TestBookingSlot {
  id: string;
  hostId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  status: string;
  verified: boolean;
}

// ---------------------------------------------------------------------------
// Fixture types
// ---------------------------------------------------------------------------

export type VlmFixtures = {
  /** Builds test data objects without API calls — pure factory functions */
  userFactory: {
    build: (overrides?: Partial<TestUser>) => Omit<TestUser, 'token'>;
  };

  /** Issues JWTs from the backend test-token endpoint (requires B1 resolved) */
  authSession: {
    getToken: (role: VlmRole) => Promise<string>;
    getUser:  (role: VlmRole) => Promise<TestUser>;
  };

  /** Data factories with API-backed seeding (requires B2 resolved) */
  seedFactory: {
    createBookingSlot: (params: {
      hostId?:          string;
      roomId?:          string;
      startTime?:       string;
      endTime?:         string;
      status?:          string;
      verified?:        boolean;
      baseRate?:        number;
      durationMinutes?: number;
    }) => Promise<TestBookingSlot>;

    createBooking: (params: {
      code?: string;
      customerId?: string;
      brandId?: string;
      startDate?: string;
      startTime?: number;
      endTime?: number;
      duration?: number;
      status?: string;
      roomId?: string;
    }) => Promise<any>;

    createRoom: (params: {
      code?: string;
      name?: string;
      preferences?: Array<{ customerId?: string; brandId?: string }>;
    }) => Promise<any>;

    createCustomerWithBrand: (overrides?: any) => Promise<{ customerId: string; brandId: string }>;

    createUser: (params: { 
      role: VlmRole; 
      name?: string; 
      email?: string; 
    }) => Promise<TestUser>;

    cleanupBookingSlot: (slotId: string) => Promise<void>;
  };
};

// ---------------------------------------------------------------------------
// Global Test Setup / Seed
// ---------------------------------------------------------------------------

// Fix for Determinism (P0 violation): Seed faker globally
faker.seed(12345);

// Cache tokens across tests to prevent redundant API calls (P0 Performance violation)
const tokenCache = new Map<VlmRole, string>();

// ---------------------------------------------------------------------------
// Fixture Implementation
// ---------------------------------------------------------------------------

const API_URL = process.env.API_URL || 'http://localhost:5000';

export const test = base.extend<VlmFixtures>({

  // -------------------------------------------------------------------------
  // userFactory — pure data builder, no API calls
  // -------------------------------------------------------------------------
  userFactory: async ({}, use) => {
    await use({
      build: (overrides = {}) => ({
        id:    overrides.id    ?? faker.string.uuid(),
        role:  overrides.role  ?? 'KA',
        name:  overrides.name  ?? faker.person.fullName(),
        email: overrides.email ?? faker.internet.email(),
      }),
    });
  },

  // -------------------------------------------------------------------------
  // authSession — JWT fixture with caching
  // -------------------------------------------------------------------------
  authSession: async ({ request }, use) => {
    const getToken = async (role: VlmRole): Promise<string> => {
      if (tokenCache.has(role)) return tokenCache.get(role)!;

      const res = await request.post(`${API_URL}/api/auth/test-token`, {
        data: { role },
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok()) {
        throw new Error(
          `[B1 Blocker] Cannot get test token for role "${role}". ` +
          'Ensure the backend exposes /api/auth/test-token in NODE_ENV=test.',
        );
      }

      const token = (await res.json()).token as string;
      tokenCache.set(role, token);
      return token;
    };

    await use({
      getToken,
      getUser: async (role) => {
        const token = await getToken(role);
        // Decode payload (base64, no verification needed for test purposes)
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString('utf-8'),
        );
        return {
          id:    payload.sub   ?? `user-${role.toLowerCase()}`,
          role,
          name:  payload.name  ?? role,
          email: payload.email ?? `${role.toLowerCase()}@vlmtest.local`,
          token,
        };
      },
    });
  },

  // -------------------------------------------------------------------------
  // seedFactory — API-backed test data seeding
  // -------------------------------------------------------------------------
  seedFactory: async ({ request }, use) => {
    const createdSlotIds: string[] = [];
    let adminToken: string | null = null;

    const getAdminToken = async (): Promise<string> => {
      if (adminToken) return adminToken;
      // Use the cached getToken logic indirectly or just fetch here
      const res = await request.post(`${API_URL}/api/auth/test-token`, {
        data: { role: 'Admin' },
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok()) throw new Error('[B1] Admin token unavailable');
      adminToken = (await res.json()).token as string;
      return adminToken;
    };

    await use({
      createBookingSlot: async (params) => {
        const token = await getAdminToken();

        const res = await request.post(`${API_URL}/api/test/seed/booking-slot`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          data: {
            hostId:          params.hostId          ?? 'test-host-001',
            roomId:          params.roomId          ?? 'test-room-001',
            startTime:       params.startTime       ?? '2026-08-01T09:00:00Z',
            endTime:         params.endTime         ?? '2026-08-01T11:00:00Z',
            status:          params.status          ?? 'FINISHED',
            verified:        params.verified        ?? true,
            baseRate:        params.baseRate        ?? 200000,
            durationMinutes: params.durationMinutes ?? 120,
          },
        });

        if (!res.ok()) {
          throw new Error(`[B2 Blocker] /api/test/seed/booking-slot failed`);
        }

        const slot = await res.json() as TestBookingSlot;
        createdSlotIds.push(slot.id);
        return slot;
      },

      createBooking: async (params) => {
        const token = await getAdminToken();
        const res = await request.post(`${API_URL}/api/test/seed/booking`, {
          headers: { Authorization: `Bearer ${token}` },
          data: params
        });
        if (!res.ok()) throw new Error('[B2] Failed to seed booking');
        return res.json();
      },

      createRoom: async (params) => {
        const token = await getAdminToken();
        const res = await request.post(`${API_URL}/api/test/seed/room`, {
          headers: { Authorization: `Bearer ${token}` },
          data: params
        });
        if (!res.ok()) throw new Error('[B2] Failed to seed room');
        return res.json();
      },

      createCustomerWithBrand: async (overrides) => {
        const token = await getAdminToken();
        const res = await request.post(`${API_URL}/api/test/seed/customer-brand`, {
          headers: { Authorization: `Bearer ${token}` },
          data: overrides
        });
        if (!res.ok()) throw new Error('[B2] Failed to seed customer/brand');
        return res.json();
      },

      createUser: async (params) => {
        const token = await getAdminToken();
        const res = await request.post(`${API_URL}/api/test/seed/user`, {
          headers: { Authorization: `Bearer ${token}` },
          data: params
        });
        if (!res.ok()) throw new Error('[B2] Failed to seed user');
        return res.json();
      },

      cleanupBookingSlot: async (slotId) => {
        const token = await getAdminToken();
        await request.delete(`${API_URL}/api/test/seed/booking-slot/${slotId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const idx = createdSlotIds.indexOf(slotId);
        if (idx > -1) createdSlotIds.splice(idx, 1);
      },
    });

    // Auto-cleanup all seeded slots after each test
    const token = await getAdminToken().catch(() => null);
    if (token) {
      for (const slotId of [...createdSlotIds]) {
        await request
          .delete(`${API_URL}/api/test/seed/booking-slot/${slotId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => {/* best-effort cleanup */});
      }
    }
  },

});

export { expect };
