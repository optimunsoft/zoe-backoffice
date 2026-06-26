import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationRepository } from '../authorization.repository';
import {
    PERMISSION_METADATA_KEY,
    PermissionMeta,
} from '../decorators/require-permission.decorator';
import { extractCompanyId } from '../helpers/request.helper';

@Injectable()
export class CompanyPermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authorizationRepository: AuthorizationRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const meta = this.reflector.getAllAndOverride<PermissionMeta | undefined>(
            PERMISSION_METADATA_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!meta) return true;

        const request = context.switchToHttp().getRequest();
        const userId = request?.user?.id;
        if (!userId) throw new ForbiddenException('Usuario no autenticado.');

        const allowed = await this.authorizationRepository.hasPermission(
            userId,
            extractCompanyId(request),
            meta.module,
            meta.resource,
            meta.action,
        );
        if (!allowed) {
            throw new ForbiddenException('No tienes permisos para esta acción.');
        }
        return true;
    }
}
