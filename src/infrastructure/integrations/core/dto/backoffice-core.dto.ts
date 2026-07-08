import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsInt,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';

export enum CoreCatalog {
    DOCUMENT_TYPE = 'documentType',
    BUSINESS_NATURE = 'businessNature',
    TAX_RESPONSIBILITY = 'taxResponsibility',
    VAT_REGIME = 'vatRegime',
    MUNICIPALITY = 'municipality',
    COUNTRY = 'country',
}

export class CoreResolvedCatalogDto {
    @IsEnum(CoreCatalog)
    catalog: CoreCatalog;

    @IsUUID()
    id: string;

    @IsString()
    code: string;

    @IsString()
    name: string;
}

export class CoreCatalogMatchDto {
    @IsEnum(CoreCatalog)
    catalog: CoreCatalog;

    @IsObject()
    input: Record<string, string | undefined>;

    @IsOptional()
    @IsUUID()
    id?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    matchedBy?: string;

    @IsNumber()
    @Min(0)
    confidence: number;

    @IsOptional()
    @IsString()
    unresolvedReason?: string;
}

export class CoreCatalogDto {
    @IsString()
    code: string;

    @IsString()
    name: string;
}

export class CoreStateDto {
    @IsString()
    name: string;
}

export class CoreMunicipalityDto {
    @IsString()
    name: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CoreStateDto)
    state?: CoreStateDto | null;
}

export class CoreCompanyDto {
    @IsUUID()
    id: string;

    @IsOptional() @IsBoolean() active?: boolean;
    @IsOptional() @IsString() businessName?: string | null;
    @IsOptional() @IsString() tradeName?: string | null;
    @IsString() documentNumber: string;
    @IsOptional() @IsString() address?: string | null;
    @IsOptional() @IsString() email?: string | null;
    @IsOptional() @IsString() logoName?: string | null;
    @IsOptional() @IsString() accountantName?: string | null;
    @IsOptional() @IsString() professionalCard?: string | null;
    @IsOptional() @IsString() timezone?: string | null;

    @IsOptional()
    @ValidateNested()
    @Type(() => CoreCatalogDto)
    documentType?: CoreCatalogDto | null;

    @IsOptional()
    @ValidateNested()
    @Type(() => CoreMunicipalityDto)
    municipality?: CoreMunicipalityDto | null;
}

export class CoreCompanyLogoDto {
    @IsOptional()
    @IsString()
    logo: string | null;
}

export class CoreCompanyLogoUploadDto {
    @IsString()
    message: string;

    @IsOptional()
    @IsString()
    logoName?: string | null;
}

export class CoreCompanyListItemDto {
    @IsUUID()
    id: string;

    @IsUUID()
    businessNatureId: string;

    @IsUUID()
    taxResponsibilityId: string;

    @IsOptional()
    @IsUUID()
    vatRegimeId?: string | null;

    @IsUUID()
    documentTypeId: string;

    @IsUUID()
    municipalityId: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @IsString()
    documentNumber: string;

    @IsOptional() @IsString() businessName?: string | null;
    @IsOptional() @IsString() tradeName?: string | null;
    @IsOptional() @IsString() firstName?: string | null;
    @IsOptional() @IsString() middleName?: string | null;
    @IsOptional() @IsString() lastName?: string | null;
    @IsOptional() @IsString() secondLastName?: string | null;
    @IsOptional() @IsEmail() email?: string | null;
    @IsOptional() @IsString() accountantName?: string | null;
    @IsOptional() @IsString() professionalCard?: string | null;
    @IsOptional() @IsString() logoName?: string | null;
    @IsOptional() @IsString() address?: string | null;
    @IsOptional() @IsString() timezone?: string | null;

    @IsBoolean()
    hasApiKey: boolean;

    @IsString()
    createdAt: string;

    @IsString()
    updatedAt: string;
}

export class CoreCompanyPageDto implements PaginatedResult<CoreCompanyListItemDto> {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreCompanyListItemDto)
    data: CoreCompanyListItemDto[];

    @IsInt() @Min(0) total: number;
    @IsInt() @Min(1) page: number;
    @IsInt() @Min(1) amount: number;
}

export class CreateCoreCompanyDto {
    @IsUUID()
    ownerUserId: string;

    @IsUUID()
    businessNatureId: string;

    @IsUUID()
    taxResponsibilityId: string;

    @IsOptional()
    @IsUUID()
    vatRegimeId?: string | null;

    @IsUUID()
    documentTypeId: string;

