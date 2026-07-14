jest.mock('src/config/env.config', () => ({
    envs: {
        api_url_internal_core: 'http://core',
        api_key_internal_core: ' secret ',
        internal_timeout_ms: 5000,
    },
}));

import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { BackofficeCoreService } from '../backoffice-core.service';

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

    it('creates a company in CORE with owner user and internal credentials', async () => {
        const payload = {
            ownerUserId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            businessNatureId: '22222222-2222-4222-8222-222222222222',
            taxResponsibilityId: '33333333-3333-4333-8333-333333333333',
            vatRegimeId: null,
            documentTypeId: '44444444-4444-4444-8444-444444444444',
            documentNumber: '900123456',
            businessName: 'Zoe SAS',
            email: 'admin@zoe.test',
            municipalityId: '55555555-5555-4555-8555-555555555555',
            address: 'Street 1',
        };
        const response = {
            id: '11111111-1111-4111-8111-111111111111',
            businessNatureId: payload.businessNatureId,
            taxResponsibilityId: payload.taxResponsibilityId,
            vatRegimeId: null,
            documentTypeId: payload.documentTypeId,
            apiKey: 'encrypted-api-key',
            documentNumber: payload.documentNumber,
            businessName: payload.businessName,
            email: payload.email,
            municipalityId: payload.municipalityId,
            address: payload.address,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.createCompany(payload)).resolves.toMatchObject({
            id: response.id,
            apiKey: 'encrypted-api-key',
            documentNumber: '900123456',
        });

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://core/api/v1/internal/core/companies/create',
            method: 'POST',
            data: payload,
            headers: {
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('updates a company in CORE with internal credentials', async () => {
        const companyId = '11111111-1111-4111-8111-111111111111';
        const payload = {
            businessNatureId: '22222222-2222-4222-8222-222222222222',
            taxResponsibilityId: '33333333-3333-4333-8333-333333333333',
            vatRegimeId: null,
            documentTypeId: '44444444-4444-4444-8444-444444444444',
            documentNumber: '900123456',
            businessName: 'Zoe Actualizada SAS',
            email: 'admin@zoe.test',
            municipalityId: '55555555-5555-4555-8555-555555555555',
            address: 'Street 2',
        };
        const response = {
            id: companyId,
            businessNatureId: payload.businessNatureId,
            taxResponsibilityId: payload.taxResponsibilityId,
            vatRegimeId: null,
            documentTypeId: payload.documentTypeId,
            documentNumber: payload.documentNumber,
            businessName: payload.businessName,
            email: payload.email,
            municipalityId: payload.municipalityId,
            address: payload.address,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.updateCompany(companyId, payload)).resolves.toMatchObject({
            id: companyId,
            documentNumber: '900123456',
            businessName: 'Zoe Actualizada SAS',
        });

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: `http://core/api/v1/internal/core/companies/edit/${companyId}`,
            method: 'PUT',
            data: payload,
            headers: {
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('updates company status in CORE with internal credentials', async () => {
        const companyId = '11111111-1111-4111-8111-111111111111';
        const payload = { active: false };
        const response = {
            id: companyId,
            businessNatureId: '22222222-2222-4222-8222-222222222222',
            taxResponsibilityId: '33333333-3333-4333-8333-333333333333',
            vatRegimeId: null,
            documentTypeId: '44444444-4444-4444-8444-444444444444',
            active: false,
            documentNumber: '900123456',
            businessName: 'Zoe SAS',
            municipalityId: '55555555-5555-4555-8555-555555555555',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.updateCompanyStatus(companyId, payload)).resolves.toMatchObject({
            id: companyId,
            active: false,
        });

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: `http://core/api/v1/internal/core/companies/${companyId}/status`,
            method: 'PATCH',
            data: payload,
            headers: {
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('gets and uploads company logos in CORE with internal credentials', async () => {
        const companyId = '11111111-1111-4111-8111-111111111111';
        const logoResponse = { logo: 'https://signed-url.test/logo.png' };
        const uploadResponse = {
            message: 'Logo subido exitosamente',
            logoName: `${companyId}/logo/new.png`,
        };
        const request = jest.fn()
            .mockResolvedValueOnce({ data: { status: true, message: 'OK', response: logoResponse } })
            .mockResolvedValueOnce({ data: { status: true, message: 'OK', response: uploadResponse } });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);
        const file = {
            originalname: 'logo.png',
            mimetype: 'image/png',
            size: 12,
            buffer: Buffer.from('png'),
        };

        await expect(service.getCompanyLogo(companyId, true)).resolves.toEqual(logoResponse);
        await expect(service.uploadCompanyLogo(companyId, file)).resolves.toEqual(uploadResponse);

        expect(request).toHaveBeenNthCalledWith(1, expect.objectContaining({
            url: `http://core/api/v1/internal/core/companies/${companyId}/logo`,
            method: 'GET',
            params: { base64: true },
            headers: { 'x-api-key-internal': 'secret' },
        }));
        expect(request).toHaveBeenNthCalledWith(2, expect.objectContaining({
            url: `http://core/api/v1/internal/core/companies/${companyId}/logo`,
            method: 'POST',
            data: expect.any(FormData),
            headers: { 'x-api-key-internal': 'secret' },
        }));
    });

    it('generates and gets company api keys in CORE with internal credentials', async () => {
        const companyId = '11111111-1111-4111-8111-111111111111';
        const response = { apiKey: 'plain-api-key' };
        const request = jest.fn()
            .mockResolvedValueOnce({ data: { status: true, message: 'OK', response } })
            .mockResolvedValueOnce({ data: { status: true, message: 'OK', response } });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.generateCompanyApiKey(companyId)).resolves.toEqual(response);
        await expect(service.getCompanyApiKey(companyId)).resolves.toEqual(response);

        expect(request).toHaveBeenNthCalledWith(1, expect.objectContaining({
            url: 'http://core/api/v1/internal/core/companies/generate-api-key',
            method: 'POST',
            params: { companyId },
            headers: { 'x-api-key-internal': 'secret' },
        }));
        expect(request).toHaveBeenNthCalledWith(2, expect.objectContaining({
            url: 'http://core/api/v1/internal/core/companies/get-api-key',
            method: 'GET',
            params: { companyId },
            headers: { 'x-api-key-internal': 'secret' },
        }));
    });

    it('rejects invalid company logo upload responses', async () => {
        const request = jest.fn().mockResolvedValue({
            data: {
                status: true,
                message: 'OK',
                response: {
                    logoName: 'missing-message',
                },
            },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.uploadCompanyLogo(
            '11111111-1111-4111-8111-111111111111',
            {
                originalname: 'logo.png',
                mimetype: 'image/png',
                size: 12,
                buffer: Buffer.from('png'),
            },
        )).rejects.toBeInstanceOf(BadGatewayException);
    });

    it('assigns a user to a company in CORE with internal credentials', async () => {
        const payload = {
            companyId: '11111111-1111-4111-8111-111111111111',
            userId: '22222222-2222-4222-8222-222222222222',
            isOwner: true,
        };
        const response = {
            companyId: payload.companyId,
            userId: payload.userId,
            isOwner: true,
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.assignCompanyUser(payload)).resolves.toEqual(response);

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://core/api/v1/internal/core/companies/users/assign',
            method: 'POST',
            data: {
                companyId: payload.companyId,
                userId: payload.userId,
                isOwner: true,
            },
            headers: {
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('unassigns a user from a company in CORE with internal credentials', async () => {
        const payload = {
            companyId: '11111111-1111-4111-8111-111111111111',
            userId: '22222222-2222-4222-8222-222222222222',
        };
        const response = {
            companyId: payload.companyId,
            userId: payload.userId,
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.unassignCompanyUser(payload)).resolves.toEqual(response);

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://core/api/v1/internal/core/companies/users/unassign',
            method: 'POST',
            data: payload,
            headers: {
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('assigns a module to a company in CORE with internal credentials', async () => {
        const moduleId = '33333333-3333-4333-8333-333333333333';
        const payload = {
            companyId: '11111111-1111-4111-8111-111111111111',
            status: 'SOLO_LECTURA' as const,
        };
        const response = {
            moduleId,
            companyId: payload.companyId,
            status: 'SOLO_LECTURA',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.assignCompanyModule(moduleId, payload)).resolves.toEqual(response);

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: `http://core/api/v1/internal/core/modules/${moduleId}/companies`,
            method: 'PATCH',
            data: payload,
            headers: {
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('rejects invalid company module assignment responses', async () => {
        const request = jest.fn().mockResolvedValue({
            data: {
                status: true,
                message: 'OK',
                response: {
                    moduleId: 'invalid',
                    companyId: '11111111-1111-4111-8111-111111111111',
                    status: 'ACTIVO',
                    createdAt: '2026-01-01T00:00:00.000Z',
                    updatedAt: '2026-01-02T00:00:00.000Z',
                },
            },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.assignCompanyModule(
            '33333333-3333-4333-8333-333333333333',
            {
                companyId: '11111111-1111-4111-8111-111111111111',
                status: 'ACTIVO',
            },
        )).rejects.toBeInstanceOf(BadGatewayException);
    });

    it('calls CORE module CRUD endpoints with internal credentials', async () => {
        const moduleId = '33333333-3333-4333-8333-333333333333';
        const moduleResponse = {
            id: moduleId,
            code: 'ACC',
            name: 'Accounting',
            description: 'Accounting module',
            price: '100.00',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };
        const pageResponse = {
            data: [moduleResponse],
            total: 1,
            page: 1,
            amount: 10,
        };
        const request = jest.fn()
            .mockResolvedValueOnce({ data: { status: true, message: 'OK', response: pageResponse } })
            .mockResolvedValueOnce({ data: { status: true, message: 'OK', response: moduleResponse } })
            .mockResolvedValueOnce({ data: { status: true, message: 'OK', response: moduleResponse } })
            .mockResolvedValueOnce({ data: { status: true, message: 'OK', response: { ...moduleResponse, name: 'Finance' } } })
            .mockResolvedValueOnce({ data: { status: true, message: 'OK', response: { id: moduleId } } });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);
        const createPayload = {
            code: 'ACC',
            name: 'Accounting',
            description: 'Accounting module',
            price: '100.00',
        };
        const updatePayload = { name: 'Finance' };

        await expect(service.searchModules({ page: 1, amount: 10, search: 'acc' })).resolves.toEqual(pageResponse);
        await expect(service.findModuleById(moduleId)).resolves.toEqual(moduleResponse);
        await expect(service.createModule(createPayload)).resolves.toEqual(moduleResponse);
        await expect(service.updateModule(moduleId, updatePayload)).resolves.toMatchObject({ name: 'Finance' });
        await expect(service.deleteModule(moduleId)).resolves.toEqual({ id: moduleId });

        expect(request).toHaveBeenNthCalledWith(1, expect.objectContaining({
            url: 'http://core/api/v1/internal/core/modules/list',
            method: 'GET',
            params: { page: 1, amount: 10, search: 'acc' },
            headers: { 'x-api-key-internal': 'secret' },
        }));
        expect(request).toHaveBeenNthCalledWith(2, expect.objectContaining({
            url: `http://core/api/v1/internal/core/modules/${moduleId}`,
            method: 'GET',
            headers: { 'x-api-key-internal': 'secret' },
        }));
        expect(request).toHaveBeenNthCalledWith(3, expect.objectContaining({
            url: 'http://core/api/v1/internal/core/modules/create',
            method: 'POST',
            data: createPayload,
            headers: { 'x-api-key-internal': 'secret' },
        }));
        expect(request).toHaveBeenNthCalledWith(4, expect.objectContaining({
            url: `http://core/api/v1/internal/core/modules/edit/${moduleId}`,
            method: 'PUT',
            data: updatePayload,
            headers: { 'x-api-key-internal': 'secret' },
        }));
        expect(request).toHaveBeenNthCalledWith(5, expect.objectContaining({
            url: `http://core/api/v1/internal/core/modules/delete/${moduleId}`,
            method: 'DELETE',
            headers: { 'x-api-key-internal': 'secret' },
        }));
    });

    it('rejects invalid module responses', async () => {
        const request = jest.fn().mockResolvedValue({
            data: {
                status: true,
                message: 'OK',
                response: {
                    id: 'invalid',
                    code: 'ACC',
                    name: 'Accounting',
                    createdAt: '2026-01-01T00:00:00.000Z',
                    updatedAt: '2026-01-02T00:00:00.000Z',
                },
            },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.createModule({
            code: 'ACC',
            name: 'Accounting',
        })).rejects.toBeInstanceOf(BadGatewayException);
    });

    it('calls CORE extended company list with location filters', async () => {
        const response = {
            data: [{
                id: '11111111-1111-4111-8111-111111111111',
                businessNatureId: '22222222-2222-4222-8222-222222222222',
                taxResponsibilityId: '33333333-3333-4333-8333-333333333333',
                vatRegimeId: null,
                documentTypeId: '44444444-4444-4444-8444-444444444444',
                documentNumber: '900123456',
                businessName: 'Zoe SAS',
                tradeName: 'Zoe',
                email: 'admin@zoe.test',
                logoName: null,
                apiKey: 'encrypted-api-key',
                address: 'Street 1',
                timezone: 'America/Bogota',
                municipality: {
                    id: '55555555-5555-4555-8555-555555555555',
                    code: '05001',
                    name: 'Medellin',
                    state: {
                        id: '66666666-6666-4666-8666-666666666666',
                        code: '05',
                        name: 'Antioquia',
                    },
                },
                roles: [{
                    id: '88888888-8888-4888-8888-888888888888',
                    name: 'Operador',
                }],
                users: [{
                    id: '77777777-7777-4777-8777-777777777777',
                    userType: 'SUBUSUARIO',
                    email: 'sub@zoe.test',
                    firstName: 'Sub',
                    lastName: 'User',
                    isActive: true,
                    isDeleted: false,
                    isOwner: false,
                    roles: [{
                        id: '88888888-8888-4888-8888-888888888888',
                        name: 'Operador',
                    }],
                }],
                modules: [{
                    moduleId: '33333333-3333-4333-8333-333333333333',
                    code: 'ACC',
                    name: 'Contabilidad',
                    status: 'SOLO_LECTURA',
                }],
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-02T00:00:00.000Z',
            }],
            total: 1,
            page: 1,
            amount: 10,
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.searchCompaniesExtended({
            page: 1,
            amount: 10,
            search: 'zoe',
            municipalityId: '55555555-5555-4555-8555-555555555555',
            stateId: '66666666-6666-4666-8666-666666666666',
        })).resolves.toMatchObject({
            data: [{
                apiKey: 'encrypted-api-key',
                municipality: {
                    state: {
                        name: 'Antioquia',
                    },
                },
                roles: [{
                    id: '88888888-8888-4888-8888-888888888888',
                    name: 'Operador',
                }],
                users: [{
                    roles: [{
                        id: '88888888-8888-4888-8888-888888888888',
                        name: 'Operador',
                    }],
                }],
                modules: [{
                    code: 'ACC',
                    status: 'SOLO_LECTURA',
                }],
            }],
        });

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://core/api/v1/internal/core/companies/list-extended',
            method: 'GET',
            params: {
                page: 1,
                amount: 10,
                search: 'zoe',
                municipalityId: '55555555-5555-4555-8555-555555555555',
                stateId: '66666666-6666-4666-8666-666666666666',
            },
            headers: {
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('calls CORE company role detail with permissions', async () => {
        const response = {
            id: '88888888-8888-4888-8888-888888888888',
            name: 'Operador',
            description: 'Opera',
            isSystem: false,
            permissions: [{
                id: '99999999-9999-4999-8999-999999999999',
                module: 'core',
                resource: 'companies',
                action: 'read',
                name: 'Leer empresas',
                description: null,
            }],
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.findCompanyRole(
            '11111111-1111-4111-8111-111111111111',
            '88888888-8888-4888-8888-888888888888',
        )).resolves.toMatchObject({
            id: '88888888-8888-4888-8888-888888888888',
            permissions: [{ resource: 'companies' }],
        });

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://core/api/v1/internal/core/companies/11111111-1111-4111-8111-111111111111/roles/88888888-8888-4888-8888-888888888888',
            method: 'GET',
            headers: {
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

    it('calls CORE extended user list with filters and internal credentials', async () => {
        const response = {
            data: [{
                id: '11111111-1111-4111-8111-111111111111',
                label: 'Ada Lovelace',
                firstName: 'Ada',
                lastName: 'Lovelace',
                email: 'ada@example.com',
                username: 'ada',
                birthDate: '1990-05-21',
                municipalityId: '22222222-2222-4222-8222-222222222222',
                phonePrefix: '+57',
                phoneNumber: '3123456789',
                userType: 'USUARIO',
                isActive: true,
                isVerified: true,
                isAdmin: true,
                backofficeRole: 'ADMINISTRADOR',
                account: {
                    id: '22222222-2222-4222-8222-222222222222',
                    code: '00000001',
                    isActive: true,
                    isDeleted: false,
                    isDemo: false,
                    createdAt: '2026-01-01T00:00:00.000Z',
                    updatedAt: '2026-01-02T00:00:00.000Z',
                },
                companies: [{
                    id: '33333333-3333-4333-8333-333333333333',
                    documentNumber: '900123456',
                    businessName: 'Acme SAS',
                    tradeName: 'Acme',
                    email: 'admin@acme.com',
                    isOwner: false,
                    roles: [{
                        id: '44444444-4444-4444-8444-444444444444',
                        name: 'Contador',
                    }],
                }],
                sessions: [],
                last_login_at: '2026-01-03T00:00:00.000Z',
                total_sessions: 2,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-02T00:00:00.000Z',
            }],
            total: 1,
            page: 1,
            amount: 10,
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.searchUserListExtended({
            page: 1,
            amount: 10,
            search: 'ada',
            companyId: '33333333-3333-4333-8333-333333333333',
            isAdmin: true,
            isDemo: false,
            type: 'USUARIO',
        })).resolves.toMatchObject({
            data: [{
                backofficeRole: 'ADMINISTRADOR',
                birthDate: '1990-05-21',
                municipalityId: '22222222-2222-4222-8222-222222222222',
                phonePrefix: '+57',
                phoneNumber: '3123456789',
                account: { code: '00000001' },
                companies: [{
                    roles: [{
                        id: '44444444-4444-4444-8444-444444444444',
                        name: 'Contador',
                    }],
                }],
                sessions: [],
                last_login_at: '2026-01-03T00:00:00.000Z',
                total_sessions: 2,
            }],
        });

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://core/api/v1/internal/core/users/list-extended',
            method: 'GET',
            params: {
                page: 1,
                amount: 10,
                search: 'ada',
                companyId: '33333333-3333-4333-8333-333333333333',
                isAdmin: true,
                isDemo: false,
                type: 'USUARIO',
            },
            headers: {
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('calls CORE user detail with internal credentials', async () => {
        const userId = '11111111-1111-4111-8111-111111111111';
        const response = {
            id: userId,
            label: 'Ada Lovelace',
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            username: 'ada',
            userType: 'USUARIO',
            isActive: true,
            isVerified: true,
            isAdmin: true,
            backofficeRole: 'ADMINISTRADOR',
            account: null,
            companies: [],
            sessions: [],
            last_login_at: null,
            total_sessions: 0,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.findUserById(userId)).resolves.toMatchObject({ id: userId });
        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: `http://core/api/v1/internal/core/users/${userId}`,
            method: 'GET',
            headers: {
                'x-api-key-internal': 'secret',
            },
        }));
    });

    it('creates, updates and changes user status in CORE with internal credentials', async () => {
        const userId = '11111111-1111-4111-8111-111111111111';
        const response = {
            id: userId,
            label: 'Ada Lovelace',
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            username: 'ada',
            userType: 'USUARIO',
            isActive: true,
            isVerified: true,
            isAdmin: true,
            backofficeRole: 'OPERARIO',
            account: null,
            companies: [],
            sessions: [],
            last_login_at: null,
            total_sessions: 0,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);
        const createPayload = {
            email: 'ada@example.com',
            password: 'TemporalPassword123!',
            firstName: 'Ada',
            lastName: 'Lovelace',
            municipalityId: '33333333-3333-4333-8333-333333333333',
            birthDate: '1990-05-21',
            isAdmin: true,
            backofficeRole: 'OPERARIO' as const,
        };
        const updatePayload = {
            firstName: 'Ada',
            backofficeRole: 'OPERARIO' as const,
            phonePrefix: '+57',
            phoneNumber: '3123456789',
        };

        await expect(service.createUser(createPayload)).resolves.toMatchObject({ id: userId });
        await expect(service.updateUser(userId, updatePayload)).resolves.toMatchObject({ id: userId });
        await expect(service.updateUserStatus(userId, { active: false })).resolves.toMatchObject({ id: userId });

        expect(request).toHaveBeenNthCalledWith(1, expect.objectContaining({
            url: 'http://core/api/v1/internal/core/users/create',
            method: 'POST',
            data: createPayload,
            headers: { 'x-api-key-internal': 'secret' },
        }));
        expect(request).toHaveBeenNthCalledWith(2, expect.objectContaining({
            url: `http://core/api/v1/internal/core/users/edit/${userId}`,
            method: 'PUT',
            data: updatePayload,
            headers: { 'x-api-key-internal': 'secret' },
        }));
        expect(request).toHaveBeenNthCalledWith(3, expect.objectContaining({
            url: `http://core/api/v1/internal/core/users/${userId}/status`,
            method: 'PATCH',
            data: { active: false },
            headers: { 'x-api-key-internal': 'secret' },
        }));
    });

    it('deletes a demo user in CORE with internal credentials', async () => {
        const userId = '11111111-1111-4111-8111-111111111111';
        const response = {
            userId,
            accountId: '22222222-2222-4222-8222-222222222222',
            deletedCompanies: ['33333333-3333-4333-8333-333333333333'],
            deleted: true,
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.deleteDemoUser(userId)).resolves.toEqual(response);
        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: `http://core/api/v1/internal/core/users/${userId}/demo`,
            method: 'DELETE',
            headers: { 'x-api-key-internal': 'secret' },
        }));
    });

    it('updates account demo flag in CORE with internal credentials', async () => {
        const accountId = '22222222-2222-4222-8222-222222222222';
        const response = {
            id: accountId,
            code: '00000001',
            isActive: true,
            isDeleted: false,
            isDemo: true,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.updateAccountDemo(accountId, { isDemo: true })).resolves.toMatchObject({
            id: accountId,
            isDemo: true,
        });

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: `http://core/api/v1/internal/core/accounts/${accountId}/demo`,
            method: 'PATCH',
            data: { isDemo: true },
            headers: { 'x-api-key-internal': 'secret' },
        }));
    });

    it('calls CORE catalog match with extracted text values', async () => {
        const response = [{
            catalog: 'documentType',
            input: { name: 'NIT' },
            id: '11111111-1111-4111-8111-111111111111',
            code: '31',
            name: 'NIT',
            matchedBy: 'name',
            confidence: 1,
        }];
        const request = jest.fn().mockResolvedValue({
            data: { status: true, message: 'OK', response },
        });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.matchCatalogs([
            { catalog: 'documentType' as any, name: 'NIT' },
        ])).resolves.toEqual(response);

        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://core/api/v1/internal/common/catalogs/match',
            method: 'POST',
            data: {
                items: [{ catalog: 'documentType', name: 'NIT' }],
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

    it('preserves bad request errors returned by CORE requests', async () => {
        const response = { status: 400, data: { message: 'Usuario invalido' } };
        const request = jest.fn().mockRejectedValue({ response });
        const service = new BackofficeCoreService({ axiosRef: { request } } as any);

        await expect(service.assignCompanyUser({
            companyId: '11111111-1111-4111-8111-111111111111',
            userId: '22222222-2222-4222-8222-222222222222',
            isOwner: false,
        })).rejects.toMatchObject({
            response: {
                message: 'Usuario invalido',
            },
        });
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
