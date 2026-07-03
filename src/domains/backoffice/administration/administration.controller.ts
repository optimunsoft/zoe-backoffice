import { Body, Controller, Get, Param, Post, Query, UploadedFile as UploadedFileDecorator, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseAuth } from 'src/infrastructure/security/decorators/use-auth.decorator';
import {
    CreateCoreCompanyDto,
    CoreCompanyExtendedListItemDto,
    CoreCompanyRoleDetailDto,
    CoreCompanySummaryDto,
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

    /**
     * Lista empresas para administracion con informacion extendida liviana.
     *
     * @param query Filtros de busqueda, ubicacion y paginacion.
     * @returns Pagina de empresas con ubicacion, roles resumidos y usuarios asociados.
     */
    @Get('companies/list')
    @UseAuth('admin')
    async listCompanies(
        @Query() query: ListCompaniesQueryDto,
    ): Promise<PaginatedResult<CoreCompanyExtendedListItemDto>> {
        return this.administrationService.listCompanies(query);
    }

    /**
     * Crea una empresa desde administracion y la asocia a un usuario propietario.
     *
     * @param dto Datos base de empresa y usuario propietario.
     * @returns Resumen de la empresa creada en CORE.
     */
    @Post('companies/create')
    @UseAuth('admin')
    async createCompany(
        @Body() dto: CreateCoreCompanyDto,
    ): Promise<CoreCompanySummaryDto> {
        return this.administrationService.createCompany(dto);
    }

    /**
     * Consulta el detalle de un rol de empresa con sus permisos.
     *
     * @param companyId Identificador de la empresa propietaria del rol.
     * @param roleId Identificador del rol a consultar.
     * @returns Detalle del rol con metadata y permisos asociados.
     */
    @Get('companies/:companyId/roles/:roleId')
    @UseAuth('admin')
    async findCompanyRole(
        @Param('companyId') companyId: string,
        @Param('roleId') roleId: string,
    ): Promise<CoreCompanyRoleDetailDto> {
        return this.administrationService.findCompanyRole(companyId, roleId);
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
