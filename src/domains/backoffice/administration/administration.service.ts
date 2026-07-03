import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { envs } from 'src/config/env.config';
import {
    CreateCoreCompanyDto,
    CoreCatalog,
    CoreCatalogMatchDto,
    CoreCompanyExtendedListItemDto,
    CoreCompanyRoleDetailDto,
    CoreCompanySummaryDto,
    CoreUserListItemDto,
    MatchCoreCatalogItemDto,
    SearchCoreCompaniesDto,
    SearchCoreUserListDto,
} from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';
import { BACKOFFICE_CORE_INTEGRATION, IBackofficeCoreIntegration } from 'src/infrastructure/integrations/core/interfaces/backoffice-core.interface';
import { DOCUMENT_EXTRACTION_INTEGRATION, IDocumentExtractionIntegration } from 'src/infrastructure/integrations/openai/interfaces/document-extraction.interface';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';
import { UploadedFile } from 'src/shared/interfaces/uploaded-file.interface';
import { CompanyPrefillResultDto, RutExtractionRawDto, RutExtractionResultDto } from './dto/rut-extraction-result.dto';

@Injectable()
export class AdministrationService {
    constructor(
        @Inject(BACKOFFICE_CORE_INTEGRATION)
        private readonly coreIntegration: IBackofficeCoreIntegration,
        @Inject(DOCUMENT_EXTRACTION_INTEGRATION)
        private readonly documentExtraction: IDocumentExtractionIntegration,
    ) { }

    async listCompanies(
        query: SearchCoreCompaniesDto,
    ): Promise<PaginatedResult<CoreCompanyExtendedListItemDto>> {
        return this.coreIntegration.searchCompaniesExtended(query);
    }

    async createCompany(dto: CreateCoreCompanyDto): Promise<CoreCompanySummaryDto> {
        return this.coreIntegration.createCompany(dto);
    }

    async findCompanyRole(companyId: string, roleId: string): Promise<CoreCompanyRoleDetailDto> {
        return this.coreIntegration.findCompanyRole(companyId, roleId);
    }

    async listUsers(
        query: SearchCoreUserListDto,
    ): Promise<PaginatedResult<CoreUserListItemDto>> {
        return this.coreIntegration.searchUserList(query);
    }

    async extractCompanyRut(file?: UploadedFile): Promise<RutExtractionResultDto> {
        return this.extractCompanyRutPrefill(file);
    }

    async extractCompanyRutPrefill(file?: UploadedFile): Promise<RutExtractionResultDto> {
        return this.extractCompanyRutWithMode(file, 'prefill');
    }

    async extractCompanyRutFull(file?: UploadedFile): Promise<RutExtractionResultDto> {
        return this.extractCompanyRutWithMode(file, 'full');
    }

    private async extractCompanyRutWithMode(
        file: UploadedFile | undefined,
        mode: 'prefill' | 'full',
    ): Promise<RutExtractionResultDto> {
        this.validateRutPdf(file);

        const extracted = mode === 'full'
            ? await this.documentExtraction.extractRutFullFromPdf(file!)
            : await this.documentExtraction.extractRutPrefillFromPdf(file!);

        const matches = await this.coreIntegration.matchCatalogs(this.buildCatalogMatchRequests(extracted));

        return this.buildCompanyPrefill(extracted, matches);
    }

    private validateRutPdf(file?: UploadedFile): void {
        if (!file) {
            throw new BadRequestException('Debes adjuntar el PDF del RUT.');
        }

        const maxBytes = envs.rut_pdf_max_mb * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new BadRequestException(`El PDF no puede superar ${envs.rut_pdf_max_mb}MB.`);
        }

        const hasPdfMime = file.mimetype === 'application/pdf';
        const hasPdfExtension = file.originalname?.toLowerCase().endsWith('.pdf');
        const hasPdfSignature = file.buffer?.subarray(0, 4).toString('utf8') === '%PDF';

        if (!hasPdfMime || !hasPdfExtension || !hasPdfSignature) {
            throw new BadRequestException('El archivo debe ser un PDF valido.');
        }
    }

    private buildCatalogMatchRequests(extracted: RutExtractionRawDto): MatchCoreCatalogItemDto[] {
        const requests: MatchCoreCatalogItemDto[] = [];

        if (extracted.documentType) {
            requests.push({
                catalog: CoreCatalog.DOCUMENT_TYPE,
                code: extracted.documentType,
                name: extracted.documentType,
            });
        }

        if (extracted.personType) {
            requests.push({
                catalog: CoreCatalog.BUSINESS_NATURE,
                name: extracted.personType,
            });
        }

        const firstTaxResponsibility = extracted.taxResponsibilities?.[0];
        if (firstTaxResponsibility?.code || firstTaxResponsibility?.name) {
            requests.push({
                catalog: CoreCatalog.TAX_RESPONSIBILITY,
                code: firstTaxResponsibility.code ?? undefined,
                name: firstTaxResponsibility.name ?? undefined,
            });
        }

        if (extracted.municipality) {
            requests.push({
                catalog: CoreCatalog.MUNICIPALITY,
                name: extracted.municipality,
                state: extracted.department ?? undefined,
                country: extracted.country ?? undefined,
            });
        }

        return requests;
    }

    private buildCompanyPrefill(
        extracted: RutExtractionRawDto,
        matches: CoreCatalogMatchDto[],
    ): CompanyPrefillResultDto {
        const byCatalog = new Map(matches.filter(match => match.id).map(match => [match.catalog, match]));
        const unresolved = matches.filter(match => !match.id);

        return {
            prefill: {
                documentTypeId: byCatalog.get(CoreCatalog.DOCUMENT_TYPE)?.id,
                businessNatureId: byCatalog.get(CoreCatalog.BUSINESS_NATURE)?.id,
                taxResponsibilityId: byCatalog.get(CoreCatalog.TAX_RESPONSIBILITY)?.id,
                municipalityId: byCatalog.get(CoreCatalog.MUNICIPALITY)?.id,
                documentNumber: extracted.documentNumber,
                businessName: extracted.businessName,
                tradeName: extracted.tradeName,
                firstName: extracted.firstName,
                middleName: extracted.middleName,
                lastName: extracted.lastName,
                secondLastName: extracted.secondLastName,
                email: extracted.email,
                address: extracted.address,
            },
            extracted,
            resolution: {
                matches,
                unresolved,
                warnings: [
                    ...(extracted.metadata?.warnings ?? []),
                    ...unresolved.map(match => `${match.catalog}: ${match.unresolvedReason}`),
                ],
            },
        };
    }

}
