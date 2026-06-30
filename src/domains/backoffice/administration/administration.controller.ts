import { Controller, Get, Post, Query, UploadedFile as UploadedFileDecorator, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseAuth } from 'src/infrastructure/security/decorators/use-auth.decorator';
import {
    CoreCompanyListItemDto,
    CoreUserListItemDto,
} from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';
import { UploadedFile } from 'src/shared/interfaces/uploaded-file.interface';
import { AdministrationService } from './administration.service';
import { ListCompaniesQueryDto } from './dto/list-companies-query.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { RutExtractionResultDto } from './dto/rut-extraction-result.dto';

@Controller({ path: 'administration', version: '1' })
export class AdministrationController {
    constructor(private readonly administrationService: AdministrationService) { }

    @Get('companies/list')
    @UseAuth('admin')
    async listCompanies(
        @Query() query: ListCompaniesQueryDto,
    ): Promise<PaginatedResult<CoreCompanyListItemDto>> {
        return this.administrationService.listCompanies(query);
    }

    @Post('companies/rut/extract')
    @UseAuth('admin')
    @UseInterceptors(FileInterceptor('file'))
    async extractCompanyRut(
        @UploadedFileDecorator() file: UploadedFile,
    ): Promise<RutExtractionResultDto> {
        return this.administrationService.extractCompanyRut(file);
    }

    @Post('companies/rut/extract-prefill')
    @UseAuth('admin')
    @UseInterceptors(FileInterceptor('file'))
    async extractCompanyRutPrefill(
        @UploadedFileDecorator() file: UploadedFile,
    ): Promise<RutExtractionResultDto> {
        return this.administrationService.extractCompanyRutPrefill(file);
    }

    @Post('companies/rut/extract-full')
    @UseAuth('admin')
    @UseInterceptors(FileInterceptor('file'))
    async extractCompanyRutFull(
        @UploadedFileDecorator() file: UploadedFile,
    ): Promise<RutExtractionResultDto> {
        return this.administrationService.extractCompanyRutFull(file);
    }

    @Get('users/list')
    @UseAuth('admin')
    async listUsers(
        @Query() query: ListUsersQueryDto,
    ): Promise<PaginatedResult<CoreUserListItemDto>> {
        return this.administrationService.listUsers(query);
    }
}


