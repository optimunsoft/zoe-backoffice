import { Controller, Get, Query } from '@nestjs/common';
import { UseAuth } from 'src/infrastructure/security/decorators/use-auth.decorator';
import {
  CoreCompanyListItemDto,
  CoreUserListItemDto,
} from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';
import { AdministrationService } from './administration.service';
import { ListCompaniesQueryDto } from './dto/list-companies-query.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@Controller({ path: 'administration', version: '1' })
export class AdministrationController {
  constructor(private readonly administrationService: AdministrationService) {}

  @Get('companies/list')
  @UseAuth('admin')
  async listCompanies(
    @Query() query: ListCompaniesQueryDto,
  ): Promise<PaginatedResult<CoreCompanyListItemDto>> {
    return this.administrationService.listCompanies(query);
  }

  @Get('users/list')
  @UseAuth('admin')
  async listUsers(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginatedResult<CoreUserListItemDto>> {
    return this.administrationService.listUsers(query);
  }
}


