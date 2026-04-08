# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/e2e/auth.spec.ts >> @P0 @Auth Story-1.1: Authentication Journey >> [P0] should persist authenticated session on page reload
- Location: tests/e2e/auth.spec.ts:65:7

# Error details

```
Error: [B1 Blocker] Cannot get test token for role "Admin". Ensure the backend exposes /api/auth/test-token in NODE_ENV=test.
```

# Test source

```ts
  32  | export type VlmFixtures = {
  33  |   /** Builds test data objects without API calls — pure factory functions */
  34  |   userFactory: {
  35  |     build: (overrides?: Partial<TestUser>) => Omit<TestUser, 'token'>;
  36  |   };
  37  | 
  38  |   /** Issues JWTs from the backend test-token endpoint (requires B1 resolved) */
  39  |   authSession: {
  40  |     getToken: (role: VlmRole) => Promise<string>;
  41  |     getUser:  (role: VlmRole) => Promise<TestUser>;
  42  |   };
  43  | 
  44  |   /** Data factories with API-backed seeding (requires B2 resolved) */
  45  |   seedFactory: {
  46  |     createBookingSlot: (params: {
  47  |       hostId?:          string;
  48  |       roomId?:          string;
  49  |       startTime?:       string;
  50  |       endTime?:         string;
  51  |       status?:          string;
  52  |       verified?:        boolean;
  53  |       baseRate?:        number;
  54  |       durationMinutes?: number;
  55  |     }) => Promise<TestBookingSlot>;
  56  | 
  57  |     createBooking: (params: {
  58  |       code?: string;
  59  |       customerId?: string;
  60  |       brandId?: string;
  61  |       startDate?: string;
  62  |       startTime?: number;
  63  |       endTime?: number;
  64  |       duration?: number;
  65  |       status?: string;
  66  |       roomId?: string;
  67  |     }) => Promise<any>;
  68  | 
  69  |     createRoom: (params: {
  70  |       code?: string;
  71  |       name?: string;
  72  |       preferences?: Array<{ customerId?: string; brandId?: string }>;
  73  |     }) => Promise<any>;
  74  | 
  75  |     createCustomerWithBrand: (overrides?: any) => Promise<{ customerId: string; brandId: string }>;
  76  | 
  77  |     createUser: (params: { 
  78  |       role: VlmRole; 
  79  |       name?: string; 
  80  |       email?: string; 
  81  |     }) => Promise<TestUser>;
  82  | 
  83  |     cleanupBookingSlot: (slotId: string) => Promise<void>;
  84  |   };
  85  | };
  86  | 
  87  | // ---------------------------------------------------------------------------
  88  | // Global Test Setup / Seed
  89  | // ---------------------------------------------------------------------------
  90  | 
  91  | // Fix for Determinism (P0 violation): Seed faker globally
  92  | faker.seed(12345);
  93  | 
  94  | // Cache tokens across tests to prevent redundant API calls (P0 Performance violation)
  95  | const tokenCache = new Map<VlmRole, string>();
  96  | 
  97  | // ---------------------------------------------------------------------------
  98  | // Fixture Implementation
  99  | // ---------------------------------------------------------------------------
  100 | 
  101 | const API_URL = process.env.API_URL || 'http://localhost:5000';
  102 | 
  103 | export const test = base.extend<VlmFixtures>({
  104 | 
  105 |   // -------------------------------------------------------------------------
  106 |   // userFactory — pure data builder, no API calls
  107 |   // -------------------------------------------------------------------------
  108 |   userFactory: async ({}, use) => {
  109 |     await use({
  110 |       build: (overrides = {}) => ({
  111 |         id:    overrides.id    ?? faker.string.uuid(),
  112 |         role:  overrides.role  ?? 'KA',
  113 |         name:  overrides.name  ?? faker.person.fullName(),
  114 |         email: overrides.email ?? faker.internet.email(),
  115 |       }),
  116 |     });
  117 |   },
  118 | 
  119 |   // -------------------------------------------------------------------------
  120 |   // authSession — JWT fixture with caching
  121 |   // -------------------------------------------------------------------------
  122 |   authSession: async ({ request }, use) => {
  123 |     const getToken = async (role: VlmRole): Promise<string> => {
  124 |       if (tokenCache.has(role)) return tokenCache.get(role)!;
  125 | 
  126 |       const res = await request.post(`${API_URL}/api/auth/test-token`, {
  127 |         data: { role },
  128 |         headers: { 'Content-Type': 'application/json' },
  129 |       });
  130 | 
  131 |       if (!res.ok()) {
> 132 |         throw new Error(
      |               ^ Error: [B1 Blocker] Cannot get test token for role "Admin". Ensure the backend exposes /api/auth/test-token in NODE_ENV=test.
  133 |           `[B1 Blocker] Cannot get test token for role "${role}". ` +
  134 |           'Ensure the backend exposes /api/auth/test-token in NODE_ENV=test.',
  135 |         );
  136 |       }
  137 | 
  138 |       const token = (await res.json()).token as string;
  139 |       tokenCache.set(role, token);
  140 |       return token;
  141 |     };
  142 | 
  143 |     await use({
  144 |       getToken,
  145 |       getUser: async (role) => {
  146 |         const token = await getToken(role);
  147 |         // Decode payload (base64, no verification needed for test purposes)
  148 |         const payload = JSON.parse(
  149 |           Buffer.from(token.split('.')[1], 'base64').toString('utf-8'),
  150 |         );
  151 |         return {
  152 |           id:    payload.sub   ?? `user-${role.toLowerCase()}`,
  153 |           role,
  154 |           name:  payload.name  ?? role,
  155 |           email: payload.email ?? `${role.toLowerCase()}@vlmtest.local`,
  156 |           token,
  157 |         };
  158 |       },
  159 |     });
  160 |   },
  161 | 
  162 |   // -------------------------------------------------------------------------
  163 |   // seedFactory — API-backed test data seeding
  164 |   // -------------------------------------------------------------------------
  165 |   seedFactory: async ({ request }, use) => {
  166 |     const createdSlotIds: string[] = [];
  167 |     let adminToken: string | null = null;
  168 | 
  169 |     const getAdminToken = async (): Promise<string> => {
  170 |       if (adminToken) return adminToken;
  171 |       // Use the cached getToken logic indirectly or just fetch here
  172 |       const res = await request.post(`${API_URL}/api/auth/test-token`, {
  173 |         data: { role: 'Admin' },
  174 |         headers: { 'Content-Type': 'application/json' },
  175 |       });
  176 |       if (!res.ok()) throw new Error('[B1] Admin token unavailable');
  177 |       adminToken = (await res.json()).token as string;
  178 |       return adminToken;
  179 |     };
  180 | 
  181 |     await use({
  182 |       createBookingSlot: async (params) => {
  183 |         const token = await getAdminToken();
  184 | 
  185 |         const res = await request.post(`${API_URL}/api/test/seed/booking-slot`, {
  186 |           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  187 |           data: {
  188 |             hostId:          params.hostId          ?? 'test-host-001',
  189 |             roomId:          params.roomId          ?? 'test-room-001',
  190 |             startTime:       params.startTime       ?? '2026-08-01T09:00:00Z',
  191 |             endTime:         params.endTime         ?? '2026-08-01T11:00:00Z',
  192 |             status:          params.status          ?? 'FINISHED',
  193 |             verified:        params.verified        ?? true,
  194 |             baseRate:        params.baseRate        ?? 200000,
  195 |             durationMinutes: params.durationMinutes ?? 120,
  196 |           },
  197 |         });
  198 | 
  199 |         if (!res.ok()) {
  200 |           throw new Error(`[B2 Blocker] /api/test/seed/booking-slot failed`);
  201 |         }
  202 | 
  203 |         const slot = await res.json() as TestBookingSlot;
  204 |         createdSlotIds.push(slot.id);
  205 |         return slot;
  206 |       },
  207 | 
  208 |       createBooking: async (params) => {
  209 |         const token = await getAdminToken();
  210 |         const res = await request.post(`${API_URL}/api/test/seed/booking`, {
  211 |           headers: { Authorization: `Bearer ${token}` },
  212 |           data: params
  213 |         });
  214 |         if (!res.ok()) throw new Error('[B2] Failed to seed booking');
  215 |         return res.json();
  216 |       },
  217 | 
  218 |       createRoom: async (params) => {
  219 |         const token = await getAdminToken();
  220 |         const res = await request.post(`${API_URL}/api/test/seed/room`, {
  221 |           headers: { Authorization: `Bearer ${token}` },
  222 |           data: params
  223 |         });
  224 |         if (!res.ok()) throw new Error('[B2] Failed to seed room');
  225 |         return res.json();
  226 |       },
  227 | 
  228 |       createCustomerWithBrand: async (overrides) => {
  229 |         const token = await getAdminToken();
  230 |         const res = await request.post(`${API_URL}/api/test/seed/customer-brand`, {
  231 |           headers: { Authorization: `Bearer ${token}` },
  232 |           data: overrides
```