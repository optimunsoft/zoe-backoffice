import {
    AssignCoreCompanyModuleDto,
    AssignCoreCompanyUserDto,
    CreateCoreCompanyDto,
    CoreCatalog,
    CoreCatalogMatchDto,
    CoreCompanyExtendedListItemDto,
    CoreCompanyListItemDto,
    CoreCompanyDto,
    CoreCompanyLogoDto,
    CoreCompanyModuleAssignmentDto,
    CoreCompanyRoleDetailDto,
    CoreCompanySummaryDto,
    CoreCompanyUserAssignmentDto,
    CoreModuleDeleteDto,
    CoreModuleDto,
    CoreResolvedCatalogDto,
    CoreThirdPartyDto,
    CoreThirdPartyPageDto,
    CoreThirdPartyUpsertResultDto,
    CoreUserAccountDto,
    CoreUserExtendedListItemDto,
    CoreUserDto,
    CoreUserListItemDto,
    CoreUserPageDto,
    CreateCoreModuleDto,
    CreateCoreUserDto,
    UpdateCoreUserDto,
    UpdateCoreUserStatusDto,
    SearchCoreThirdPartiesDto,
    SearchCoreUsersDto,
    SearchCoreCompaniesDto,
    SearchCoreModulesDto,
    SearchCoreUserExtendedListDto,
    SearchCoreUserListDto,
    MatchCoreCatalogItemDto,
    UnassignCoreCompanyUserDto,
    UpsertCoreThirdPartyDto,
    UpdateCoreAccountDemoDto,
    UpdateCoreCompanyDto,
    UpdateCoreModuleDto,
    UpdateCoreCompanyStatusDto,
} from '../dto/backoffice-core.dto';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';

export const BACKOFFICE_CORE_INTEGRATION = Symbol('BACKOFFICE_CORE_INTEGRATION');

export interface IBackofficeCoreIntegration {
    companyExists(companyId: string, sessionKey: string): Promise<boolean>;
    findCompanyById(companyId: string): Promise<CoreCompanyDto | null>;
    getCompanyLogo(companyId: string, returnBase64?: boolean): Promise<CoreCompanyLogoDto>;
    createCompany(data: CreateCoreCompanyDto): Promise<CoreCompanySummaryDto>;
    updateCompany(companyId: string, data: UpdateCoreCompanyDto): Promise<CoreCompanySummaryDto>;
    updateCompanyStatus(companyId: string, data: UpdateCoreCompanyStatusDto): Promise<CoreCompanySummaryDto>;
    assignCompanyUser(data: AssignCoreCompanyUserDto): Promise<CoreCompanyUserAssignmentDto>;
    unassignCompanyUser(data: UnassignCoreCompanyUserDto): Promise<CoreCompanyUserAssignmentDto>;
    assignCompanyModule(moduleId: string, data: AssignCoreCompanyModuleDto): Promise<CoreCompanyModuleAssignmentDto>;
    searchModules(params: SearchCoreModulesDto): Promise<PaginatedResult<CoreModuleDto>>;
    findModuleById(moduleId: string): Promise<CoreModuleDto | null>;
    createModule(data: CreateCoreModuleDto): Promise<CoreModuleDto>;
    updateModule(moduleId: string, data: UpdateCoreModuleDto): Promise<CoreModuleDto>;
    deleteModule(moduleId: string): Promise<CoreModuleDeleteDto>;
    searchCompanies(params: SearchCoreCompaniesDto): Promise<PaginatedResult<CoreCompanyListItemDto>>;
    searchCompaniesExtended(params: SearchCoreCompaniesDto): Promise<PaginatedResult<CoreCompanyExtendedListItemDto>>;
    findCompanyRole(companyId: string, roleId: string): Promise<CoreCompanyRoleDetailDto>;
    searchUserList(params: SearchCoreUserListDto): Promise<PaginatedResult<CoreUserListItemDto>>;
    searchUserListExtended(params: SearchCoreUserExtendedListDto): Promise<PaginatedResult<CoreUserExtendedListItemDto>>;
    findUserById(userId: string): Promise<CoreUserExtendedListItemDto | null>;
    createUser(data: CreateCoreUserDto): Promise<CoreUserExtendedListItemDto>;
    updateUser(userId: string, data: UpdateCoreUserDto): Promise<CoreUserExtendedListItemDto>;
    updateUserStatus(userId: string, data: UpdateCoreUserStatusDto): Promise<CoreUserExtendedListItemDto>;
    updateAccountDemo(accountId: string, data: UpdateCoreAccountDemoDto): Promise<CoreUserAccountDto>;
    findCompanyOwner(companyId: string): Promise<CoreUserDto | null>;
    resolveUsers(ids: string[]): Promise<CoreUserDto[]>;
    searchUsers(params: SearchCoreUsersDto): Promise<CoreUserPageDto>;
    findThirdPartyById(thirdPartyId: string): Promise<CoreThirdPartyDto | null>;
    resolveThirdParties(companyId: string, ids: string[]): Promise<CoreThirdPartyDto[]>;
    resolveThirdPartiesByDocument(
        companyId: string,
        documentNumbers: string[],
    ): Promise<CoreThirdPartyDto[]>;
    searchThirdParties(
        params: SearchCoreThirdPartiesDto,
    ): Promise<CoreThirdPartyPageDto>;
    upsertThirdParty(
        params: UpsertCoreThirdPartyDto,
    ): Promise<CoreThirdPartyUpsertResultDto>;
    resolveCatalogs(
        requests: Array<{ catalog: CoreCatalog; ids: string[] }>,
    ): Promise<CoreResolvedCatalogDto[]>;
    matchCatalogs(requests: MatchCoreCatalogItemDto[]): Promise<CoreCatalogMatchDto[]>;
}


