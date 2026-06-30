import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { envs } from 'src/config/env.config';
import { RutExtractionRawDto } from 'src/domains/backoffice/administration/dto/rut-extraction-result.dto';
import { UploadedFile } from 'src/shared/interfaces/uploaded-file.interface';
import { IDocumentExtractionIntegration } from '../interfaces/document-extraction.interface';

@Injectable()
export class OpenAiDocumentExtractionService implements IDocumentExtractionIntegration {
    private readonly logger = new Logger(OpenAiDocumentExtractionService.name);
    private readonly client = new OpenAI({ apiKey: envs.openai_api_key });

    async extractRutPrefillFromPdf(file: UploadedFile): Promise<RutExtractionRawDto> {
        return this.extractRutFromPdf(file, 'prefill');
    }

    async extractRutFullFromPdf(file: UploadedFile): Promise<RutExtractionRawDto> {
        return this.extractRutFromPdf(file, 'full');
    }

    private async extractRutFromPdf(file: UploadedFile, mode: 'prefill' | 'full'): Promise<RutExtractionRawDto> {
        try {
            const response = await this.client.responses.create({
                model: envs.openai_model,
                input: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'input_text',
                                text: this.buildRutPrompt(mode),
                            },
                            {
                                type: 'input_file',
                                filename: file.originalname || 'rut.pdf',
                                file_data: `data:application/pdf;base64,${file.buffer.toString('base64')}`,
                            },
                        ],
                    },
                ],
                text: {
                    format: {
                        type: 'json_schema',
                        name: 'rut_extraction',
                        strict: true,
                        schema: this.rutExtractionSchema(mode),
                    },
                },
            } as any);

            const text = (response as any).output_text;
            if (!text) {
                throw new Error('OpenAI response did not include output_text.');
            }

            return JSON.parse(text) as RutExtractionRawDto;
        } catch (error: any) {
            this.logger.error(error?.message || error);
            throw new BadGatewayException('No fue posible extraer la informacion del RUT.');
        }
    }

    private buildRutPrompt(mode: 'prefill' | 'full'): string {
        const prompt = [
            'Extrae informacion de un PDF de RUT colombiano.',
            'Devuelve solo JSON valido segun el esquema.',
            'No inventes datos: usa null para campos no visibles y agrega advertencias en metadata.warnings.',
            'Normaliza NIT sin digito de verificacion en documentNumber cuando sea posible.',
            'Usa verificationDigit para el DV si aparece.',
            'Si la naturaleza empresarial es persona natural, el businessName es la concatenación de los nombres y apellidos en mayúscula',
            'Clasifica personType como juridica, natural o null.',
        ];

        if (mode === 'prefill') {
            prompt.push(
                'Prioriza solo datos necesarios para precargar el formulario de creacion de empresa.',
                'No extraigas representantes ni actividades economicas; devuelve esos arreglos vacios.',
                'Incluye maximo una responsabilidad tributaria visible si aparece.',
            );
        }

        prompt.push('Incluye actividades economicas, responsabilidades tributarias y representantes si aparecen.');
        return prompt.join(' ');
    }

    private rutExtractionSchema(mode: 'prefill' | 'full'): Record<string, unknown> {
        const nullableString = { type: ['string', 'null'] };
        const fullMode = mode === 'full';

        return {
            type: 'object',
            additionalProperties: false,
            required: [
                'documentType',
                'documentNumber',
                'verificationDigit',
                'personType',
                'businessName',
                'tradeName',
                'firstName',
                'middleName',
                'lastName',
                'secondLastName',
                'email',
                'phone',
                'address',
                'country',
                'department',
                'municipality',
                'documentStatus',
                'documentDate',
                'economicActivities',
                'taxResponsibilities',
                'representatives',
                'metadata',
            ],
            properties: {
                documentType: nullableString,
                documentNumber: nullableString,
                verificationDigit: nullableString,
                personType: nullableString,
                businessName: nullableString,
                tradeName: nullableString,
                firstName: nullableString,
                middleName: nullableString,
                lastName: nullableString,
                secondLastName: nullableString,
                email: nullableString,
                phone: nullableString,
                address: nullableString,
                country: nullableString,
                department: nullableString,
                municipality: nullableString,
                documentStatus: nullableString,
                documentDate: nullableString,
                economicActivities: {
                    type: 'array',
                    ...(fullMode ? {} : { maxItems: 0 }),
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['code', 'name', 'type', 'startDate'],
                        properties: {
                            code: nullableString,
                            name: nullableString,
                            type: nullableString,
                            startDate: nullableString,
                        },
                    },
                },
                taxResponsibilities: {
                    type: 'array',
                    ...(fullMode ? {} : { maxItems: 1 }),
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['code', 'name'],
                        properties: {
                            code: nullableString,
                            name: nullableString,
                        },
                    },
                },
                representatives: {
                    type: 'array',
                    ...(fullMode ? {} : { maxItems: 0 }),
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['documentType', 'documentNumber', 'name', 'role'],
                        properties: {
                            documentType: nullableString,
                            documentNumber: nullableString,
                            name: nullableString,
                            role: nullableString,
                        },
                    },
                },
                metadata: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['confidence', 'missingFields', 'warnings', 'pagesProcessed'],
                    properties: {
                        confidence: { type: 'number', minimum: 0, maximum: 1 },
                        missingFields: { type: 'array', items: { type: 'string' } },
                        warnings: { type: 'array', items: { type: 'string' } },
                        pagesProcessed: { type: ['integer', 'null'], minimum: 0 },
                    },
                },
            },
        };
    }
}