    @IsString()
    documentNumber: string;

    @IsOptional() @IsString() businessName?: string | null;
    @IsOptional() @IsString() tradeName?: string | null;
    @IsOptional() @IsString() firstName?: string | null;
    @IsOptional() @IsString() middleName?: string | null;
    @IsOptional() @IsString() lastName?: string | null;
    @IsOptional() @IsString() secondLastName?: string | null;
    @IsOptional() @IsEmail() email?: string | null;
    @IsOptional() @IsString() accountantName?: string | null;
    @IsOptional() @IsString() professionalCard?: string | null;

    @IsUUID()
    municipalityId: string;

    @IsOptional()
    @IsString()
    address?: string | null;
}

export class UpdateCoreCompanyDto {
    @IsOptional()
    @IsUUID()
    businessNatureId?: string | null;

    @IsOptional()
    @IsUUID()
    taxResponsibilityId?: string | null;

    @IsOptional()
    @IsUUID()
    vatRegimeId?: string | null;

    @IsOptional()
    @IsUUID()
    documentTypeId?: string | null;

    @IsOptional()
    @IsString()
    documentNumber?: string | null;

    @IsOptional() @IsString() businessName?: string | null;
    @IsOptional() @IsString() tradeName?: string | null;
    @IsOptional() @IsString() firstName?: string | null;
    @IsOptional() @IsString() middleName?: string | null;
    @IsOptional() @IsString() lastName?: string | null;
    @IsOptional() @IsString() secondLastName?: string | null;
    @IsOptional() @IsEmail() email?: string | null;
    @IsOptional() @IsString() accountantName?: string | null;
    @IsOptional() @IsString() professionalCard?: string | null;

    @IsOptional()
    @IsUUID()
    municipalityId?: string | null;

    @IsOptional()
    @IsString()
    address?: string | null;
}

export class UpdateCoreCompanyStatusDto {
    @IsBoolean()
    active: unknown;
}

export class AssignCoreCompanyUserDto {
    @IsUUID()
    companyId: string;

    @IsUUID()
    userId: string;

    @IsOptional()
    @IsBoolean()
    isOwner?: boolean;
}

export class AssignCoreCompanyUserRequestDto {
    @IsUUID()
    companyId: string;

    @IsUUID()
    userId: string;

    @IsOptional()
    @IsBoolean()
    isOwner?: boolean;
}

export class UnassignCoreCompanyUserDto {
    @IsUUID()
    companyId: string;

    @IsUUID()
    userId: string;
}

export class CoreCompanyUserAssignmentDto {
    @IsUUID()
    companyId: string;

    @IsUUID()
    userId: string;

    @IsOptional()
    @IsBoolean()
    isOwner?: boolean;
}

export class AssignCoreCompanyModuleDto {
    @IsUUID()
    companyId: string;

    @IsEnum(['ACTIVO', 'INACTIVO', 'SOLO_LECTURA'])
    status: 'ACTIVO' | 'INACTIVO' | 'SOLO_LECTURA';
}

export class CoreCompanyModuleAssignmentDto {
    @IsUUID()
    moduleId: string;

    @IsUUID()
    companyId: string;

    @IsEnum(['ACTIVO', 'INACTIVO', 'SOLO_LECTURA'])
    status: 'ACTIVO' | 'INACTIVO' | 'SOLO_LECTURA';

    @IsString()
    createdAt: string;

    @IsString()
    updatedAt: string;
}

export class CoreModuleDto {
    @IsUUID()
    id: string;

    @IsString()
    code: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsOptional()
    @IsString()
    price?: string | null;

    @IsString()
    createdAt: string;

    @IsString()
    updatedAt: string;
}

export class CoreModulePageDto implements PaginatedResult<CoreModuleDto> {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreModuleDto)
    data: CoreModuleDto[];

    @IsInt() @Min(0) total: number;
    @IsInt() @Min(1) page: number;
    @IsInt() @Min(1) amount: number;
}

export class CreateCoreModuleDto {
    @IsString()
    code: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsOptional()
    @IsString()
    price?: string | null;
}

export class UpdateCoreModuleDto {
    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsOptional()
    @IsString()
    price?: string | null;
}

export class CoreModuleDeleteDto {
    @IsUUID()
    id: string;
}

export class CoreCompanySummaryDto {
    @IsUUID()
    id: string;

    @IsUUID()
    businessNatureId: string;

    @IsUUID()
    taxResponsibilityId: string;

    @IsOptional()
    @IsUUID()
    vatRegimeId?: string | null;

