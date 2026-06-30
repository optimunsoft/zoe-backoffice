jest.mock('src/config/env.config', () => ({
  envs: {
    openai_api_key: 'test-key',
    openai_model: 'gpt-test',
  },
}));

const mockResponsesCreate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    responses: {
      create: mockResponsesCreate,
    },
  }));
});

import { BadGatewayException } from '@nestjs/common';
import { OpenAiDocumentExtractionService } from '../openai-document-extraction.service';

describe('OpenAiDocumentExtractionService', () => {
  const file = {
    originalname: 'rut.pdf',
    mimetype: 'application/pdf',
    size: 100,
    buffer: Buffer.from('%PDF-1.7 test'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends the PDF as base64 input_file and parses the structured JSON response', async () => {
    const result = {
      documentType: 'NIT',
      documentNumber: '900123456',
      verificationDigit: '7',
      personType: 'juridica',
      businessName: 'ACME SAS',
      tradeName: null,
      firstName: null,
      middleName: null,
      lastName: null,
      secondLastName: null,
      email: null,
      phone: null,
      address: null,
      country: 'Colombia',
      department: null,
      municipality: null,
      documentStatus: null,
      documentDate: null,
      economicActivities: [],
      taxResponsibilities: [],
      representatives: [],
      metadata: {
        confidence: 0.9,
        missingFields: [],
        warnings: [],
        pagesProcessed: 1,
      },
    };
    mockResponsesCreate.mockResolvedValue({ output_text: JSON.stringify(result) });
    const service = new OpenAiDocumentExtractionService();

    await expect(service.extractRutPrefillFromPdf(file)).resolves.toEqual(result);

    expect(mockResponsesCreate).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gpt-test',
      text: expect.objectContaining({
        format: expect.objectContaining({
          type: 'json_schema',
          strict: true,
        }),
      }),
    }));

    const request = mockResponsesCreate.mock.calls[0][0];
    expect(request.input[0].content[1]).toEqual(expect.objectContaining({
      type: 'input_file',
      filename: 'rut.pdf',
      file_data: expect.stringContaining('data:application/pdf;base64,'),
    }));
  });

  it('translates OpenAI failures to BadGatewayException', async () => {
    mockResponsesCreate.mockRejectedValue(new Error('OpenAI failed'));
    const service = new OpenAiDocumentExtractionService();

    await expect(service.extractRutPrefillFromPdf(file)).rejects.toBeInstanceOf(BadGatewayException);
  });
});
