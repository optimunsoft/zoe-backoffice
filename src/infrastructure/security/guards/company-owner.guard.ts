import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthorizationRepository } from '../authorization.repository';
import { extractCompanyId } from '../helpers/request.helper';

@Injectable()
export class CompanyOwnerGuard implements CanActivate {
    constructor(private readonly authorizationRepository: AuthorizationRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request?.user?.id;
        if (!userId) throw new ForbiddenException('Usuario no autenticado.');

        if (!await this.authorizationRepository.isCompanyOwner(userId, extractCompanyId(request))) {
            throw new ForbiddenException('No tienes permisos para esta acción.');
        }
        return true;
    }
}
