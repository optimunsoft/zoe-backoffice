jest.mock('src/config/env.config', () => ({
  envs: {
    rut_pdf_max_mb: 1,
  },
}));

import { BadRequestException } from '@nestjs/common';
import { AdministrationController } from '../administration.controller';
import { AdministrationService } from '../administration.service';

describe('Administration RUT extraction', () => {
  const validFile = {
    originalname: 'rut.pdf',
    mimetype: 'application/pdf',
    size: 100,
    buffer: Buffer.from('%PDF-1.7 test'),
  };

  it('delegates valid RUT PDFs to the document extraction integration', async () => {
    const raw = {
      documentType: 'NIT',
      documentNumber: '900123456',
      personType: 'juridica',
      businessName: 'ACME SAS',
      municipality: 'Medellin',
      department: 'Antioquia',
      country: 'Colombia',
      economicActivities: [],
      taxResponsibilities: [],
      representatives: [],
      metadata: { confidence: 1, missingFields: [], warnings: [] },
    };
    const documentExtraction = {
      extractRutPrefillFromPdf: jest.fn().mockResolvedValue(raw),
      extractRutFullFromPdf: jest.fn(),
    };
    const coreIntegration = {
      matchCatalogs: jest.fn().mockResolvedValue([{
        catalog: 'documentType',
        input: {},
        id: '11111111-1111-4111-8111-111111111111',
        code: '31',
        name: 'NIT',
        matchedBy: 'name',
        confidence: 1,
      }]),
    };
    const service = new AdministrationService(coreIntegration as any, documentExtraction as any, {} as any);

    await expect(service.extractCompanyRut(validFile)).resolves.toMatchObject({
      prefill: {
        documentTypeId: '11111111-1111-4111-8111-111111111111',
        documentNumber: '900123456',
        businessName: 'ACME SAS',
      },
      extracted: raw,
    });
    expect(documentExtraction.extractRutPrefillFromPdf).toHaveBeenCalledWith(validFile);
    expect(coreIntegration.matchCatalogs).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ catalog: 'documentType' }),
      expect.objectContaining({ catalog: 'businessNature' }),
      expect.objectContaining({ catalog: 'municipality' }),
    ]));
  });

  it('rejects missing files', async () => {
    const documentExtraction = { extractRutPrefillFromPdf: jest.fn(), extractRutFullFromPdf: jest.fn() };
    const service = new AdministrationService({} as any, documentExtraction as any, {} as any);

    await expect(service.extractCompanyRut()).rejects.toBeInstanceOf(BadRequestException);
    expect(documentExtraction.extractRutPrefillFromPdf).not.toHaveBeenCalled();
  });

  it('rejects files without a PDF signature', async () => {
    const documentExtraction = { extractRutPrefillFromPdf: jest.fn(), extractRutFullFromPdf: jest.fn() };
    const service = new AdministrationService({} as any, documentExtraction as any, {} as any);

    await expect(service.extractCompanyRut({
      ...validFile,
      buffer: Buffer.from('not a pdf'),
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(documentExtraction.extractRutPrefillFromPdf).not.toHaveBeenCalled();
  });

  it('rejects files larger than the configured limit', async () => {
    const documentExtraction = { extractRutPrefillFromPdf: jest.fn(), extractRutFullFromPdf: jest.fn() };
    const service = new AdministrationService({} as any, documentExtraction as any, {} as any);

    await expect(service.extractCompanyRut({
      ...validFile,
      size: 2 * 1024 * 1024,
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(documentExtraction.extractRutPrefillFromPdf).not.toHaveBeenCalled();
  });

  it('delegates controller uploads to the administration service', async () => {
    const result = {
      prefill: {},
      extracted: {
        economicActivities: [],
        taxResponsibilities: [],
        representatives: [],
        metadata: { confidence: 1, missingFields: [], warnings: [] },
      },
      resolution: { matches: [], unresolved: [], warnings: [] },
    };
    const service = {
      extractCompanyRut: jest.fn().mockResolvedValue(result),
      extractCompanyRutPrefill: jest.fn().mockResolvedValue(result),
      extractCompanyRutFull: jest.fn().mockResolvedValue(result),
    };
    const controller = new AdministrationController(service as any);

    await expect(controller.extractCompanyRut(validFile)).resolves.toBe(result);
    expect(service.extractCompanyRut).toHaveBeenCalledWith(validFile);
    await expect(controller.extractCompanyRutPrefill(validFile)).resolves.toBe(result);
    expect(service.extractCompanyRutPrefill).toHaveBeenCalledWith(validFile);
    await expect(controller.extractCompanyRutFull(validFile)).resolves.toBe(result);
    expect(service.extractCompanyRutFull).toHaveBeenCalledWith(validFile);
  });
});
