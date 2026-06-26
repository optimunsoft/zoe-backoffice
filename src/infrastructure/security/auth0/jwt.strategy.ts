import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { envs } from 'src/config/env.config';

@Injectable()
export class AccountingJwtStrategy extends PassportStrategy(Strategy, 'accounting-jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            issuer: [
                `https://${envs.auth0_domain}/`,
                `https://${envs.auth0_custom_domain}/`,
            ],
            audience: envs.auth0_audience,
            algorithms: ['RS256'],
            secretOrKeyProvider: jwksRsa.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksUri: `https://${envs.auth0_domain}/.well-known/jwks.json`,
            }),
        });
    }

    validate(payload: any) {
        return {
            sub: payload.sub,
            email: payload.main_api_email,
            isVerified: payload.main_api_email_verified,
            name: payload.name,
            picture: payload.picture,
        };
    }
}
