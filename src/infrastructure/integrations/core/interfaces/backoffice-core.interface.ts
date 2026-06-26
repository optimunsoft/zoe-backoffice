import {
    CoreCatalog,
    CoreCompanyListItemDto,
    CoreCompanyDto,
    CoreCompanyLogoDto,
    CoreResolvedCatalogDto,
    CoreThirdPartyDto,
    CoreThirdPartyPageDto,
    CoreThirdPartyUpsertResultDto,
    CoreUserDto,
    CoreUserListItemDto,
    CoreUserPageDto,
    SearchCoreThirdPartiesDto,
    SearchCoreUsersDto,
    SearchCoreCompaniesDto,
    SearchCoreUserListDto,
    UpsertCoreThirdPartyDto,
} from '../dto/backoffice-core.dto';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';

export const BACKOFFICE_CORE_INTEGRATION = Symbol('BACKOFFICE_CORE_INTEGRATION');

export interface IBackofficeCoreIntegration {
    companyExists(companyId: string, sessionKey: string): Promise<boolean>;
    findCompanyById(companyId: string): Promise<CoreCompanyDto | null>;
    getCompanyLogo(companyId: string, returnBase64?: boolean): Promise<CoreCompanyLogoDto>;
    searchCompanies(params: SearchCoreCompaniesDto): Promise<PaginatedResult<CoreCompanyListItemDto>>;
    searchUserList(params: SearchCoreUserListDto): Promise<PaginatedResult<CoreUserListItemDto>>;
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
}


