import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { DemonstrationStatus } from '../entities/demonstration.entity';

export class UpdateDemonstrationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  productInterest?: string | null;

  @IsOptional()
  @IsEnum(DemonstrationStatus)
  status?: DemonstrationStatus;
}
