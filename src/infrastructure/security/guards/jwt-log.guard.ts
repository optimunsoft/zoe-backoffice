import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtLogGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtLogGuard.name);

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err) this.logger.error('JWT error', err);
        if (info) this.logger.warn('JWT info', info.message || info);
        return super.handleRequest(err, user, info, context);
    }
}
