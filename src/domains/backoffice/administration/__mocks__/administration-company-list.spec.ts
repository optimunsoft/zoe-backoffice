jest.mock('src/config/env.config', () => ({
  envs: {
    api_url_internal_core: 'http://core',
    api_key_internal_core: 'secret',
    internal_timeout_ms: 5000,
  },
}));

import { AdministrationController } from '../administration.controller';
import { AdministrationService } from '../administration.service';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { UpdateCoreCompanyStatusDto } from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';

describe('Administration company list', () => {
  it('delegates company list to CORE extended search', async () => {
    const response = { data: [], total: 0, page: 1, amount: 10 };
    const coreIntegration = {
      searchCompaniesExtended: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any);
    const query = {
      page: 1,
      amount: 10,
      search: 'zoe',
      municipalityId: '55555555-5555-4555-8555-555555555555',
      stateId: '66666666-6666-4666-8666-666666666666',
    };

    await expect(service.listCompanies(query)).resolves.toBe(response);
    expect(coreIntegration.searchCompaniesExtended).toHaveBeenCalledWith(query);
  });

  it('delegates company role detail to CORE integration', async () => {
    const response = {
      id: '88888888-8888-4888-8888-888888888888',
      name: 'Operador',
      isSystem: false,
      permissions: [],
    };
    const coreIntegration = {
      findCompanyRole: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any);

    await expect(service.findCompanyRole(
      '11111111-1111-4111-8111-111111111111',
      '88888888-8888-4888-8888-888888888888',
    )).resolves.toBe(response);
    expect(coreIntegration.findCompanyRole).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      '88888888-8888-4888-8888-888888888888',
    );
  });

  it('delegates company creation to CORE integration', async () => {
    const dto = {
      ownerUserId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      businessNatureId: '22222222-2222-4222-8222-222222222222',
      taxResponsibilityId: '33333333-3333-4333-8333-333333333333',
      documentTypeId: '44444444-4444-4444-8444-444444444444',
      documentNumber: '900123456',
      businessName: 'Zoe SAS',
      municipalityId: '55555555-5555-4555-8555-555555555555',
    };
    const response = {
      id: '11111111-1111-4111-8111-111111111111',
      ...dto,
      apiKey: 'encrypted-api-key',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    const coreIntegration = {
      createCompany: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any);

    await expect(service.createCompany(dto)).resolves.toBe(response);
    expect(coreIntegration.createCompany).toHaveBeenCalledWith(dto);
  });

  it('delegates company update to CORE integration', async () => {
    const companyId = '11111111-1111-4111-8111-111111111111';
    const dto = {
      businessNatureId: '22222222-2222-4222-8222-222222222222',
      taxResponsibilityId: '33333333-3333-4333-8333-333333333333',
      documentTypeId: '44444444-4444-4444-8444-444444444444',
      documentNumber: '900123456',
      businessName: 'Zoe SAS Actualizada',
      municipalityId: '55555555-5555-4555-8555-555555555555',
    };
    const response = {
      id: companyId,
      ...dto,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    const coreIntegration = {
      updateCompany: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any);

    await expect(service.updateCompany(companyId, dto)).resolves.toBe(response);
    expect(coreIntegration.updateCompany).toHaveBeenCalledWith(companyId, dto);
  });

  it('delegates company status update to CORE integration', async () => {
    const companyId = '11111111-1111-4111-8111-111111111111';
    const dto = { active: false };
    const response = {
      id: companyId,
      businessNatureId: '22222222-2222-4222-8222-222222222222',
      taxResponsibilityId: '33333333-3333-4333-8333-333333333333',
      documentTypeId: '44444444-4444-4444-8444-444444444444',
      documentNumber: '900123456',
      businessName: 'Zoe SAS',
      municipalityId: '55555555-5555-4555-8555-555555555555',
      active: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    const coreIntegration = {
      updateCompanyStatus: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any);

    await expect(service.updateCompanyStatus(companyId, dto)).resolves.toBe(response);
    expect(coreIntegration.updateCompanyStatus).toHaveBeenCalledWith(companyId, dto);
  });

  it('delegates controller company list to administration service', async () => {
    const response = { data: [], total: 0, page: 1, amount: 10 };
    const service = {
      listCompanies: jest.fn().mockResolvedValue(response),
    };
    const controller = new AdministrationController(service as any);
    const query = { page: 1, amount: 10, search: 'zoe' };

    await expect(controller.listCompanies(query)).resolves.toBe(response);
    expect(service.listCompanies).toHaveBeenCalledWith(query);
  });

  it('delegates controller company creation to administration service', async () => {
    const dto = {
      ownerUserId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      businessNatureId: '22222222-2222-4222-8222-222222222222',
      taxResponsibilityId: '33333333-3333-4333-8333-333333333333',
      documentTypeId: '44444444-4444-4444-8444-444444444444',
      documentNumber: '900123456',
      businessName: 'Zoe SAS',
      municipalityId: '55555555-5555-4555-8555-555555555555',
    };
    const response = {
      id: '11111111-1111-4111-8111-111111111111',
      ...dto,
      apiKey: 'encrypted-api-key',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    const service = {
      createCompany: jest.fn().mockResolvedValue(response),
    };
    const controller = new AdministrationController(service as any);

    await expect(controller.createCompany(dto)).resolves.toBe(response);
    expect(service.createCompany).toHaveBeenCalledWith(dto);
  });

  it('delegates controller company update to administration service', async () => {
    const companyId = '11111111-1111-4111-8111-111111111111';
    const dto = {
      businessName: 'Zoe SAS Actualizada',
      email: 'admin@zoe.test',
    };
    const response = {
      id: companyId,
      businessNatureId: '22222222-2222-4222-8222-222222222222',
      taxResponsibilityId: '33333333-3333-4333-8333-333333333333',
      documentTypeId: '44444444-4444-4444-8444-444444444444',
      documentNumber: '900123456',
      businessName: dto.businessName,
      email: dto.email,
      municipalityId: '55555555-5555-4555-8555-555555555555',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    const service = {
      updateCompany: jest.fn().mockResolvedValue(response),
    };
    const controller = new AdministrationController(service as any);

    await expect(controller.updateCompany(companyId, dto)).resolves.toBe(response);
    expect(service.updateCompany).toHaveBeenCalledWith(companyId, dto);
  });

  it('delegates controller company status update to administration service', async () => {
    const companyId = '11111111-1111-4111-8111-111111111111';
    const dto = { active: false };
    const response = {
      id: companyId,
      businessNatureId: '22222222-2222-4222-8222-222222222222',
      taxResponsibilityId: '33333333-3333-4333-8333-333333333333',
      documentTypeId: '44444444-4444-4444-8444-444444444444',
      documentNumber: '900123456',
      businessName: 'Zoe SAS',
      municipalityId: '55555555-5555-4555-8555-555555555555',
      active: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    const service = {
      updateCompanyStatus: jest.fn().mockResolvedValue(response),
    };
    const controller = new AdministrationController(service as any);

    await expect(controller.updateCompanyStatus(companyId, dto)).resolves.toBe(response);
    expect(service.updateCompanyStatus).toHaveBeenCalledWith(companyId, dto);
  });

  it('validates company status update DTO strictly', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    await expect(pipe.transform(
      { active: true },
      { type: 'body', metatype: UpdateCoreCompanyStatusDto },
    )).resolves.toMatchObject({ active: true });

    await expect(pipe.transform(
      {},
      { type: 'body', metatype: UpdateCoreCompanyStatusDto },
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(pipe.transform(
      { active: 'false' },
      { type: 'body', metatype: UpdateCoreCompanyStatusDto },
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(pipe.transform(
      { active: true, businessName: 'Zoe SAS' },
      { type: 'body', metatype: UpdateCoreCompanyStatusDto },
    )).rejects.toBeInstanceOf(BadRequestException);
  });

  it('delegates controller company role detail to administration service', async () => {
    const response = {
      id: '88888888-8888-4888-8888-888888888888',
      name: 'Operador',
      isSystem: false,
      permissions: [],
    };
    const service = {
      findCompanyRole: jest.fn().mockResolvedValue(response),
    };
    const controller = new AdministrationController(service as any);

    await expect(controller.findCompanyRole(
      '11111111-1111-4111-8111-111111111111',
      '88888888-8888-4888-8888-888888888888',
    )).resolves.toBe(response);
    expect(service.findCompanyRole).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      '88888888-8888-4888-8888-888888888888',
    );
  });
});
