import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthorizationRepository } from '../authorization.repository';

@Injectable()
export class BackofficeAdminGuard implements CanActivate {
    constructor(private readonly authorizationRepository: AuthorizationRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const requestedRole = request?.body?.backofficeRole;
        if (requestedRole !== 'ADMINISTRADOR') {
            return true;
        }

        const email: string | undefined = request?.user?.email;
        if (!email) {
            throw new ForbiddenException('Usuario no autenticado.');
        }

        if (!await this.authorizationRepository.isBackofficeAdministratorEmail(email)) {
            throw new ForbiddenException('No tienes permisos para esta accion.');
        }

        return true;
    }
}
