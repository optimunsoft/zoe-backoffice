import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { envs } from 'src/config/env.config';
import { ApiKeyHashUtil } from 'src/shared/utils/api-key-hash.util';
import { AuthorizationRepository } from '../authorization.repository';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly authorizationRepository: AuthorizationRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.query.auth
            || request.headers.authorization
            || request.headers['x-api-key'];
        if (!apiKey) {
            throw new ForbiddenException('Api key no válida o no proporcionada.');
        }

        const companies = await this.authorizationRepository.findCompanyApiKeys();
        const company = companies.find(candidate =>
            ApiKeyHashUtil.verify(
                apiKey,
                candidate.apiKey,
                envs.api_key_encryption_key,
            ),
        );
        if (!company) {
            throw new ForbiddenException('Api key no válida o no proporcionada.');
        }

        request.company = { id: company.id };
        return true;
    }
}
