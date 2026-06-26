import { Module } from '@nestjs/common';
import { AdministrationModule } from './administration/administration.module';
import { DemonstrationsModule } from './demonstrations/demonstrations.module';

@Module({
  imports: [AdministrationModule, DemonstrationsModule],
  exports: [AdministrationModule, DemonstrationsModule],
})
export class BackofficeModule {}
