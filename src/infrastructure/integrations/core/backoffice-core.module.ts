import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BackofficeCoreService } from './backoffice-core.service';
import { BACKOFFICE_CORE_INTEGRATION } from './interfaces/backoffice-core.interface';

@Module({
    imports: [HttpModule],
    providers: [
        {
            provide: BACKOFFICE_CORE_INTEGRATION,
            useClass: BackofficeCoreService,
        },
    ],
    exports: [BACKOFFICE_CORE_INTEGRATION],
})
export class BackofficeCoreModule {}

