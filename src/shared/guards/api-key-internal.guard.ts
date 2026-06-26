import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { envs } from 'src/config/env.config';

@Injectable()
export class ApiKeyInternalGuard implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const apiKey = request.headers['x-api-key-internal'];
        if (apiKey && apiKey == envs.api_key_internal) {
            return true;
        } else {
            throw new ForbiddenException('Api key no válida o no proporcionada.');
        }
    }
}


