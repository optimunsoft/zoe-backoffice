import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from 'src/infrastructure/security/security.module';
import { SharedModule } from 'src/shared/shared.module';
import { DemonstrationsController } from './demonstrations.controller';
import { DemonstrationsService } from './demonstrations.service';
import { Demonstration } from './entities/demonstration.entity';
import { DemonstrationRepository } from './repositories/DemonstrationRepository';

@Module({
  imports: [TypeOrmModule.forFeature([Demonstration]), SharedModule, SecurityModule],
  providers: [DemonstrationsService, DemonstrationRepository],
  controllers: [DemonstrationsController],
  exports: [DemonstrationsService, DemonstrationRepository],
})
export class DemonstrationsModule {}
