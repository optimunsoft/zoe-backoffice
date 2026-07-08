import { AuthorizationRepository } from './authorization.repository';

describe('AuthorizationRepository', () => {
    it('resolves the local user by Auth0 sub using SQL only', async () => {
        const dataSource = {
            query: jest.fn().mockResolvedValue([{
                id: 'user-1',
                userType: 'SUBUSUARIO',
                mustChangePassword: true,
            }]),
        };
        const repository = new AuthorizationRepository(dataSource as any);

        const result = await repository.findRegisteredUserBySub('auth0|1');

        expect(result).toEqual({
            id: 'user-1',
            userType: 'SUBUSUARIO',
            mustChangePassword: true,
        });
        expect(dataSource.query.mock.calls[0][0]).toContain('FROM core.usuarios');
        expect(dataSource.query.mock.calls[0][1]).toEqual(['auth0|1']);
    });

    it('delegates relation, ownership and permission checks to existing SQL functions', async () => {
        const dataSource = {
            query: jest.fn().mockResolvedValue([{ allowed: true }]),
        };
        const repository = new AuthorizationRepository(dataSource as any);

        await expect(repository.isCompanyRelated('user-1', 'company-1')).resolves.toBe(true);
        await expect(repository.isCompanyOwner('user-1', 'company-1')).resolves.toBe(true);
        await expect(repository.hasPermission(
            'user-1',
            'company-1',
            'CONTABILIDAD',
            'PUC',
            'edit',
        )).resolves.toBe(true);

        expect(dataSource.query.mock.calls[0][0]).toContain('core.is_related');
        expect(dataSource.query.mock.calls[1][0]).toContain('core.isOwner');
        expect(dataSource.query.mock.calls[2][0]).toContain('core.has_permission');
    });
});
