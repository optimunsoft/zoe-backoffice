import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AccountingJwtStrategy } from './auth0/jwt.strategy';
import { AuthorizationRepository } from './authorization.repository';
import { ApiKeyGuard } from './guards/api-key.guard';
import { BackofficeAdminGuard } from './guards/backoffice-admin.guard';
import { CompanyOwnerGuard } from './guards/company-owner.guard';
import { CompanyPermissionGuard } from './guards/company-permission.guard';
import { CompanyRelatedGuard } from './guards/company-related.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { JwtLogGuard } from './guards/jwt-log.guard';
import { RegisteredGuard } from './guards/registered.guard';
import { UserRootGuard } from './guards/user-root.guard';

const guards = [
    JwtLogGuard,
    RegisteredGuard,
    UserRootGuard,
    CompanyOwnerGuard,
    CompanyRelatedGuard,
    CompanyPermissionGuard,
    IsAdminGuard,
    BackofficeAdminGuard,
    ApiKeyGuard,
];

@Module({
    imports: [PassportModule.register({ defaultStrategy: 'accounting-jwt' })],
    providers: [
        AccountingJwtStrategy,
        AuthorizationRepository,
        ...guards,
    ],
    exports: [
        PassportModule,
        AuthorizationRepository,
        ...guards,
    ],
})
export class SecurityModule {}
