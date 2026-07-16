import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthorizationRepository, BackofficeRole } from '../authorization.repository';

@Injectable()
export class IsOperatorGuard implements CanActivate {
    constructor(private readonly authorizationRepository: AuthorizationRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request?.user?.id;
        if (!userId) throw new ForbiddenException('Usuario no autenticado.');

        if (!await this.authorizationRepository.hasAccessBackoffice(userId, BackofficeRole.OPERATOR)) {
            throw new ForbiddenException('No tienes permisos para esta acción.');
        }

        return true;
    }
}
