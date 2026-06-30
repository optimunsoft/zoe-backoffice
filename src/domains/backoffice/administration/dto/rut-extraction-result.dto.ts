export interface RutExtractionRawDto {
    documentType?: string | null;
    documentNumber?: string | null;
    verificationDigit?: string | null;
    personType?: string | null;
    businessName?: string | null;
    tradeName?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    secondLastName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    country?: string | null;
    department?: string | null;
    municipality?: string | null;
    documentStatus?: string | null;
    documentDate?: string | null;
    economicActivities: Array<{
        code?: string | null;
        name?: string | null;
        type?: string | null;
        startDate?: string | null;
    }>;
    taxResponsibilities: Array<{
        code?: string | null;
        name?: string | null;
    }>;
    representatives: Array<{
        documentType?: string | null;
        documentNumber?: string | null;
        name?: string | null;
        role?: string | null;
    }>;
    metadata: {
        confidence: number;
        missingFields: string[];
        warnings: string[];
        pagesProcessed?: number | null;
    };
}

export interface CatalogMatchResultDto {
    catalog: string;
    input: Record<string, string | undefined>;
    id?: string;
    code?: string;
    name?: string;
    matchedBy?: string;
    confidence: number;
    unresolvedReason?: string;
}

export interface CompanyPrefillResultDto {
    prefill: {
        documentTypeId?: string;
        businessNatureId?: string;
        taxResponsibilityId?: string;
        vatRegimeId?: string;
        municipalityId?: string;
        documentNumber?: string | null;
        businessName?: string | null;
        tradeName?: string | null;
        firstName?: string | null;
        middleName?: string | null;
        lastName?: string | null;
        secondLastName?: string | null;
        email?: string | null;
        address?: string | null;
    };
    extracted: RutExtractionRawDto;
    resolution: {
        matches: CatalogMatchResultDto[];
        unresolved: CatalogMatchResultDto[];
        warnings: string[];
    };
}

export type RutExtractionResultDto = CompanyPrefillResultDto;
