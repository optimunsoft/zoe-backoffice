import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    PERMISSION_METADATA_KEY,
    PermissionMeta,
} from './require-permission.decorator';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { BackofficeAdminGuard } from '../guards/backoffice-admin.guard';
import { CompanyOwnerGuard } from '../guards/company-owner.guard';
import { CompanyPermissionGuard } from '../guards/company-permission.guard';
import { CompanyRelatedGuard } from '../guards/company-related.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { RegisteredGuard } from '../guards/registered.guard';
import { UserRootGuard } from '../guards/user-root.guard';

type Mode = 'jwt' | 'registered' | 'admin' | 'backoffice-admin' | 'user-root' | 'owner' | 'related' | 'perm' | 'api-key';

export function UseAuth(mode: Mode, permission?: PermissionMeta) {
    switch (mode) {
        case 'jwt':
            return applyDecorators(UseGuards(AuthGuard('accounting-jwt')));
        case 'registered':
            return applyDecorators(UseGuards(RegisteredGuard));
        case 'admin':
            return applyDecorators(UseGuards(RegisteredGuard, IsAdminGuard));
        case 'backoffice-admin':
            return applyDecorators(UseGuards(RegisteredGuard, IsAdminGuard, BackofficeAdminGuard));
        case 'user-root':
            return applyDecorators(UseGuards(RegisteredGuard, UserRootGuard));
        case 'owner':
            return applyDecorators(UseGuards(RegisteredGuard, CompanyOwnerGuard));
        case 'related':
            return applyDecorators(UseGuards(RegisteredGuard, CompanyRelatedGuard));
        case 'perm':
            if (!permission) {
                throw new Error('UseAuth("perm", { module, resource, action }) es requerido.');
            }
            return applyDecorators(
                SetMetadata(PERMISSION_METADATA_KEY, {
                    ...permission,
                    module: permission.module.toUpperCase(),
                    resource: permission.resource.toUpperCase(),
                }),
                UseGuards(RegisteredGuard, CompanyPermissionGuard),
            );
        case 'api-key':
            return applyDecorators(UseGuards(ApiKeyGuard));
    }
}
