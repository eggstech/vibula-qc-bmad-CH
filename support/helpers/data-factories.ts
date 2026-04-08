import { faker } from '@faker-js/faker';

// ---------------------------------------------------------------------------
// Booking Data Factories
// ---------------------------------------------------------------------------

export interface BookingPayload {
  clientId:  string;
  title:     string;
  startTime: string;
  endTime:   string;
  notes?:    string;
}

export interface HostAssignmentPayload {
  hostId:    string;
  startTime: string;
  endTime:   string;
}

export interface SettlementPayload {
  slotIds: string[];
}

/**
 * Creates a minimal valid Booking creation payload.
 * All fields can be overridden.
 */
export const createBookingPayload = (overrides: Partial<BookingPayload> = {}): BookingPayload => ({
  clientId:  overrides.clientId  ?? 'test-client-001',
  title:     overrides.title     ?? `${faker.commerce.productName()} Booking`,
  startTime: overrides.startTime ?? '2026-08-01T09:00:00Z',
  endTime:   overrides.endTime   ?? '2026-08-01T11:00:00Z',
  notes:     overrides.notes,
});

/**
 * Creates a host assignment payload for a given slot window.
 * Used in Conflict Detection tests.
 */
export const createHostAssignment = (overrides: Partial<HostAssignmentPayload> = {}): HostAssignmentPayload => ({
  hostId:    overrides.hostId    ?? 'test-host-001',
  startTime: overrides.startTime ?? '2026-08-01T09:00:00Z',
  endTime:   overrides.endTime   ?? '2026-08-01T11:00:00Z',
});

/**
 * Creates a settlement payload from an array of slot IDs.
 */
export const createSettlementPayload = (slotIds: string[]): SettlementPayload => ({
  slotIds,
});

// ---------------------------------------------------------------------------
// Master Data Factories
// ---------------------------------------------------------------------------

export interface ClientPayload {
  name:   string;
  agency: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface RoomPayload {
  name:     string;
  capacity: number;
  tags:     string[];
  status:   'ACTIVE' | 'INACTIVE';
}

export interface HostPayload {
  name:      string;
  baseRate:  number;
  skillsets: string[];
  status:    'ACTIVE' | 'INACTIVE';
}

export const createClientPayload = (overrides: Partial<ClientPayload> = {}): ClientPayload => ({
  name:   overrides.name   ?? faker.company.name(),
  agency: overrides.agency ?? faker.company.name(),
  status: overrides.status ?? 'ACTIVE',
});

export const createRoomPayload = (overrides: Partial<RoomPayload> = {}): RoomPayload => ({
  name:     overrides.name     ?? `Studio ${faker.location.buildingNumber()}`,
  capacity: overrides.capacity ?? faker.number.int({ min: 2, max: 10 }),
  tags:     overrides.tags     ?? ['HD'],
  status:   overrides.status   ?? 'ACTIVE',
});

export const createHostPayload = (overrides: Partial<HostPayload> = {}): HostPayload => ({
  name:      overrides.name      ?? faker.person.fullName(),
  baseRate:  overrides.baseRate  ?? faker.number.int({ min: 100_000, max: 500_000 }),
  skillsets: overrides.skillsets ?? ['Gaming'],
  status:    overrides.status    ?? 'ACTIVE',
});

// ---------------------------------------------------------------------------
// Time Helpers
// ---------------------------------------------------------------------------

/** Returns an ISO 8601 string for N hours from a given base time. */
export const addHours = (base: Date, hours: number): string =>
  new Date(base.getTime() + hours * 3_600_000).toISOString();

/** Returns today's date at a specific HH:MM in local time as ISO string. */
export const todayAt = (hour: number, minute = 0): string => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

/**
 * Generates a non-overlapping future time window.
 * @param dayOffset - how many days from today
 * @param startHour - start hour (24h)
 * @param durationHours - slot duration in hours
 */
export const futureTimeSlot = (
  dayOffset: number,
  startHour: number,
  durationHours: number,
): { startTime: string; endTime: string } => {
  const base = new Date();
  base.setDate(base.getDate() + dayOffset);
  base.setHours(startHour, 0, 0, 0);

  return {
    startTime: base.toISOString(),
    endTime:   addHours(base, durationHours),
  };
};