    @IsUUID()
    documentTypeId: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @IsString()
    documentNumber: string;

    @IsOptional()
    @IsString()
    apiKey?: string | null;

    @IsOptional() @IsString() businessName?: string | null;
    @IsOptional() @IsString() firstName?: string | null;
    @IsOptional() @IsString() middleName?: string | null;
    @IsOptional() @IsString() lastName?: string | null;
    @IsOptional() @IsString() secondLastName?: string | null;
    @IsOptional() @IsEmail() email?: string | null;
    @IsOptional() @IsString() accountantName?: string | null;
    @IsOptional() @IsString() professionalCard?: string | null;
    @IsOptional() @IsString() logoName?: string | null;

    @IsUUID()
    municipalityId: string;

    @IsOptional()
    @IsString()
    address?: string | null;

    @IsString()
    createdAt: string;

    @IsString()
    updatedAt: string;
}

export class CoreCompanyLocationDto {
    @IsUUID()
    id: string;

    @IsString()
    code: string;

    @IsString()
    name: string;
}

export class CoreCompanyMunicipalityDto extends CoreCompanyLocationDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => CoreCompanyLocationDto)
    state?: CoreCompanyLocationDto | null;
}

export class CoreCompanyPermissionDto {
    @IsUUID()
    id: string;

    @IsString()
    module: string;

    @IsString()
    resource: string;

    @IsString()
    action: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string | null;
}

export class CoreCompanyRoleSummaryDto {
    @IsUUID()
    id: string;

    @IsString()
    name: string;
}

export class CoreCompanyRoleDetailDto {
    @IsUUID()
    id: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsBoolean()
    isSystem: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreCompanyPermissionDto)
    permissions: CoreCompanyPermissionDto[];
}

export class CoreCompanyUserDto {
    @IsUUID()
    id: string;

    @IsString()
    userType: string;

    @IsOptional() @IsEmail() email?: string | null;
    @IsOptional() @IsString() firstName?: string | null;
    @IsOptional() @IsString() lastName?: string | null;

    @IsBoolean()
    isActive: boolean;

    @IsBoolean()
    isDeleted: boolean;

    @IsBoolean()
    isOwner: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreCompanyRoleSummaryDto)
    roles: CoreCompanyRoleSummaryDto[];
}

export class CoreCompanyAssignedModuleDto {
    @IsUUID()
    moduleId: string;

    @IsString()
    code: string;

    @IsString()
    name: string;

    @IsEnum(['ACTIVO', 'INACTIVO', 'SOLO_LECTURA'])
    status: 'ACTIVO' | 'INACTIVO' | 'SOLO_LECTURA';
}

export class CoreCompanyExtendedListItemDto {
    @IsUUID()
    id: string;

    @IsUUID()
    businessNatureId: string;

    @IsUUID()
    taxResponsibilityId: string;

    @IsOptional()
    @IsUUID()
    vatRegimeId?: string | null;

    @IsUUID()
    documentTypeId: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @IsString()
    documentNumber: string;

    @IsOptional() @IsString() businessName?: string | null;
    @IsOptional() @IsString() tradeName?: string | null;
    @IsOptional() @IsString() firstName?: string | null;
    @IsOptional() @IsString() middleName?: string | null;
    @IsOptional() @IsString() lastName?: string | null;
    @IsOptional() @IsString() secondLastName?: string | null;
    @IsOptional() @IsEmail() email?: string | null;
    @IsOptional() @IsString() accountantName?: string | null;
    @IsOptional() @IsString() professionalCard?: string | null;
    @IsOptional() @IsString() logoName?: string | null;
    @IsOptional() @IsString() apiKey?: string | null;
    @IsOptional() @IsString() address?: string | null;
    @IsOptional() @IsString() timezone?: string | null;

    @IsOptional()
    @ValidateNested()
    @Type(() => CoreCompanyMunicipalityDto)
    municipality?: CoreCompanyMunicipalityDto | null;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreCompanyRoleSummaryDto)
    roles: CoreCompanyRoleSummaryDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreCompanyUserDto)
    users: CoreCompanyUserDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreCompanyAssignedModuleDto)
    modules: CoreCompanyAssignedModuleDto[];

    @IsString()
    createdAt: string;

    @IsString()
    updatedAt: string;
}

export class CoreCompanyExtendedPageDto implements PaginatedResult<CoreCompanyExtendedListItemDto> {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreCompanyExtendedListItemDto)
    data: CoreCompanyExtendedListItemDto[];

    @IsInt() @Min(0) total: number;
    @IsInt() @Min(1) page: number;
    @IsInt() @Min(1) amount: number;
}

