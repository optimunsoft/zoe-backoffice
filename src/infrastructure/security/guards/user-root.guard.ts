import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthorizationRepository } from '../authorization.repository';

@Injectable()
export class UserRootGuard implements CanActivate {
    constructor(private readonly authorizationRepository: AuthorizationRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const userId = context.switchToHttp().getRequest()?.user?.id;
        if (!userId) throw new ForbiddenException('Usuario no autenticado.');

        if (!await this.authorizationRepository.isRootUser(userId)) {
            throw new ForbiddenException('No tienes permisos para esta acción.');
        }
        return true;
    }
}
