import { SetMetadata } from '@nestjs/common';

export type PermissionMeta = {
    module: string;
    resource: string;
    action: string;
};

export const PERMISSION_METADATA_KEY = 'rbac:permission';

export const RequirePermission = (
    module: string,
    resource: string,
    action: string,
) => SetMetadata(PERMISSION_METADATA_KEY, {
    module: module.toUpperCase(),
    resource: resource.toUpperCase(),
    action,
} as PermissionMeta);
