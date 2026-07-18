jest.mock('src/config/env.config', () => ({
    envs: {
        rut_pdf_max_mb: 5,
    },
}));

import { AdministrationService } from '../administration.service';

describe('Administration modules', () => {
    it('delegates module CRUD operations to CORE integration', async () => {
        const moduleId = '33333333-3333-4333-8333-333333333333';
        const module = {
            id: moduleId,
            code: 'ACC',
            name: 'Accounting',
            description: 'Accounting module',
            active: true,
            price: '100.00',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
        };
        const page = { data: [module], total: 1, page: 1, amount: 10 };
        const coreIntegration = {
            searchModules: jest.fn().mockResolvedValue(page),
            findModuleById: jest.fn().mockResolvedValue(module),
            createModule: jest.fn().mockResolvedValue(module),
            updateModule: jest.fn().mockResolvedValue({ ...module, name: 'Finance' }),
            deleteModule: jest.fn().mockResolvedValue({ id: moduleId }),
        };
        const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);
        const createDto = {
            code: 'ACC',
            name: 'Accounting',
            description: 'Accounting module',
            price: '100.00',
        };
        const updateDto = { name: 'Finance' };

        await expect(service.listModules({ page: 1, amount: 10, search: 'acc' })).resolves.toBe(page);
        await expect(service.findModuleById(moduleId)).resolves.toBe(module);
        await expect(service.createModule(createDto)).resolves.toBe(module);
        await expect(service.updateModule(moduleId, updateDto)).resolves.toMatchObject({ name: 'Finance' });
        await expect(service.deleteModule(moduleId)).resolves.toEqual({ id: moduleId });

        expect(coreIntegration.searchModules).toHaveBeenCalledWith({ page: 1, amount: 10, search: 'acc' });
        expect(coreIntegration.findModuleById).toHaveBeenCalledWith(moduleId);
        expect(coreIntegration.createModule).toHaveBeenCalledWith(createDto);
        expect(coreIntegration.updateModule).toHaveBeenCalledWith(moduleId, updateDto);
        expect(coreIntegration.deleteModule).toHaveBeenCalledWith(moduleId);
    });
});
