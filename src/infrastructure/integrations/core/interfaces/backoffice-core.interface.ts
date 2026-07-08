import {
    AssignCoreCompanyUserDto,
    CreateCoreCompanyDto,
    CoreCatalog,
    CoreCatalogMatchDto,
    CoreCompanyExtendedListItemDto,
    CoreCompanyListItemDto,
    CoreCompanyDto,
    CoreCompanyLogoDto,
    CoreCompanyRoleDetailDto,
    CoreCompanySummaryDto,
    CoreCompanyUserAssignmentDto,
    CoreResolvedCatalogDto,
    CoreThirdPartyDto,
    CoreThirdPartyPageDto,
    CoreThirdPartyUpsertResultDto,
    CoreUserAccountDto,
    CoreUserExtendedListItemDto,
    CoreUserDto,
    CoreUserListItemDto,
    CoreUserPageDto,
    CreateCoreUserDto,
    UpdateCoreUserDto,
    UpdateCoreUserStatusDto,
    SearchCoreThirdPartiesDto,
    SearchCoreUsersDto,
    SearchCoreCompaniesDto,
    SearchCoreUserExtendedListDto,
    SearchCoreUserListDto,
    MatchCoreCatalogItemDto,
    UnassignCoreCompanyUserDto,
    UpsertCoreThirdPartyDto,
    UpdateCoreAccountDemoDto,
    UpdateCoreCompanyDto,
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


