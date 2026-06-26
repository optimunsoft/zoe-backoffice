import { Inject, Injectable } from '@nestjs/common';
import {
  CoreCompanyListItemDto,
  CoreUserListItemDto,
  SearchCoreCompaniesDto,
  SearchCoreUserListDto,
} from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';
import {
  BACKOFFICE_CORE_INTEGRATION,
  IBackofficeCoreIntegration,
} from 'src/infrastructure/integrations/core/interfaces/backoffice-core.interface';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';

@Injectable()
export class AdministrationService {
  constructor(
    @Inject(BACKOFFICE_CORE_INTEGRATION)
    private readonly coreIntegration: IBackofficeCoreIntegration,
  ) {}

  async listCompanies(
    query: SearchCoreCompaniesDto,
  ): Promise<PaginatedResult<CoreCompanyListItemDto>> {
    return this.coreIntegration.searchCompanies(query);
  }

  async listUsers(
    query: SearchCoreUserListDto,
  ): Promise<PaginatedResult<CoreUserListItemDto>> {
    return this.coreIntegration.searchUserList(query);
  }
}


