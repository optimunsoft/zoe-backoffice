import { Expose } from 'class-transformer';
import { DemonstrationStatus } from '../entities/demonstration.entity';

export class DemonstrationDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() email: string;
  @Expose() phone?: string | null;
  @Expose() scheduledAt: Date;
  @Expose() productInterest?: string | null;
  @Expose() status: DemonstrationStatus;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
