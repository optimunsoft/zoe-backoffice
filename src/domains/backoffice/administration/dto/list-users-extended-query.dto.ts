import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SearchCoreUserExtendedListDto } from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

export class ListUsersExtendedQueryDto extends PaginationQueryDto implements SearchCoreUserExtendedListDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @Type(() => String)
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @Type(() => String)
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isDemo?: boolean;

  @IsOptional()
  @IsEnum(['USUARIO', 'SUBUSUARIO'])
  type?: 'USUARIO' | 'SUBUSUARIO';
}
