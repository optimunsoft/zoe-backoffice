import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { envs } from 'src/config/env.config';
import {
    AssignCoreCompanyUserDto,
    AssignCoreCompanyModuleDto,
    CreateCoreCompanyDto,
    CoreCatalog,
    CoreCatalogMatchDto,
    CoreCompanyExtendedListItemDto,
    CoreCompanyLogoDto,
    CoreCompanyLogoUploadDto,
    CoreCompanyModuleAssignmentDto,
    CoreCompanyRoleDetailDto,
    CoreCompanySummaryDto,
    CoreCompanyUserAssignmentDto,
    CoreModuleDeleteDto,
    CoreModuleDto,
    CoreUserAccountDto,
    CoreUserExtendedListItemDto,
    CoreUserListItemDto,
    CreateCoreUserDto,
    CreateCoreModuleDto,
    MatchCoreCatalogItemDto,
    SearchCoreCompaniesDto,
    SearchCoreModulesDto,
    SearchCoreUserExtendedListDto,
    SearchCoreUserListDto,
    UnassignCoreCompanyUserDto,
    UpdateCoreAccountDemoDto,
    UpdateCoreCompanyDto,
    UpdateCoreModuleDto,
    UpdateCoreCompanyStatusDto,
    UpdateCoreUserDto,
    UpdateCoreUserStatusDto,
} from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';
import { BACKOFFICE_CORE_INTEGRATION, IBackofficeCoreIntegration } from 'src/infrastructure/integrations/core/interfaces/backoffice-core.interface';
import { DOCUMENT_EXTRACTION_INTEGRATION, IDocumentExtractionIntegration } from 'src/infrastructure/integrations/openai/interfaces/document-extraction.interface';
import { AuthorizationRepository } from 'src/infrastructure/security/authorization.repository';
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
        private readonly authorizationRepository: AuthorizationRepository,
    ) { }

    async listCompanies(
        query: SearchCoreCompaniesDto,
    ): Promise<PaginatedResult<CoreCompanyExtendedListItemDto>> {
        return this.coreIntegration.searchCompaniesExtended(query);
    }

    async createCompany(dto: CreateCoreCompanyDto): Promise<CoreCompanySummaryDto> {
        return this.coreIntegration.createCompany(dto);
    }

    async updateCompany(companyId: string, dto: UpdateCoreCompanyDto): Promise<CoreCompanySummaryDto> {
        return this.coreIntegration.updateCompany(companyId, dto);
    }

    async updateCompanyStatus(companyId: string, dto: UpdateCoreCompanyStatusDto): Promise<CoreCompanySummaryDto> {
        return this.coreIntegration.updateCompanyStatus(companyId, dto);
    }

    async getCompanyLogo(companyId: string, returnBase64 = false): Promise<CoreCompanyLogoDto> {
        return this.coreIntegration.getCompanyLogo(companyId, returnBase64);
    }

    async uploadCompanyLogo(companyId: string, file: UploadedFile): Promise<CoreCompanyLogoUploadDto> {
        return this.coreIntegration.uploadCompanyLogo(companyId, file);
    }

    async assignCompanyUser(dto: AssignCoreCompanyUserDto): Promise<CoreCompanyUserAssignmentDto> {
        await this.ensureAssignableCompanyUser(dto.userId);
        return this.coreIntegration.assignCompanyUser(dto);
    }

    async unassignCompanyUser(dto: UnassignCoreCompanyUserDto): Promise<CoreCompanyUserAssignmentDto> {
        await this.ensureAssignableCompanyUser(dto.userId);
        return this.coreIntegration.unassignCompanyUser(dto);
    }

    async assignCompanyModule(
        moduleId: string,
        dto: AssignCoreCompanyModuleDto,
    ): Promise<CoreCompanyModuleAssignmentDto> {
        return this.coreIntegration.assignCompanyModule(moduleId, dto);
    }

    async listModules(query: SearchCoreModulesDto): Promise<PaginatedResult<CoreModuleDto>> {
        return this.coreIntegration.searchModules(query);
    }

    async findModuleById(moduleId: string): Promise<CoreModuleDto | null> {
        return this.coreIntegration.findModuleById(moduleId);
    }

    async createModule(dto: CreateCoreModuleDto): Promise<CoreModuleDto> {
        return this.coreIntegration.createModule(dto);
    }

    async updateModule(moduleId: string, dto: UpdateCoreModuleDto): Promise<CoreModuleDto> {
        return this.coreIntegration.updateModule(moduleId, dto);
    }

    async deleteModule(moduleId: string): Promise<CoreModuleDeleteDto> {
        return this.coreIntegration.deleteModule(moduleId);
    }

    async findCompanyRole(companyId: string, roleId: string): Promise<CoreCompanyRoleDetailDto> {
        return this.coreIntegration.findCompanyRole(companyId, roleId);
    }

    async listUsers(
        query: SearchCoreUserListDto,
    ): Promise<PaginatedResult<CoreUserListItemDto>> {
        return this.coreIntegration.searchUserList(query);
    }

    async listUsersExtended(
        query: SearchCoreUserExtendedListDto,
    ): Promise<PaginatedResult<CoreUserExtendedListItemDto>> {
        return this.coreIntegration.searchUserListExtended(query);
    }

    async findUserById(userId: string): Promise<CoreUserExtendedListItemDto | null> {
        return this.coreIntegration.findUserById(userId);
    }

    async createUser(actor: { email?: string } | undefined, dto: CreateCoreUserDto): Promise<CoreUserExtendedListItemDto> {
        this.validateBackofficeAdministratorPayload(dto);
        await this.ensureCanAssignBackofficeAdministrator(actor, dto.backofficeRole);
        return this.coreIntegration.createUser(dto);
    }

    async updateUser(actor: { email?: string } | undefined, userId: string, dto: UpdateCoreUserDto): Promise<CoreUserExtendedListItemDto> {
        const currentUser = await this.findUserForBackofficeValidation(userId, dto);
        this.validateBackofficeAdministratorPayload(dto, currentUser);
        await this.ensureCanAssignBackofficeAdministrator(actor, dto.backofficeRole);
        return this.coreIntegration.updateUser(userId, dto);
    }

    async updateUserStatus(userId: string, dto: UpdateCoreUserStatusDto): Promise<CoreUserExtendedListItemDto> {
        return this.coreIntegration.updateUserStatus(userId, dto);
    }

    async updateAccountDemo(accountId: string, dto: UpdateCoreAccountDemoDto): Promise<CoreUserAccountDto> {
        return this.coreIntegration.updateAccountDemo(accountId, dto);
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

    private async ensureCanAssignBackofficeAdministrator(
        actor: { email?: string } | undefined,
        requestedRole?: 'ADMINISTRADOR' | 'OPERARIO',
    ): Promise<void> {
        if (requestedRole !== 'ADMINISTRADOR') return;

        if (!actor?.email) {
            throw new ForbiddenException('Usuario no autenticado.');
        }

        const isBackofficeAdministrator = await this.authorizationRepository
            .isBackofficeAdministratorEmail(actor.email);

        if (!isBackofficeAdministrator) {
            throw new ForbiddenException('No tienes permisos para esta accion.');
        }
    }

    private async findUserForBackofficeValidation(
        userId: string,
        dto: UpdateCoreUserDto,
    ): Promise<CoreUserExtendedListItemDto | null> {
        const mustResolveCurrentUser = dto.isAdmin !== undefined
            || dto.backofficeRole !== undefined
            || dto.email !== undefined;

        return mustResolveCurrentUser ? this.coreIntegration.findUserById(userId) : null;
    }

    private validateBackofficeAdministratorPayload(
        dto: CreateCoreUserDto | UpdateCoreUserDto,
        currentUser?: CoreUserExtendedListItemDto | null,
    ): void {
        const nextIsAdmin = dto.isAdmin ?? currentUser?.isAdmin ?? false;
        if (!nextIsAdmin) return;

        const nextBackofficeRole = dto.backofficeRole ?? currentUser?.backofficeRole;
        if (!nextBackofficeRole) {
            throw new BadRequestException('Los usuarios administradores deben tener un rol de backoffice.');
        }

        const nextEmail = dto.email ?? currentUser?.email;
        if (!nextEmail || !this.isOptimunsoftEmail(nextEmail)) {
            throw new BadRequestException('Los usuarios administradores deben usar un correo @optimunsoft.co.');
        }
    }

    private isOptimunsoftEmail(email: string): boolean {
        return email.trim().toLowerCase().endsWith('@optimunsoft.co');
    }

    private async ensureAssignableCompanyUser(userId: string): Promise<void> {
        const user = await this.coreIntegration.findUserById(userId);
        if (!user) {
            throw new BadRequestException('El usuario no existe en CORE.');
        }

        if (user.userType !== 'USUARIO') {
            throw new BadRequestException('Solo se pueden asociar o desasociar usuarios tipo USUARIO a empresas.');
        }
    }

}