export class CoreUserDto {
    @IsUUID()
    id: string;

    @IsString()
    label: string;

    @IsOptional() @IsString() firstName: string | null;
    @IsOptional() @IsString() lastName: string | null;
    @IsOptional() @IsEmail() email: string | null;
    @IsOptional() @IsString() username: string | null;
}

export class CoreUserPageDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreUserDto)
    data: CoreUserDto[];

    @IsInt() @Min(0) total: number;
    @IsInt() @Min(1) page: number;
    @IsInt() @Min(0) amount: number;
}

export class CoreUserCompanyListItemDto {
    @IsUUID()
    id: string;

    @IsOptional()
    @IsString()
    documentNumber?: string | null;

    @IsOptional()
    @IsString()
    businessName?: string | null;

    @IsOptional()
    @IsString()
    tradeName?: string | null;

    @IsOptional()
    @IsEmail()
    email?: string | null;

    @IsBoolean()
    isOwner: boolean;
}

export class CoreUserListItemDto {
    @IsUUID()
    id: string;

    @IsString()
    label: string;

    @IsOptional() @IsString() firstName?: string | null;
    @IsOptional() @IsString() lastName?: string | null;
    @IsOptional() @IsEmail() email?: string | null;
    @IsOptional() @IsString() username?: string | null;

    @IsString()
    userType: string;

    @IsBoolean()
    isActive: boolean;

    @IsBoolean()
    isVerified: boolean;

    @IsBoolean()
    isAdmin: boolean;

    @IsOptional()
    @IsEnum(['ADMINISTRADOR', 'OPERARIO'])
    backofficeRole?: 'ADMINISTRADOR' | 'OPERARIO' | null;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreUserCompanyListItemDto)
    companies: CoreUserCompanyListItemDto[];

    @IsString()
    createdAt: string;

    @IsString()
    updatedAt: string;
}

export class CoreUserListPageDto implements PaginatedResult<CoreUserListItemDto> {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreUserListItemDto)
    data: CoreUserListItemDto[];

    @IsInt() @Min(0) total: number;
    @IsInt() @Min(1) page: number;
    @IsInt() @Min(1) amount: number;
}

export class CoreUserAccountDto {
    @IsUUID()
    id: string;

    @IsString()
    code: string;

    @IsBoolean()
    isActive: boolean;

    @IsBoolean()
    isDeleted: boolean;

    @IsBoolean()
    isDemo: boolean;

    @IsString()
    createdAt: string;

    @IsString()
    updatedAt: string;
}

export class CoreUserSessionDto {
    @IsUUID()
    id: string;

    @IsString()
    loginAt: string;

    @IsOptional()
    @IsString()
    logoutAt?: string | null;

    @IsOptional()
    @IsString()
    device?: string | null;

    @IsOptional()
    @IsString()
    browser?: string | null;

    @IsOptional()
    @IsString()
    operatingSystem?: string | null;

    @IsOptional()
    @IsString()
    ip?: string | null;

    @IsOptional()
    @IsString()
    country?: string | null;

    @IsOptional()
    @IsString()
    city?: string | null;

    @IsInt()
    @Min(0)
    refreshCount: number;

    @IsOptional()
    @IsString()
    accessExpiresAt?: string | null;

    @IsOptional()
    @IsString()
    refreshExpiresAt?: string | null;

    @IsBoolean()
    revoked: boolean;

    @IsOptional()
    @IsString()
    revokedAt?: string | null;
}

export class CoreUserExtendedListItemDto extends CoreUserListItemDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => CoreUserAccountDto)
    account?: CoreUserAccountDto | null;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreUserSessionDto)
    sessions: CoreUserSessionDto[];
}

export class CoreUserExtendedPageDto implements PaginatedResult<CoreUserExtendedListItemDto> {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreUserExtendedListItemDto)
    data: CoreUserExtendedListItemDto[];

    @IsInt() @Min(0) total: number;
    @IsInt() @Min(1) page: number;
    @IsInt() @Min(1) amount: number;
}

