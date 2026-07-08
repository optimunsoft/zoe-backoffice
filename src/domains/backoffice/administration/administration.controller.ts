import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query, Req, UploadedFile as UploadedFileDecorator, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseAuth } from 'src/infrastructure/security/decorators/use-auth.decorator';
import {
    AssignCoreCompanyUserRequestDto,
    AssignCoreCompanyModuleDto,
    CreateCoreCompanyDto,
    CoreCompanyExtendedListItemDto,
    CoreCompanyModuleAssignmentDto,
    CoreCompanyRoleDetailDto,
    CoreCompanySummaryDto,
    CoreCompanyUserAssignmentDto,
    CoreModuleDeleteDto,
    CoreModuleDto,
    CoreUserAccountDto,
    CoreUserExtendedListItemDto,
    CreateCoreUserDto,
    CreateCoreModuleDto,
    SearchCoreModulesDto,
    UnassignCoreCompanyUserDto,
    UpdateCoreAccountDemoDto,
    UpdateCoreCompanyDto,
    UpdateCoreModuleDto,
    UpdateCoreCompanyStatusDto,
    UpdateCoreUserDto,
    UpdateCoreUserStatusDto,
} from 'src/infrastructure/integrations/core/dto/backoffice-core.dto';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';
import { UploadedFile } from 'src/shared/interfaces/uploaded-file.interface';
import { AdministrationService } from './administration.service';
import { ListCompaniesQueryDto } from './dto/list-companies-query.dto';
import { ListUsersExtendedQueryDto } from './dto/list-users-extended-query.dto';
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
     * Edita una empresa desde administracion sin gestionar su estado activo.
     *
     * @param companyId Identificador de la empresa a editar.
     * @param dto Datos editables de empresa.
     * @returns Resumen de la empresa editada en CORE.
     */
    @Put('companies/edit/:companyId')
    @UseAuth('admin')
    async updateCompany(
        @Param('companyId') companyId: string,
        @Body() dto: UpdateCoreCompanyDto,
    ): Promise<CoreCompanySummaryDto> {
        return this.administrationService.updateCompany(companyId, dto);
    }

    /**
     * Cambia el estado activo/inactivo de una empresa desde administracion.
     *
     * @param companyId Identificador de la empresa.
     * @param dto Estado deseado de la empresa.
     * @returns Resumen de la empresa actualizada en CORE.
     */
    @Patch('companies/:companyId/status')
    @UseAuth('admin')
    async updateCompanyStatus(
        @Param('companyId', ParseUUIDPipe) companyId: string,
        @Body() dto: UpdateCoreCompanyStatusDto,
    ): Promise<CoreCompanySummaryDto> {
        return this.administrationService.updateCompanyStatus(companyId, dto);
    }

    /**
     * Asocia un usuario a una empresa desde administracion.
     *
     * @param dto Identificadores de empresa/usuario y marca de propietario.
     * @returns Relacion creada o actualizada en CORE.
     */
    @Post('companies/users/assign')
    @UseAuth('admin')
    async assignCompanyUser(
        @Body() dto: AssignCoreCompanyUserRequestDto,
    ): Promise<CoreCompanyUserAssignmentDto> {
        return this.administrationService.assignCompanyUser({
            companyId: dto.companyId,
            userId: dto.userId,
            isOwner: dto.isOwner,
        });
    }

    /**
     * Desasocia un usuario de una empresa desde administracion.
     *
     * @param dto Identificadores de empresa y usuario.
     * @returns Relacion removida en CORE.
     */
    @Post('companies/users/unassign')
    @UseAuth('admin')
    async unassignCompanyUser(
        @Body() dto: UnassignCoreCompanyUserDto,
    ): Promise<CoreCompanyUserAssignmentDto> {
        return this.administrationService.unassignCompanyUser(dto);
    }

    /**
     * Asocia o desactiva un modulo para una empresa desde administracion.
     *
     * @param moduleId Identificador del modulo.
     * @param dto Identificador de empresa y estado activo deseado.
     * @returns Asignacion del modulo a la empresa en CORE.
     */
    @Patch('modules/:moduleId/companies')
    @UseAuth('admin')
    async assignCompanyModule(
        @Param('moduleId', ParseUUIDPipe) moduleId: string,
        @Body() dto: AssignCoreCompanyModuleDto,
    ): Promise<CoreCompanyModuleAssignmentDto> {
        return this.administrationService.assignCompanyModule(moduleId, dto);
    }

    /**
     * Lista modulos para administracion.
     *
     * @param query Texto libre y paginacion.
     * @returns Pagina de modulos registrados en CORE.
     */
    @Get('modules/list')
    @UseAuth('admin')
    async listModules(
        @Query() query: SearchCoreModulesDto,
    ): Promise<PaginatedResult<CoreModuleDto>> {
        return this.administrationService.listModules(query);
    }

    /**
     * Crea un modulo desde administracion.
     *
     * @param dto Datos del modulo.
     * @returns Modulo creado en CORE.
     */
    @Post('modules/create')
    @UseAuth('admin')
    async createModule(
        @Body() dto: CreateCoreModuleDto,
    ): Promise<CoreModuleDto> {
        return this.administrationService.createModule(dto);
    }

    /**
     * Consulta un modulo por identificador.
     *
     * @param moduleId Identificador del modulo.
     * @returns Modulo encontrado o `null` cuando CORE no lo encuentra.
     */
    @Get('modules/:moduleId')
    @UseAuth('admin')
    async findModuleById(
        @Param('moduleId', ParseUUIDPipe) moduleId: string,
    ): Promise<CoreModuleDto | null> {
        return this.administrationService.findModuleById(moduleId);
    }

    /**
     * Edita un modulo desde administracion.
     *
     * @param moduleId Identificador del modulo.
     * @param dto Datos editables del modulo.
     * @returns Modulo actualizado en CORE.
     */
    @Put('modules/edit/:moduleId')
    @UseAuth('admin')
    async updateModule(
        @Param('moduleId', ParseUUIDPipe) moduleId: string,
        @Body() dto: UpdateCoreModuleDto,
    ): Promise<CoreModuleDto> {
        return this.administrationService.updateModule(moduleId, dto);
    }

    /**
     * Elimina un modulo sin asignaciones desde administracion.
     *
     * @param moduleId Identificador del modulo.
     * @returns Identificador del modulo eliminado.
     */
    @Delete('modules/delete/:moduleId')
    @UseAuth('admin')
    async deleteModule(
        @Param('moduleId', ParseUUIDPipe) moduleId: string,
    ): Promise<CoreModuleDeleteDto> {
        return this.administrationService.deleteModule(moduleId);
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

    /**
     * Extrae datos del RUT de una empresa usando el modo de precarga por defecto.
     *
     * @param file PDF del RUT cargado en el campo `file`.
     * @returns Datos extraidos, precarga normalizada y resolucion de catalogos.
     */
    @Post('companies/rut/extract')
    @UseAuth('admin')
    @UseInterceptors(FileInterceptor('file'))
    async extractCompanyRut(
        @UploadedFileDecorator() file: UploadedFile,
    ): Promise<RutExtractionResultDto> {
        return this.administrationService.extractCompanyRut(file);
    }

    /**
     * Extrae datos basicos del RUT para precargar el formulario de empresa.
     *
     * @param file PDF del RUT cargado en el campo `file`.
     * @returns Datos extraidos y equivalencias de catalogos para la precarga.
     */
    @Post('companies/rut/extract-prefill')
    @UseAuth('admin')
    @UseInterceptors(FileInterceptor('file'))
    async extractCompanyRutPrefill(
        @UploadedFileDecorator() file: UploadedFile,
    ): Promise<RutExtractionResultDto> {
        return this.administrationService.extractCompanyRutPrefill(file);
    }

    /**
     * Extrae la informacion completa disponible en el RUT de una empresa.
     *
     * @param file PDF del RUT cargado en el campo `file`.
     * @returns Datos completos extraidos, precarga y advertencias de resolucion.
     */
    @Post('companies/rut/extract-full')
    @UseAuth('admin')
    @UseInterceptors(FileInterceptor('file'))
    async extractCompanyRutFull(
        @UploadedFileDecorator() file: UploadedFile,
    ): Promise<RutExtractionResultDto> {
        return this.administrationService.extractCompanyRutFull(file);
    }

    /**
     * Lista usuarios para administracion con informacion extendida de cuenta,
     * empresas y sesiones.
     *
     * @param query Filtros de busqueda, estado y paginacion.
     * @returns Pagina de usuarios enriquecidos desde CORE.
     */
    @Get('users/list')
    @UseAuth('admin')
    async listUsersExtended(
        @Query() query: ListUsersExtendedQueryDto,
    ): Promise<PaginatedResult<CoreUserExtendedListItemDto>> {
        return this.administrationService.listUsersExtended(query);
    }

    /**
     * Crea un usuario ROOT desde administracion.
     *
     * @param dto Datos personales, cuenta y configuracion inicial del usuario.
     * @returns Usuario creado con informacion extendida desde CORE.
     */
    @Post('users/create')
    @UseAuth('admin')
    async createUser(
        @Req() request: { user?: { email?: string } },
        @Body() dto: CreateCoreUserDto,
    ): Promise<CoreUserExtendedListItemDto> {
        return this.administrationService.createUser(request.user, dto);
    }

    /**
     * Edita los datos de un usuario ROOT desde administracion.
     *
     * @param userId Identificador del usuario.
     * @param dto Datos editables del usuario.
     * @returns Usuario actualizado con informacion extendida desde CORE.
     */
    @Put('users/edit/:userId')
    @UseAuth('admin')
    async updateUser(
        @Req() request: { user?: { email?: string } },
        @Param('userId', ParseUUIDPipe) userId: string,
        @Body() dto: UpdateCoreUserDto,
    ): Promise<CoreUserExtendedListItemDto> {
        return this.administrationService.updateUser(request.user, userId, dto);
    }

    /**
     * Cambia el estado activo/inactivo de un usuario ROOT desde administracion.
     *
     * @param userId Identificador del usuario.
     * @param dto Estado deseado del usuario.
     * @returns Usuario actualizado con informacion extendida desde CORE.
     */
    @Patch('users/:userId/status')
    @UseAuth('admin')
    async updateUserStatus(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Body() dto: UpdateCoreUserStatusDto,
    ): Promise<CoreUserExtendedListItemDto> {
        return this.administrationService.updateUserStatus(userId, dto);
    }

    /**
     * Cambia la marca demo de una cuenta desde administracion.
     *
     * @param accountId Identificador de la cuenta.
     * @param dto Estado demo deseado.
     * @returns Cuenta actualizada en CORE.
     */
    @Patch('accounts/:accountId/demo')
    @UseAuth('admin')
    async updateAccountDemo(
        @Param('accountId', ParseUUIDPipe) accountId: string,
        @Body() dto: UpdateCoreAccountDemoDto,
    ): Promise<CoreUserAccountDto> {
        return this.administrationService.updateAccountDemo(accountId, dto);
    }

    /**
     * Consulta el detalle extendido de un usuario por identificador.
     *
     * @param userId Identificador del usuario.
     * @returns Usuario encontrado o `null` cuando CORE no lo encuentra.
     */
    @Get('users/:userId')
    @UseAuth('admin')
    async findUserById(
        @Param('userId', ParseUUIDPipe) userId: string,
    ): Promise<CoreUserExtendedListItemDto | null> {
        return this.administrationService.findUserById(userId);
    }
}
