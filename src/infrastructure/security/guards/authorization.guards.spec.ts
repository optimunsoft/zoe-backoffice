import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CompanyPermissionGuard } from './company-permission.guard';
import { CompanyRelatedGuard } from './company-related.guard';
import { IsAdminGuard } from './is-admin.guard';

const context = (request: any) => ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
}) as any;

describe('Accounting authorization guards', () => {
    it('checks company relationship using the request contract', async () => {
        const repository = {
            isCompanyRelated: jest.fn().mockResolvedValue(true),
        };
        const guard = new CompanyRelatedGuard(repository as any);

        await expect(guard.canActivate(context({
            user: { id: 'user-1' },
            query: { companyId: 'company-1' },
            params: {},
            body: {},
            path: '/accounting/accounts',
        }))).resolves.toBe(true);

        expect(repository.isCompanyRelated)
            .toHaveBeenCalledWith('user-1', 'company-1');
    });

    it('checks permission metadata and preserves forbidden behavior', async () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue({
                module: 'CONTABILIDAD',
                resource: 'PUC',
                action: 'delete',
            }),
        } as unknown as Reflector;
        const repository = {
            hasPermission: jest.fn().mockResolvedValue(false),
        };
        const guard = new CompanyPermissionGuard(reflector, repository as any);

        await expect(guard.canActivate(context({
            user: { id: 'user-1' },
            query: { companyId: 'company-1' },
            params: {},
            body: {},
            path: '/accounting/accounts',
        }))).rejects.toBeInstanceOf(ForbiddenException);

        expect(repository.hasPermission).toHaveBeenCalledWith(
            'user-1',
            'company-1',
            'CONTABILIDAD',
            'PUC',
            'delete',
        );
    });

    it('allows admin users by email', async () => {
        const repository = {
            isAdminEmail: jest.fn().mockResolvedValue(true),
        };
        const guard = new IsAdminGuard(repository as any);

        await expect(guard.canActivate(context({
            user: { email: 'admin@example.com' },
        }))).resolves.toBe(true);

        expect(repository.isAdminEmail).toHaveBeenCalledWith('admin@example.com');
    });

    it('rejects admin guard requests without email', async () => {
        const repository = {
            isAdminEmail: jest.fn(),
        };
        const guard = new IsAdminGuard(repository as any);

        await expect(guard.canActivate(context({
            user: { id: 'user-1' },
        }))).rejects.toBeInstanceOf(ForbiddenException);
        expect(repository.isAdminEmail).not.toHaveBeenCalled();
    });

    it('rejects non-admin emails', async () => {
        const repository = {
            isAdminEmail: jest.fn().mockResolvedValue(false),
        };
        const guard = new IsAdminGuard(repository as any);

        await expect(guard.canActivate(context({
            user: { email: 'user@example.com' },
        }))).rejects.toBeInstanceOf(ForbiddenException);

        expect(repository.isAdminEmail).toHaveBeenCalledWith('user@example.com');
    });
});
