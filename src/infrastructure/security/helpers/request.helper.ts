import { BadRequestException } from '@nestjs/common';

export function extractCompanyId(request: any): string {
    let companyId: string | undefined;

    if (
        request.path.includes('companies/edit')
        || request.path.includes('companies/delete')
        || request.path.includes('companies/files/upload-logo')
    ) {
        companyId = request.params.id;
    } else {
        companyId = request.params?.companyId
            || request.query?.companyId
            || request.body?.companyId;
    }

    if (!companyId) {
        throw new BadRequestException('Falta el parámetro companyId.');
    }

    return companyId;
}
