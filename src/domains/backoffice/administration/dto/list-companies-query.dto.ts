import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { SearchCoreCompaniesDto } from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

export class ListCompaniesQueryDto extends PaginationQueryDto implements SearchCoreCompaniesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  municipalityId?: string;

  @IsOptional()
  @IsString()
  stateId?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  production?: boolean | string;
}