export class CreateCoreUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsUUID()
    municipalityId: string;

    @IsString()
    birthDate: string;

    @IsOptional()
    @IsString()
    phonePrefix?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsBoolean()
    isAdmin: boolean;

    @IsOptional()
    @IsEnum(['ADMINISTRADOR', 'OPERARIO'])
    backofficeRole?: 'ADMINISTRADOR' | 'OPERARIO';

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;

    @IsOptional()
    @IsBoolean()
    isDemo?: boolean;

    @IsOptional()
    @IsEnum(['USUARIO', 'SUBUSUARIO'])
    userType?: 'USUARIO' | 'SUBUSUARIO';

    @IsOptional()
    @IsEnum(['USUARIO', 'SUBUSUARIO'])
    type?: 'USUARIO' | 'SUBUSUARIO';
}

export class UpdateCoreUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsUUID()
    municipalityId?: string;

    @IsOptional()
    @IsString()
    birthDate?: string;

    @IsOptional()
    @IsBoolean()
    isAdmin?: boolean;

    @IsOptional()
    @IsEnum(['ADMINISTRADOR', 'OPERARIO'])
    backofficeRole?: 'ADMINISTRADOR' | 'OPERARIO';

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;
}

export class UpdateCoreUserStatusDto {
    @IsBoolean()
    active: unknown;
}

export class UpdateCoreAccountDemoDto {
    @IsBoolean()
    isDemo: unknown;
}

export class CoreThirdPartyDto {
    @IsUUID() id: string;
    @IsUUID() companyId: string;
    @IsString() documentNumber: string;
    @IsString() businessName: string;
    @IsOptional() @IsUUID() businessNatureId?: string;
    @IsOptional() @IsUUID() taxResponsibilityId?: string;
    @IsOptional() @IsUUID() vatRegimeId?: string | null;
    @IsOptional() @IsUUID() documentTypeId?: string;
    @IsOptional() @IsString() documentTypeCode?: string | null;
    @IsOptional() @IsString() businessNatureCode?: string | null;
    @IsOptional() @IsString() tradeName?: string | null;
    @IsOptional() @IsString() firstName?: string | null;
    @IsOptional() @IsString() middleName?: string | null;
    @IsOptional() @IsString() lastName?: string | null;
    @IsOptional() @IsString() secondLastName?: string | null;
    @IsOptional() @IsString() address?: string | null;
    @IsOptional() @IsUUID() municipalityId?: string | null;
    @IsOptional() @IsString() municipalityCode?: string | null;
    @IsOptional() @IsString() email?: string | null;
    @IsOptional() @IsUUID() countryId?: string | null;
    @IsOptional() @IsString() countryCode?: string | null;
    @IsOptional() @IsString() state?: string | null;
    @IsOptional() @IsString() stateCode?: string | null;
    @IsOptional() @IsString() city?: string | null;
    @IsOptional() @IsBoolean() isForeign?: boolean;
    @IsOptional() @IsBoolean() isCustomer?: boolean;
    @IsOptional() @IsBoolean() isSupplier?: boolean;
    @IsOptional() @IsBoolean() isOther?: boolean;
    @IsOptional() @IsArray() phonenumbers?: unknown[];
}

export class CoreThirdPartyUpsertResultDto {
    @ValidateNested()
    @Type(() => CoreThirdPartyDto)
    thirdParty: CoreThirdPartyDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => CoreThirdPartyDto)
    before: CoreThirdPartyDto | null;

    @IsBoolean()
    created: boolean;
}

export class CoreThirdPartyPageDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoreThirdPartyDto)
    data: CoreThirdPartyDto[];

    @IsInt() @Min(0) total: number;
    @IsInt() @Min(1) page: number;
    @IsInt() @Min(1) amount: number;
}

export interface SearchCoreUsersDto {
    ids: string[];
    search?: string;
    page?: number;
    amount?: number;
}

export interface SearchCoreThirdPartiesDto {
    companyId: string;
    page: number;
    amount: number;
    search?: string;
}

export type UpsertCoreThirdPartyDto = Record<string, unknown>;

export interface SearchCoreCompaniesDto {
    page?: number;
    amount?: number;
    search?: string;
    municipalityId?: string;
    stateId?: string;
}

export interface SearchCoreModulesDto {
    page?: number;
    amount?: number;
    search?: string;
}

export interface SearchCoreUserListDto {
    page?: number;
    amount?: number;
    search?: string;
}

export interface SearchCoreUserExtendedListDto extends SearchCoreUserListDto {
    companyId?: string;
    isAdmin?: boolean;
    isDemo?: boolean;
    type?: 'USUARIO' | 'SUBUSUARIO';
}

export interface MatchCoreCatalogItemDto {
    catalog: CoreCatalog;
    code?: string;
    name?: string;
    state?: string;
    country?: string;
}
