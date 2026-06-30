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
}

export interface SearchCoreUserListDto {
    page?: number;
    amount?: number;
    search?: string;
}

export interface MatchCoreCatalogItemDto {
    catalog: CoreCatalog;
    code?: string;
    name?: string;
    state?: string;
    country?: string;
}

