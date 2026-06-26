import { Module } from '@nestjs/common';
import { BackofficeCoreModule } from 'src/infrastructure/integrations/core/backoffice-core.module';
import { SecurityModule } from 'src/infrastructure/security/security.module';
import { AdministrationController } from './administration.controller';
import { AdministrationService } from './administration.service';

@Module({
  imports: [BackofficeCoreModule, SecurityModule],
  controllers: [AdministrationController],
  providers: [AdministrationService],
  exports: [AdministrationService],
})
export class AdministrationModule {}

