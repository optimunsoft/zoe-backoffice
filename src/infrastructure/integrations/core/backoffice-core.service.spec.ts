jest.mock('src/config/env.config', () => ({
    envs: {
        api_url_internal_core: 'http://core',
        api_key_internal_core: ' secret ',
        internal_timeout_ms: 5000,
    },
}));

import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { BackofficeCoreService } from './backoffice-core.service';

describe('BackofficeCoreService', () => {
    const user = {
        id: '11111111-1111-4111-8111-111111111111',
        label: 'Ada Lovelace',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        username: 'ada',
    };

    it('centralizes internal credentials and preserves authorization headers', async () => {
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response: { exists: true } },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.companyExists('company-id', 'session')).resolves.toBe(true);
        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://core/api/v1/internal/core/companies/company-id/exists',
            timeout: 5000,
            headers: {
                Authorization: 'Bearer session',
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('calls CORE company list with search and api-key header', async () => {
        const response = {
            data: [],
            total: 0,
            page: 1,
            amount: 10,
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.searchCompanies({
            page: 1,
            amount: 10,
            search: 'zoe',
        })).resolves.toEqual(response);

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://core/api/v1/internal/core/companies/list',
            method: 'GET',
            params: {
                page: 1,
                amount: 10,
                search: 'zoe',
            },
            headers: {
                'x-api-key': 'secret',
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('calls CORE user list with search and internal credentials', async () => {
        const response = {
            data: [],
            total: 0,
            page: 1,
            amount: 10,
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.searchUserList({
            page: 1,
            amount: 10,
            search: 'ada',
        })).resolves.toEqual(response);

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://core/api/v1/internal/core/users/list',
            method: 'GET',
            params: {
                page: 1,
                amount: 10,
                search: 'ada',
            },
            headers: {
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('deduplicates and splits resolutions into batches of 500', async () => {
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response: [] },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);
        const ids = Array.from(
            { length: 501 },
            (_, index) => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
        );

        await service.resolveUsers([...ids, ids[0]]);

        expect(request).toHaveBeenCalledTimes(2);
        expect(request.mock.calls[0][0].data.ids).toHaveLength(500);
        expect(request.mock.calls[1][0].data.ids).toHaveLength(1);
    });

    it('returns null for missing point resources', async () => {
        const request = jest.fn().mockRejectedValue({ response: { status: 404 } });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.findCompanyOwner('company-id')).resolves.toBeNull();
    });

    it('preserves validation errors returned by third-party upsert', async () => {
        const response = { status: 400, data: { message: 'Datos invalidos' } };
        const request = jest.fn().mockRejectedValue({ response });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.upsertThirdParty({}))
            .rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects invalid DTO responses', async () => {
        const request = jest.fn().mockResolvedValue({
            data: {
                status: true,
                message: 'OK',
                response: [{ ...user, id: 'invalid' }],
            },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.resolveUsers([user.id]))
            .rejects.toBeInstanceOf(BadGatewayException);
    });
});


