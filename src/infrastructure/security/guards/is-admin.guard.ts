import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthorizationRepository } from '../authorization.repository';

@Injectable()
export class IsAdminGuard implements CanActivate {
    constructor(private readonly authorizationRepository: AuthorizationRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const email: string | undefined = context.switchToHttp().getRequest()?.user?.email;
        if (!email) {
            throw new ForbiddenException('Usuario no autenticado.');
        }

        if (!await this.authorizationRepository.isAdminEmail(email)) {
            throw new ForbiddenException('No tienes permisos para esta accion.');
        }

        return true;
    }
}
