import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthorizationRepository } from '../authorization.repository';

@Injectable()
export class RegisteredGuard extends AuthGuard('accounting-jwt') {
    constructor(private readonly authorizationRepository: AuthorizationRepository) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const tokenFromQuery = request.query.token;
        if (tokenFromQuery) {
            request.headers.authorization = `Bearer ${tokenFromQuery}`;
        }

        const authenticated = (await super.canActivate(context)) as boolean;
        if (!authenticated) return false;

        const user = request.user;
        if (!user.id) {
            const local = await this.authorizationRepository.findRegisteredUserBySub(user.sub);
            if (!local) {
                throw new ForbiddenException('El usuario aún no se ha registrado.');
            }
            if (
                local.mustChangePassword
                && local.userType === 'SUBUSUARIO'
                && !request.route.path.includes('change-password')
            ) {
                throw new ForbiddenException('El usuario aún no ha cambiado su contraseña.');
            }
            user.id = local.id;
        }

        return true;
    }
}
