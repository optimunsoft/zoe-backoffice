jest.mock('src/config/env.config', () => ({
    envs: {
        auth0_domain: 'tenant.auth0.com',
        auth0_audience: 'https://api.example.com',
        api_key_encryption_key: 'test-key',
    },
}));

import { Test } from '@nestjs/testing';
import { SecurityModule } from './security.module';
import { AuthorizationRepository } from './authorization.repository';
import { ApiKeyGuard } from './guards/api-key.guard';
import { CompanyOwnerGuard } from './guards/company-owner.guard';
import { CompanyPermissionGuard } from './guards/company-permission.guard';
import { CompanyRelatedGuard } from './guards/company-related.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { RegisteredGuard } from './guards/registered.guard';
import { UserRootGuard } from './guards/user-root.guard';

describe('SecurityModule', () => {
    it('registers and exports every guard used by accounting', async () => {
        const module = await Test.createTestingModule({
            imports: [SecurityModule],
        })
            .overrideProvider(AuthorizationRepository)
            .useValue({})
            .compile();

        expect(module.get(RegisteredGuard)).toBeDefined();
        expect(module.get(UserRootGuard)).toBeDefined();
        expect(module.get(CompanyOwnerGuard)).toBeDefined();
        expect(module.get(CompanyRelatedGuard)).toBeDefined();
        expect(module.get(CompanyPermissionGuard)).toBeDefined();
        expect(module.get(IsAdminGuard)).toBeDefined();
        expect(module.get(ApiKeyGuard)).toBeDefined();
    });
});
