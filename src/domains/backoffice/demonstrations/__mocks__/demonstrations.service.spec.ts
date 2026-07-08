import { DemonstrationsService } from '../demonstrations.service';
import { DemonstrationStatus } from '../entities/demonstration.entity';
import { createMockDemonstrationRepository } from './demonstration-dependencies.mock';
import { createMockDemonstration } from './demonstration-test-helpers';

describe('DemonstrationsService', () => {
    let service: DemonstrationsService;
    let repository: ReturnType<typeof createMockDemonstrationRepository>;

    beforeEach(() => {
        repository = createMockDemonstrationRepository();
        service = new DemonstrationsService(repository as any);
    });

    it('creates a pending demonstration with normalized contact data', async () => {
        const demonstration = createMockDemonstration();
        repository.create.mockReturnValue(demonstration);
        repository.save.mockResolvedValue(demonstration);

        const result = await service.create({
            name: ' Ada Lovelace ',
            email: 'ADA@EXAMPLE.COM',
            phone: ' 300 000 0000 ',
            scheduledAt: '2026-07-01T10:00:00.000Z',
            productInterest: ' Contabilidad ',
        });

        expect(result).toBe(demonstration);
        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Ada Lovelace',
                email: 'ada@example.com',
                phone: '300 000 0000',
                productInterest: 'Contabilidad',
                status: DemonstrationStatus.PENDING,
            }),
        );
    });

    it('creates a demonstration with multiple product interests serialized by semicolon', async () => {
        const demonstration = createMockDemonstration();
        repository.create.mockReturnValue(demonstration);
        repository.save.mockResolvedValue(demonstration);

        await service.create({
            name: ' Ada Lovelace ',
            email: 'ADA@EXAMPLE.COM',
            scheduledAt: '2026-07-01T10:00:00.000Z',
            productInterest: [' Contabilidad ', ' Nómina ', ''],
        });

        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                productInterest: 'Contabilidad;Nómina',
            }),
        );
    });

    it('deserializes persisted product interests into an array', () => {
        expect(service.deserializeProductInterest('Contabilidad; Nómina')).toEqual([
            'Contabilidad',
            'Nómina',
        ]);
        expect(service.deserializeProductInterest(null)).toEqual([]);
    });

    it('throws when a requested demonstration does not exist', async () => {
        repository.findById.mockResolvedValue(null);
        await expect(service.find('7d36e31d-cf1b-4db8-95be-1555baf0e1a4')).rejects.toThrow(
            'no existe',
        );
    });
});
