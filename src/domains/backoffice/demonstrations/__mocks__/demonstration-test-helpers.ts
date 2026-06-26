import { Demonstration, DemonstrationStatus } from '../entities/demonstration.entity';

export const createMockDemonstration = (overrides: Partial<Demonstration> = {}): Demonstration => ({
  id: '7d36e31d-cf1b-4db8-95be-1555baf0e1a4',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: null,
  scheduledAt: new Date('2026-07-01T10:00:00.000Z'),
  productInterest: null,
  status: DemonstrationStatus.PENDING,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
