import { IsOptional, IsString } from 'class-validator';
import { SearchCoreUserListDto } from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

export class ListUsersQueryDto extends PaginationQueryDto implements SearchCoreUserListDto {
  @IsOptional()
  @IsString()
  search?: string;
}
