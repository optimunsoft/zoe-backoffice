jest.mock('src/config/env.config', () => ({
  envs: {
    api_url_internal_core: 'http://core',
    api_key_internal_core: 'secret',
    internal_timeout_ms: 5000,
  },
}));

import { AdministrationController } from '../administration.controller';
import { AdministrationService } from '../administration.service';
import { BadRequestException, ForbiddenException, ValidationPipe } from '@nestjs/common';
import {
  AssignCoreCompanyUserDto,
  AssignCoreCompanyUserRequestDto,
  CreateCoreBackofficeUserRequestDto,
  CreateCoreUserDto,
  UnassignCoreCompanyUserDto,
  UpdateCoreAccountDemoDto,
  UpdateCoreBackofficeUserRequestDto,
  UpdateCoreCompanyStatusDto,
  UpdateCoreUserStatusDto,
} from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';
import { ListUsersExtendedQueryDto } from '../dto/list-users-extended-query.dto';

describe('Administration company list', () => {
  it('delegates company list to CORE extended search', async () => {
    const response = { data: [], total: 0, page: 1, amount: 10 };
    const coreIntegration = {
      searchCompaniesExtended: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);
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
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);

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
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);

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
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);

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
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);

    await expect(service.updateCompanyStatus(companyId, dto)).resolves.toBe(response);
    expect(coreIntegration.updateCompanyStatus).toHaveBeenCalledWith(companyId, dto);
  });

  it('delegates company logo get and upload to CORE integration', async () => {
    const companyId = '11111111-1111-4111-8111-111111111111';
    const logoResponse = { logo: 'https://signed-url.test/logo.png' };
    const uploadResponse = {
      message: 'Logo subido exitosamente',
      logoName: `${companyId}/logo/new.png`,
    };
    const file = {
      originalname: 'logo.png',
      mimetype: 'image/png',
      size: 12,
      buffer: Buffer.from('png'),
    };
    const coreIntegration = {
      getCompanyLogo: jest.fn().mockResolvedValue(logoResponse),
      uploadCompanyLogo: jest.fn().mockResolvedValue(uploadResponse),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);

    await expect(service.getCompanyLogo(companyId, true)).resolves.toBe(logoResponse);
    await expect(service.uploadCompanyLogo(companyId, file)).resolves.toBe(uploadResponse);
    expect(coreIntegration.getCompanyLogo).toHaveBeenCalledWith(companyId, true);
    expect(coreIntegration.uploadCompanyLogo).toHaveBeenCalledWith(companyId, file);
  });

  it('delegates company api key generation and retrieval to CORE integration', async () => {
    const companyId = '11111111-1111-4111-8111-111111111111';
    const response = { apiKey: 'plain-api-key' };
    const coreIntegration = {
      generateCompanyApiKey: jest.fn().mockResolvedValue(response),
      getCompanyApiKey: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);

    await expect(service.generateCompanyApiKey(companyId)).resolves.toBe(response);
    await expect(service.getCompanyApiKey(companyId)).resolves.toBe(response);
    expect(coreIntegration.generateCompanyApiKey).toHaveBeenCalledWith(companyId);
    expect(coreIntegration.getCompanyApiKey).toHaveBeenCalledWith(companyId);
  });

  it('delegates user-company assignment to CORE integration', async () => {
    const dto = {
      companyId: '11111111-1111-4111-8111-111111111111',
      userId: '22222222-2222-4222-8222-222222222222',
      isOwner: true,
    };
    const response = {
      companyId: dto.companyId,
      userId: dto.userId,
      isOwner: true,
    };
    const coreIntegration = {
      findUserById: jest.fn().mockResolvedValue({ id: dto.userId, userType: 'USUARIO' }),
      assignCompanyUser: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);

    await expect(service.assignCompanyUser(dto)).resolves.toBe(response);
    expect(coreIntegration.findUserById).toHaveBeenCalledWith(dto.userId);
    expect(coreIntegration.assignCompanyUser).toHaveBeenCalledWith(dto);
  });

  it('rejects user-company assignment for sub-users', async () => {
    const dto = {
      companyId: '11111111-1111-4111-8111-111111111111',
      userId: '22222222-2222-4222-8222-222222222222',
      isOwner: false,
    };
    const coreIntegration = {
      findUserById: jest.fn().mockResolvedValue({ id: dto.userId, userType: 'SUBUSUARIO' }),
      assignCompanyUser: jest.fn(),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);

    await expect(service.assignCompanyUser(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(coreIntegration.assignCompanyUser).not.toHaveBeenCalled();
  });

  it('delegates user-company unassignment to CORE integration', async () => {
    const dto = {
      companyId: '11111111-1111-4111-8111-111111111111',
      userId: '22222222-2222-4222-8222-222222222222',
    };
    const response = {
      companyId: dto.companyId,
      userId: dto.userId,
    };
    const coreIntegration = {
      findUserById: jest.fn().mockResolvedValue({ id: dto.userId, userType: 'USUARIO' }),
      unassignCompanyUser: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);

    await expect(service.unassignCompanyUser(dto)).resolves.toBe(response);
    expect(coreIntegration.findUserById).toHaveBeenCalledWith(dto.userId);
    expect(coreIntegration.unassignCompanyUser).toHaveBeenCalledWith(dto);
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

  it('delegates controller company logo get and upload to administration service', async () => {
    const companyId = '11111111-1111-4111-8111-111111111111';
    const logoResponse = { logo: 'https://signed-url.test/logo.png' };
    const uploadResponse = {
      message: 'Logo subido exitosamente',
      logoName: `${companyId}/logo/new.png`,
    };
    const file = {
      originalname: 'logo.png',
      mimetype: 'image/png',
      size: 12,
      buffer: Buffer.from('png'),
    };
    const service = {
      getCompanyLogo: jest.fn().mockResolvedValue(logoResponse),
      uploadCompanyLogo: jest.fn().mockResolvedValue(uploadResponse),
    };
    const controller = new AdministrationController(service as any);

    await expect(controller.getCompanyLogo(companyId, false)).resolves.toBe(logoResponse);
    await expect(controller.uploadCompanyLogo(companyId, file)).resolves.toBe(uploadResponse);
    expect(service.getCompanyLogo).toHaveBeenCalledWith(companyId, false);
    expect(service.uploadCompanyLogo).toHaveBeenCalledWith(companyId, file);
  });

  it('delegates controller company api key generation and retrieval to administration service', async () => {
    const companyId = '11111111-1111-4111-8111-111111111111';
    const response = { apiKey: 'plain-api-key' };
    const service = {
      generateCompanyApiKey: jest.fn().mockResolvedValue(response),
      getCompanyApiKey: jest.fn().mockResolvedValue(response),
    };
    const controller = new AdministrationController(service as any);

    await expect(controller.generateCompanyApiKey(companyId)).resolves.toBe(response);
    await expect(controller.getCompanyApiKey(companyId)).resolves.toBe(response);
    expect(service.generateCompanyApiKey).toHaveBeenCalledWith(companyId);
    expect(service.getCompanyApiKey).toHaveBeenCalledWith(companyId);
  });

  it('delegates controller user-company assignment to administration service', async () => {
    const dto = {
      companyId: '11111111-1111-4111-8111-111111111111',
      userId: '22222222-2222-4222-8222-222222222222',
      isOwner: true,
    };
    const response = {
      companyId: dto.companyId,
      userId: dto.userId,
      isOwner: true,
    };
    const service = {
      assignCompanyUser: jest.fn().mockResolvedValue(response),
    };
    const controller = new AdministrationController(service as any);

    await expect(controller.assignCompanyUser(dto)).resolves.toBe(response);
    expect(service.assignCompanyUser).toHaveBeenCalledWith({
      companyId: dto.companyId,
      userId: dto.userId,
      isOwner: true,
    });
  });

  it('delegates controller user-company unassignment to administration service', async () => {
    const dto = {
      companyId: '11111111-1111-4111-8111-111111111111',
      userId: '22222222-2222-4222-8222-222222222222',
    };
    const response = {
      companyId: dto.companyId,
      userId: dto.userId,
    };
    const service = {
      unassignCompanyUser: jest.fn().mockResolvedValue(response),
    };
    const controller = new AdministrationController(service as any);

    await expect(controller.unassignCompanyUser(dto)).resolves.toBe(response);
    expect(service.unassignCompanyUser).toHaveBeenCalledWith(dto);
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

  it('validates user-company assignment DTO strictly', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    await expect(pipe.transform(
      {
        companyId: '11111111-1111-4111-8111-111111111111',
        userId: '22222222-2222-4222-8222-222222222222',
        isOwner: true,
      },
      { type: 'body', metatype: AssignCoreCompanyUserRequestDto },
    )).resolves.toMatchObject({ isOwner: true });

    await expect(pipe.transform(
      {
        companyId: '11111111-1111-4111-8111-111111111111',
        userId: '22222222-2222-4222-8222-222222222222',
        is_owner: true,
      },
      { type: 'body', metatype: AssignCoreCompanyUserRequestDto },
    )).rejects.toBeInstanceOf(BadRequestException);
  });

  it('validates user-company unassignment DTO strictly', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    await expect(pipe.transform(
      {
        companyId: '11111111-1111-4111-8111-111111111111',
        userId: '22222222-2222-4222-8222-222222222222',
      },
      { type: 'body', metatype: UnassignCoreCompanyUserDto },
    )).resolves.toMatchObject({
      companyId: '11111111-1111-4111-8111-111111111111',
      userId: '22222222-2222-4222-8222-222222222222',
    });

    await expect(pipe.transform(
      {
        companyId: '11111111-1111-4111-8111-111111111111',
        userId: '22222222-2222-4222-8222-222222222222',
        isOwner: false,
      },
      { type: 'body', metatype: UnassignCoreCompanyUserDto },
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

  it('delegates extended user list to CORE integration', async () => {
    const response = { data: [], total: 0, page: 1, amount: 10 };
    const coreIntegration = {
      searchUserListExtended: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);
    const query = {
      page: 1,
      amount: 10,
      search: 'ada',
      companyId: '11111111-1111-4111-8111-111111111111',
      isAdmin: true,
      isDemo: true,
      type: 'USUARIO' as const,
    };

    await expect(service.listUsersExtended(query)).resolves.toBe(response);
    expect(coreIntegration.searchUserListExtended).toHaveBeenCalledWith(query);
  });

  it('delegates user CRUD operations to CORE integration', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const response = { id: userId };
    const deletionResponse = {
      userId,
      accountId: '22222222-2222-4222-8222-222222222222',
      deletedCompanies: ['33333333-3333-4333-8333-333333333333'],
      deleted: true,
    };
    const coreIntegration = {
      findUserById: jest.fn().mockResolvedValue(response),
      createUser: jest.fn().mockResolvedValue(response),
      createBackofficeUser: jest.fn().mockResolvedValue(response),
      updateUser: jest.fn().mockResolvedValue(response),
      updateBackofficeUser: jest.fn().mockResolvedValue(response),
      updateUserStatus: jest.fn().mockResolvedValue(response),
      deleteDemoUser: jest.fn().mockResolvedValue(deletionResponse),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);
    const createDto = {
      email: 'ada@example.com',
      password: 'TemporalPassword123!',
      firstName: 'Ada',
      lastName: 'Lovelace',
      municipalityId: '22222222-2222-4222-8222-222222222222',
      birthDate: '1990-05-21',
    };
    const createBackofficeDto = {
      ...createDto,
      email: 'ada@optimunsoft.co',
      backofficeRole: 'OPERARIO' as const,
    };

    await expect(service.findUserById(userId)).resolves.toBe(response);
    await expect(service.createUser({ id: userId, email: 'admin@example.com' }, createDto)).resolves.toBe(response);
    await expect(service.createBackofficeUser({ id: userId, email: 'admin@example.com' }, createBackofficeDto)).resolves.toBe(response);
    await expect(service.updateUser({ email: 'admin@example.com' }, userId, { firstName: 'Ada' })).resolves.toBe(response);
    await expect(service.updateBackofficeUser({ id: userId, email: 'admin@example.com' }, userId, { backofficeRole: 'OPERARIO' })).resolves.toBe(response);
    await expect(service.updateUserStatus(userId, { active: false })).resolves.toBe(response);
    await expect(service.deleteDemoUser(userId)).resolves.toBe(deletionResponse);

    expect(coreIntegration.findUserById).toHaveBeenCalledWith(userId);
    expect(coreIntegration.createUser).toHaveBeenCalledWith(createDto);
    expect(coreIntegration.createBackofficeUser).toHaveBeenCalledWith({
      ...createBackofficeDto,
      isAdmin: true,
      isVerified: true,
      isDemo: false,
      creatorUserId: userId,
    });
    expect(coreIntegration.updateUser).toHaveBeenCalledWith(userId, { firstName: 'Ada' });
    expect(coreIntegration.updateBackofficeUser).toHaveBeenCalledWith(userId, {
      backofficeRole: 'OPERARIO',
      updaterUserId: userId,
    });
    expect(coreIntegration.updateUserStatus).toHaveBeenCalledWith(userId, { active: false });
    expect(coreIntegration.deleteDemoUser).toHaveBeenCalledWith(userId);
  });

  it('rejects administrator role assignment when actor is not backoffice administrator', async () => {
    const coreIntegration = {
      createUser: jest.fn(),
      createBackofficeUser: jest.fn(),
    };
    const authorizationRepository = {
      isBackofficeAdministratorEmail: jest.fn().mockResolvedValue(false),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, authorizationRepository as any);

    await expect(service.createBackofficeUser(
      { email: 'operator@example.com' },
      {
        email: 'ada@optimunsoft.co',
        password: 'TemporalPassword123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        municipalityId: '22222222-2222-4222-8222-222222222222',
        birthDate: '1990-05-21',
        backofficeRole: 'ADMINISTRADOR',
      },
    )).rejects.toBeInstanceOf(ForbiddenException);
    expect(coreIntegration.createUser).not.toHaveBeenCalled();
    expect(coreIntegration.createBackofficeUser).not.toHaveBeenCalled();
  });

  it('rejects admin users without backoffice role or optimunsoft email', async () => {
    const coreIntegration = {
      createUser: jest.fn(),
      createBackofficeUser: jest.fn(),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);
    const baseDto = {
      email: 'ada@optimunsoft.co',
      password: 'TemporalPassword123!',
      firstName: 'Ada',
      lastName: 'Lovelace',
      municipalityId: '22222222-2222-4222-8222-222222222222',
      birthDate: '1990-05-21',
    };

    await expect(service.createBackofficeUser(
      { id: '11111111-1111-4111-8111-111111111111', email: 'admin@example.com' },
      baseDto as any,
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(service.createBackofficeUser(
      { id: '11111111-1111-4111-8111-111111111111', email: 'admin@example.com' },
      {
        ...baseDto,
        email: 'ada@example.com',
        backofficeRole: 'OPERARIO',
      },
    )).rejects.toBeInstanceOf(BadRequestException);

    expect(coreIntegration.createUser).not.toHaveBeenCalled();
    expect(coreIntegration.createBackofficeUser).not.toHaveBeenCalled();
  });

  it('rejects root user creation with backoffice fields', async () => {
    const coreIntegration = {
      createUser: jest.fn(),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);
    const baseDto = {
      email: 'ada@example.com',
      password: 'TemporalPassword123!',
      firstName: 'Ada',
      lastName: 'Lovelace',
      municipalityId: '22222222-2222-4222-8222-222222222222',
      birthDate: '1990-05-21',
    };

    await expect(service.createUser(
      { email: 'admin@example.com' },
      { ...baseDto, isAdmin: true } as any,
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(service.createUser(
      { email: 'admin@example.com' },
      { ...baseDto, backofficeRole: 'OPERARIO' } as any,
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(service.createUser(
      { email: 'admin@example.com' },
      { ...baseDto, userType: 'SUBUSUARIO' } as any,
    )).rejects.toBeInstanceOf(BadRequestException);

    expect(coreIntegration.createUser).not.toHaveBeenCalled();
  });

  it('rejects root user updates with backoffice fields', async () => {
    const coreIntegration = {
      updateUser: jest.fn(),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);
    const userId = '11111111-1111-4111-8111-111111111111';

    await expect(service.updateUser(
      { email: 'admin@example.com' },
      userId,
      { isAdmin: true } as any,
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(service.updateUser(
      { email: 'admin@example.com' },
      userId,
      { backofficeRole: 'OPERARIO' } as any,
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(service.updateUser(
      { email: 'admin@example.com' },
      userId,
      { userType: 'SUBUSUARIO' } as any,
    )).rejects.toBeInstanceOf(BadRequestException);

    expect(coreIntegration.updateUser).not.toHaveBeenCalled();
  });

  it('rejects backoffice user create and update with explicit user type', async () => {
    const coreIntegration = {
      createBackofficeUser: jest.fn(),
      updateBackofficeUser: jest.fn(),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);
    const actor = { id: '11111111-1111-4111-8111-111111111111', email: 'admin@example.com' };

    await expect(service.createBackofficeUser(
      actor,
      {
        email: 'ada@optimunsoft.co',
        password: 'TemporalPassword123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        municipalityId: '22222222-2222-4222-8222-222222222222',
        birthDate: '1990-05-21',
        backofficeRole: 'OPERARIO',
        userType: 'USUARIO',
      } as any,
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(service.updateBackofficeUser(
      actor,
      '22222222-2222-4222-8222-222222222222',
      { type: 'USUARIO' } as any,
    )).rejects.toBeInstanceOf(BadRequestException);

    expect(coreIntegration.createBackofficeUser).not.toHaveBeenCalled();
    expect(coreIntegration.updateBackofficeUser).not.toHaveBeenCalled();
  });

  it('delegates account demo updates to CORE integration', async () => {
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
    const coreIntegration = {
      updateAccountDemo: jest.fn().mockResolvedValue(response),
    };
    const service = new AdministrationService(coreIntegration as any, {} as any, {} as any);

    await expect(service.updateAccountDemo(accountId, { isDemo: true })).resolves.toBe(response);
    expect(coreIntegration.updateAccountDemo).toHaveBeenCalledWith(accountId, { isDemo: true });
  });

  it('delegates controller user CRUD endpoints to administration service', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const response = { id: userId };
    const deletionResponse = {
      userId,
      accountId: '22222222-2222-4222-8222-222222222222',
      deletedCompanies: ['33333333-3333-4333-8333-333333333333'],
      deleted: true,
    };
    const service = {
      listUsersExtended: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, amount: 10 }),
      findUserById: jest.fn().mockResolvedValue(response),
      createUser: jest.fn().mockResolvedValue(response),
      createBackofficeUser: jest.fn().mockResolvedValue(response),
      updateUser: jest.fn().mockResolvedValue(response),
      updateBackofficeUser: jest.fn().mockResolvedValue(response),
      updateUserStatus: jest.fn().mockResolvedValue(response),
      deleteDemoUser: jest.fn().mockResolvedValue(deletionResponse),
    };
    const controller = new AdministrationController(service as any);
    const query = { page: 1, amount: 10, search: 'ada' };
    const createDto = {
      email: 'ada@optimunsoft.co',
      password: 'TemporalPassword123!',
      firstName: 'Ada',
      lastName: 'Lovelace',
      municipalityId: '22222222-2222-4222-8222-222222222222',
      birthDate: '1990-05-21',
      isAdmin: true,
      backofficeRole: 'OPERARIO' as const,
    };

    await expect(controller.listUsersExtended(query)).resolves.toEqual({ data: [], total: 0, page: 1, amount: 10 });
    await expect(controller.findUserById(userId)).resolves.toBe(response);
    await expect(controller.createUser({ user: { email: 'admin@example.com' } }, createDto)).resolves.toBe(response);
    await expect(controller.createBackofficeUser({ user: { id: userId, email: 'admin@example.com' } }, createDto)).resolves.toBe(response);
    await expect(controller.updateUser({ user: { email: 'admin@example.com' } }, userId, { firstName: 'Ada' })).resolves.toBe(response);
    await expect(controller.updateBackofficeUser({ user: { id: userId, email: 'admin@example.com' } }, userId, { backofficeRole: 'OPERARIO' })).resolves.toBe(response);
    await expect(controller.updateUserStatus(userId, { active: false })).resolves.toBe(response);
    await expect(controller.deleteDemoUser(userId)).resolves.toBe(deletionResponse);

    expect(service.listUsersExtended).toHaveBeenCalledWith(query);
    expect(service.findUserById).toHaveBeenCalledWith(userId);
    expect(service.createUser).toHaveBeenCalledWith({ email: 'admin@example.com' }, createDto);
    expect(service.createBackofficeUser).toHaveBeenCalledWith({ id: userId, email: 'admin@example.com' }, createDto);
    expect(service.updateUser).toHaveBeenCalledWith({ email: 'admin@example.com' }, userId, { firstName: 'Ada' });
    expect(service.updateBackofficeUser).toHaveBeenCalledWith({ id: userId, email: 'admin@example.com' }, userId, { backofficeRole: 'OPERARIO' });
    expect(service.updateUserStatus).toHaveBeenCalledWith(userId, { active: false });
    expect(service.deleteDemoUser).toHaveBeenCalledWith(userId);
  });

  it('delegates controller account demo endpoint to administration service', async () => {
    const accountId = '22222222-2222-4222-8222-222222222222';
    const response = {
      id: accountId,
      code: '00000001',
      isActive: true,
      isDeleted: false,
      isDemo: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    const service = {
      updateAccountDemo: jest.fn().mockResolvedValue(response),
    };
    const controller = new AdministrationController(service as any);

    await expect(controller.updateAccountDemo(accountId, { isDemo: false })).resolves.toBe(response);
    expect(service.updateAccountDemo).toHaveBeenCalledWith(accountId, { isDemo: false });
  });

  it('validates extended user list query DTO', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    await expect(pipe.transform(
      {
        page: '1',
        amount: '10',
        search: 'ada',
        companyId: '11111111-1111-4111-8111-111111111111',
        isAdmin: 'true',
        isDemo: 'false',
        type: 'USUARIO',
      },
      { type: 'query', metatype: ListUsersExtendedQueryDto },
    )).resolves.toMatchObject({
      page: 1,
      amount: 10,
      isAdmin: true,
      isDemo: false,
      type: 'USUARIO',
    });

    await expect(pipe.transform(
      { type: 'ROOT' },
      { type: 'query', metatype: ListUsersExtendedQueryDto },
    )).rejects.toBeInstanceOf(BadRequestException);
  });

  it('validates user create and status DTOs strictly', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    await expect(pipe.transform(
      {
        email: 'ada@example.com',
        password: 'TemporalPassword123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        municipalityId: '22222222-2222-4222-8222-222222222222',
        birthDate: '1990-05-21',
      },
      { type: 'body', metatype: CreateCoreUserDto },
    )).resolves.toMatchObject({
      email: 'ada@example.com',
    });

    await expect(pipe.transform(
      {
        email: 'ada@optimunsoft.co',
        password: 'TemporalPassword123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        municipalityId: '22222222-2222-4222-8222-222222222222',
        birthDate: '1990-05-21',
        backofficeRole: 'ADMINISTRADOR',
      },
      { type: 'body', metatype: CreateCoreBackofficeUserRequestDto },
    )).resolves.toMatchObject({
      email: 'ada@optimunsoft.co',
      backofficeRole: 'ADMINISTRADOR',
    });

    await expect(pipe.transform(
      {
        email: 'ada@optimunsoft.co',
        password: 'TemporalPassword123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        municipalityId: '22222222-2222-4222-8222-222222222222',
        birthDate: '1990-05-21',
        backofficeRole: 'ADMINISTRADOR',
        isVerified: false,
      },
      { type: 'body', metatype: CreateCoreBackofficeUserRequestDto },
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(pipe.transform(
      {
        email: 'ada@optimunsoft.co',
        password: 'TemporalPassword123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        municipalityId: '22222222-2222-4222-8222-222222222222',
        birthDate: '1990-05-21',
        backofficeRole: 'ADMINISTRADOR',
        userType: 'USUARIO',
      },
      { type: 'body', metatype: CreateCoreBackofficeUserRequestDto },
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(pipe.transform(
      {
        email: 'ada@optimunsoft.co',
        password: 'TemporalPassword123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        municipalityId: '22222222-2222-4222-8222-222222222222',
        birthDate: '1990-05-21',
        backofficeRole: 'ADMINISTRADOR',
        isDemo: true,
      },
      { type: 'body', metatype: CreateCoreBackofficeUserRequestDto },
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(pipe.transform(
      {
        email: 'ada@optimunsoft.co',
        backofficeRole: 'OPERARIO',
      },
      { type: 'body', metatype: UpdateCoreBackofficeUserRequestDto },
    )).resolves.toMatchObject({
      email: 'ada@optimunsoft.co',
      backofficeRole: 'OPERARIO',
    });

    await expect(pipe.transform(
      {
        email: 'ada@optimunsoft.co',
        backofficeRole: 'OPERARIO',
        isVerified: false,
      },
      { type: 'body', metatype: UpdateCoreBackofficeUserRequestDto },
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(pipe.transform(
      {
        email: 'ada@optimunsoft.co',
        backofficeRole: 'OPERARIO',
        userType: 'USUARIO',
      },
      { type: 'body', metatype: UpdateCoreBackofficeUserRequestDto },
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(pipe.transform(
      {
        email: 'ada@optimunsoft.co',
        password: 'TemporalPassword123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        municipalityId: '22222222-2222-4222-8222-222222222222',
        birthDate: '1990-05-21',
        backofficeRole: 'ROOT',
      },
      { type: 'body', metatype: CreateCoreBackofficeUserRequestDto },
    )).rejects.toBeInstanceOf(BadRequestException);

    await expect(pipe.transform(
      { active: false },
      { type: 'body', metatype: UpdateCoreUserStatusDto },
    )).resolves.toMatchObject({ active: false });

    await expect(pipe.transform(
      { active: 'false' },
      { type: 'body', metatype: UpdateCoreUserStatusDto },
    )).rejects.toBeInstanceOf(BadRequestException);
  });

  it('validates account demo update DTO strictly', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    await expect(pipe.transform(
      { isDemo: true },
      { type: 'body', metatype: UpdateCoreAccountDemoDto },
    )).resolves.toMatchObject({ isDemo: true });

    await expect(pipe.transform(
      { isDemo: 'false' },
      { type: 'body', metatype: UpdateCoreAccountDemoDto },
    )).rejects.toBeInstanceOf(BadRequestException);
  });
});
