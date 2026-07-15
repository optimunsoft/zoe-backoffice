import { HttpService } from '@nestjs/axios';
import {
    BadGatewayException,
    BadRequestException,
    Inject,
    Injectable,
    Logger
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AxiosRequestConfig } from 'axios';
import { envs } from 'src/config/env.config';
import {
    AssignCoreCompanyUserDto,
    AssignCoreCompanyModuleDto,
    CreateCoreCompanyDto,
    CoreCatalog,
    CoreCatalogMatchDto,
    CoreCompanyApiKeyDto,
    CoreCompanyExtendedListItemDto,
    CoreCompanyExtendedPageDto,
    CoreCompanyListItemDto,
    CoreCompanyPageDto,
    CoreCompanyDto,
    CoreCompanyLogoDto,
    CoreCompanyLogoUploadDto,
    CoreCompanyModuleAssignmentDto,
    CoreCompanyRoleDetailDto,
    CoreCompanySummaryDto,
    CoreCompanyUserAssignmentDto,
    CoreDemoUserDeletionDto,
    CoreModuleDeleteDto,
    CoreModuleDto,
    CoreModulePageDto,
    CoreResolvedCatalogDto,
    CoreThirdPartyDto,
    CoreThirdPartyPageDto,
    CoreThirdPartyUpsertResultDto,
    CoreUserAccountDto,
    CoreUserExtendedListItemDto,
    CoreUserExtendedPageDto,
    CoreUserDto,
    CoreUserListItemDto,
    CoreUserListPageDto,
    CoreUserPageDto,
    CreateCoreModuleDto,
    CreateCoreUserDto,
    SearchCoreThirdPartiesDto,
    SearchCoreUsersDto,
    SearchCoreCompaniesDto,
    SearchCoreModulesDto,
    SearchCoreUserExtendedListDto,
    SearchCoreUserListDto,
    MatchCoreCatalogItemDto,
    UnassignCoreCompanyUserDto,
    UpsertCoreThirdPartyDto,
    UpdateCoreAccountDemoDto,
    UpdateCoreCompanyDto,
    UpdateCoreModuleDto,
    UpdateCoreCompanyStatusDto,
    UpdateCoreUserDto,
    UpdateCoreUserStatusDto,
} from './dto/backoffice-core.dto';
import { IBackofficeCoreIntegration } from './interfaces/backoffice-core.interface';
import { InternalCoreResponse } from './interfaces/internal-core-response.interface';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';
import { UploadedFile } from 'src/shared/interfaces/uploaded-file.interface';

@Injectable()
export class BackofficeCoreService implements IBackofficeCoreIntegration {
    private readonly batchSize = 500;
    private readonly logger: Logger = new Logger(BackofficeCoreService.name);

    constructor (
        private readonly httpService: HttpService,
    ) {}

    /**
     * Verifica que una empresa exista en CORE y que la sesion proporcionada
     * tenga relacion con ella.
     *
     * @param companyId Identificador de la empresa.
     * @param sessionKey Token de sesion enviado como bearer token.
     * @returns `true` cuando CORE confirma la existencia de la empresa.
     */
    async companyExists(companyId: string, sessionKey: string): Promise<boolean> {
        try {
            const response = await this.request<{ exists: boolean }>({
                url: `/api/v1/internal/core/companies/${companyId}/exists`,
                method: 'GET',
                headers: { Authorization: `Bearer ${sessionKey}` },
            });
            return response.exists;
        } catch (error: any) {
            this.throwCoreError(error, 'No fue posible validar la empresa en CORE.');
        }
    }

    /**
     * Consulta la informacion completa de una empresa en CORE.
     *
     * @param companyId Identificador de la empresa.
     * @returns La empresa validada o `null` cuando CORE responde 404.
     */
    async findCompanyById(companyId: string): Promise<CoreCompanyDto | null> {
        return this.findById(
            `/api/v1/internal/core/companies/${companyId}`,
            CoreCompanyDto,
            'No fue posible consultar la empresa en CORE.',
        );
    }

    /**
     * Obtiene el logo de una empresa como URL temporal o contenido Base64.
     *
     * @param companyId Identificador de la empresa.
     * @param returnBase64 Indica si el logo debe retornarse en Base64.
     */
    async getCompanyLogo(
        companyId: string,
        returnBase64 = false,
    ): Promise<CoreCompanyLogoDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/companies/${companyId}/logo`,
                method: 'GET',
                params: { base64: returnBase64 },
            },
            CoreCompanyLogoDto,
        );
    }

    /**
     * Sube el logo de una empresa en CORE mediante multipart/form-data.
     *
     * @param companyId Identificador de la empresa.
     * @param file Archivo recibido desde backoffice.
     */
    async uploadCompanyLogo(
        companyId: string,
        file: UploadedFile,
    ): Promise<CoreCompanyLogoUploadDto> {
        const formData = new (globalThis as any).FormData();
        const blob = new (globalThis as any).Blob([file.buffer], { type: file.mimetype });
        formData.append('logo', blob, file.originalname);

        return this.requestDto(
            {
                url: `/api/v1/internal/core/companies/${companyId}/logo`,
                method: 'POST',
                data: formData,
            },
            CoreCompanyLogoUploadDto,
        );
    }

    /**
     * Genera una API key para una empresa en CORE.
     *
     * @param companyId Identificador de la empresa.
     */
    async generateCompanyApiKey(companyId: string): Promise<CoreCompanyApiKeyDto> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/companies/generate-api-key',
                method: 'POST',
                params: { companyId },
            },
            CoreCompanyApiKeyDto,
        );
    }

    /**
     * Obtiene la API key de una empresa en CORE.
     *
     * @param companyId Identificador de la empresa.
     */
    async getCompanyApiKey(companyId: string): Promise<CoreCompanyApiKeyDto> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/companies/get-api-key',
                method: 'GET',
                params: { companyId },
            },
            CoreCompanyApiKeyDto,
        );
    }

    /**
     * Crea una empresa en CORE asociandola al usuario propietario indicado.
     *
     * @param data Datos base de la empresa y usuario propietario.
     */
    async createCompany(data: CreateCoreCompanyDto): Promise<CoreCompanySummaryDto> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/companies/create',
                method: 'POST',
                data,
            },
            CoreCompanySummaryDto,
        );
    }

    /**
     * Edita una empresa en CORE sin gestionar su estado activo/inactivo.
     *
     * @param companyId Identificador de la empresa.
     * @param data Datos editables de la empresa.
     */
    async updateCompany(companyId: string, data: UpdateCoreCompanyDto): Promise<CoreCompanySummaryDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/companies/edit/${companyId}`,
                method: 'PUT',
                data,
            },
            CoreCompanySummaryDto,
        );
    }

    /**
     * Cambia el estado activo/inactivo de una empresa en CORE.
     *
     * @param companyId Identificador de la empresa.
     * @param data Estado deseado de la empresa.
     */
    async updateCompanyStatus(companyId: string, data: UpdateCoreCompanyStatusDto): Promise<CoreCompanySummaryDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/companies/${companyId}/status`,
                method: 'PATCH',
                data,
            },
            CoreCompanySummaryDto,
        );
    }

    /**
     * Asocia un usuario a una empresa en CORE.
     *
     * @param data Identificadores de empresa/usuario y marca de propietario.
     */
    async assignCompanyUser(data: AssignCoreCompanyUserDto): Promise<CoreCompanyUserAssignmentDto> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/companies/users/assign',
                method: 'POST',
                data: {
                    companyId: data.companyId,
                    userId: data.userId,
                    isOwner: data.isOwner,
                },
            },
            CoreCompanyUserAssignmentDto,
        );
    }

    /**
     * Desasocia un usuario de una empresa en CORE.
     *
     * @param data Identificadores de empresa y usuario.
     */
    async unassignCompanyUser(data: UnassignCoreCompanyUserDto): Promise<CoreCompanyUserAssignmentDto> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/companies/users/unassign',
                method: 'POST',
                data,
            },
            CoreCompanyUserAssignmentDto,
        );
    }

    /**
     * Asocia o desactiva un modulo para una empresa en CORE.
     *
     * @param moduleId Identificador del modulo.
     * @param data Identificador de empresa y estado activo deseado.
     */
    async assignCompanyModule(
        moduleId: string,
        data: AssignCoreCompanyModuleDto,
    ): Promise<CoreCompanyModuleAssignmentDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/modules/${moduleId}/companies`,
                method: 'PATCH',
                data,
            },
            CoreCompanyModuleAssignmentDto,
        );
    }

    /**
     * Lista modulos desde CORE para administracion.
     *
     * @param params Texto libre y paginacion.
     */
    async searchModules(params: SearchCoreModulesDto): Promise<PaginatedResult<CoreModuleDto>> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/modules/list',
                method: 'GET',
                params,
            },
            CoreModulePageDto,
        );
    }

    /**
     * Consulta un modulo por identificador.
     *
     * @param moduleId Identificador del modulo.
     */
    async findModuleById(moduleId: string): Promise<CoreModuleDto | null> {
        return this.findById(
            `/api/v1/internal/core/modules/${moduleId}`,
            CoreModuleDto,
            'No fue posible consultar el modulo en CORE.',
        );
    }

    /**
     * Crea un modulo en CORE.
     *
     * @param data Datos del modulo.
     */
    async createModule(data: CreateCoreModuleDto): Promise<CoreModuleDto> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/modules/create',
                method: 'POST',
                data,
            },
            CoreModuleDto,
        );
    }

    /**
     * Edita un modulo en CORE.
     *
     * @param moduleId Identificador del modulo.
     * @param data Datos editables.
     */
    async updateModule(moduleId: string, data: UpdateCoreModuleDto): Promise<CoreModuleDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/modules/edit/${moduleId}`,
                method: 'PUT',
                data,
            },
            CoreModuleDto,
        );
    }

    /**
     * Elimina un modulo sin asignaciones en CORE.
     *
     * @param moduleId Identificador del modulo.
     */
    async deleteModule(moduleId: string): Promise<CoreModuleDeleteDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/modules/delete/${moduleId}`,
                method: 'DELETE',
            },
            CoreModuleDeleteDto,
        );
    }

    /**
     * Lista empresas desde CORE para las vistas administrativas de backoffice.
     *
     * @param params Filtros, texto libre y paginacion.
     */
    async searchCompanies(
        params: SearchCoreCompaniesDto,
    ): Promise<PaginatedResult<CoreCompanyListItemDto>> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/companies/list',
                method: 'GET',
                params,
                headers: { 'x-api-key': envs.api_key_internal_core.trim() },
            },
            CoreCompanyPageDto,
        );
    }

    /**
     * Lista empresas desde CORE con relaciones de usuarios, ubicacion y RBAC.
     *
     * @param params Filtros, texto libre y paginacion.
     */
    async searchCompaniesExtended(
        params: SearchCoreCompaniesDto,
    ): Promise<PaginatedResult<CoreCompanyExtendedListItemDto>> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/companies/list-extended',
                method: 'GET',
                params,
            },
            CoreCompanyExtendedPageDto,
        );
    }

    /**
     * Consulta un rol de empresa con sus permisos desde CORE.
     *
     * @param companyId Identificador de la empresa.
     * @param roleId Identificador del rol.
     */
    async findCompanyRole(companyId: string, roleId: string): Promise<CoreCompanyRoleDetailDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/companies/${companyId}/roles/${roleId}`,
                method: 'GET',
            },
            CoreCompanyRoleDetailDto,
        );
    }

    /**
     * Lista usuarios desde CORE para vistas administrativas.
     *
     * @param params Texto libre y paginacion.
     */
    async searchUserList(
        params: SearchCoreUserListDto,
    ): Promise<PaginatedResult<CoreUserListItemDto>> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/users/list',
                method: 'GET',
                params,
            },
            CoreUserListPageDto,
        );
    }

    /**
     * Lista usuarios desde CORE con cuenta, empresas y sesiones.
     *
     * @param params Filtros, texto libre y paginacion.
     */
    async searchUserListExtended(
        params: SearchCoreUserExtendedListDto,
    ): Promise<PaginatedResult<CoreUserExtendedListItemDto>> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/users/list-extended',
                method: 'GET',
                params,
            },
            CoreUserExtendedPageDto,
        );
    }

    /**
     * Consulta el detalle enriquecido de un usuario en CORE.
     *
     * @param userId Identificador del usuario.
     */
    async findUserById(userId: string): Promise<CoreUserExtendedListItemDto | null> {
        return this.findById(
            `/api/v1/internal/core/users/${userId}`,
            CoreUserExtendedListItemDto,
            'No fue posible consultar el usuario en CORE.',
        );
    }

    /**
     * Crea un usuario ROOT en CORE y Auth0.
     *
     * @param data Datos del usuario ROOT.
     */
    async createUser(data: CreateCoreUserDto): Promise<CoreUserExtendedListItemDto> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/users/create',
                method: 'POST',
                data,
            },
            CoreUserExtendedListItemDto,
        );
    }

    /**
     * Edita un usuario ROOT en CORE.
     *
     * @param userId Identificador del usuario.
     * @param data Datos editables.
     */
    async updateUser(userId: string, data: UpdateCoreUserDto): Promise<CoreUserExtendedListItemDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/users/edit/${userId}`,
                method: 'PUT',
                data,
            },
            CoreUserExtendedListItemDto,
        );
    }

    /**
     * Cambia el estado activo/inactivo de un usuario ROOT en CORE.
     *
     * @param userId Identificador del usuario.
     * @param data Estado deseado.
     */
    async updateUserStatus(userId: string, data: UpdateCoreUserStatusDto): Promise<CoreUserExtendedListItemDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/users/${userId}/status`,
                method: 'PATCH',
                data,
            },
            CoreUserExtendedListItemDto,
        );
    }

    /**
     * Solicita a CORE la eliminacion destructiva de un usuario demo.
     *
     * CORE aplica las reglas criticas de seguridad: la cuenta debe ser demo, el
     * usuario debe tener una unica empresa asociada, esa relacion debe ser
     * propietaria y la cuenta no puede tener mas usuarios. CORE elimina primero
     * en base de datos y solo al final intenta limpiar Auth0 sin bloquear si
     * Auth0 falla.
     *
     * @param userId Identificador del usuario demo.
     */
    async deleteDemoUser(userId: string): Promise<CoreDemoUserDeletionDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/users/${userId}/demo`,
                method: 'DELETE',
            },
            CoreDemoUserDeletionDto,
        );
    }

    /**
     * Cambia la marca demo de una cuenta en CORE.
     *
     * @param accountId Identificador de la cuenta.
     * @param data Estado demo deseado.
     */
    async updateAccountDemo(accountId: string, data: UpdateCoreAccountDemoDto): Promise<CoreUserAccountDto> {
        return this.requestDto(
            {
                url: `/api/v1/internal/core/accounts/${accountId}/demo`,
                method: 'PATCH',
                data,
            },
            CoreUserAccountDto,
        );
    }

    /**
     * Consulta el usuario propietario de una empresa.
     *
     * @param companyId Identificador de la empresa.
     * @returns El propietario validado o `null` cuando CORE responde 404.
     */
    async findCompanyOwner(companyId: string): Promise<CoreUserDto | null> {
        return this.findById(
            `/api/v1/internal/core/users/company/${companyId}/owner`,
            CoreUserDto,
            'No fue posible consultar el propietario de la empresa en CORE.',
        );
    }

    /**
     * Resuelve usuarios por identificador. Elimina duplicados y divide
     * solicitudes grandes en lotes del tamano soportado por CORE.
     *
     * @param ids Identificadores de usuario.
     */
    async resolveUsers(ids: string[]): Promise<CoreUserDto[]> {
        return this.resolveInChunks(
            ids,
            chunk => ({
                url: '/api/v1/internal/core/users/resolve',
                method: 'POST',
                data: { ids: chunk },
            }),
            CoreUserDto,
        );
    }

    /**
     * Busca usuarios dentro de un conjunto de identificadores.
     *
     * @param params Filtros, busqueda y datos de paginacion.
     */
    async searchUsers(params: SearchCoreUsersDto): Promise<CoreUserPageDto> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/users/search',
                method: 'POST',
                data: { ...params, ids: [...new Set(params.ids)] },
            },
            CoreUserPageDto,
        );
    }

    /**
     * Consulta un tercero por identificador.
     *
     * @param thirdPartyId Identificador del tercero.
     * @returns El tercero validado o `null` cuando CORE responde 404.
     */
    async findThirdPartyById(thirdPartyId: string): Promise<CoreThirdPartyDto | null> {
        return this.findById(
            `/api/v1/internal/core/third-parties/${thirdPartyId}`,
            CoreThirdPartyDto,
            'No fue posible consultar el tercero en CORE.',
        );
    }

    /**
     * Resuelve terceros de una empresa por identificador, eliminando
     * duplicados y procesando la consulta por lotes.
     *
     * @param companyId Identificador de la empresa.
     * @param ids Identificadores de terceros.
     */
    async resolveThirdParties(
        companyId: string,
        ids: string[],
    ): Promise<CoreThirdPartyDto[]> {
        return this.resolveInChunks(
            ids,
            chunk => ({
                url: '/api/v1/internal/core/third-parties/resolve',
                method: 'POST',
                data: { companyId, ids: chunk },
            }),
            CoreThirdPartyDto,
        );
    }

    /**
     * Resuelve terceros de una empresa por numero de documento. Normaliza los
     * valores, descarta vacios, elimina duplicados y procesa por lotes.
     *
     * @param companyId Identificador de la empresa.
     * @param documentNumbers Numeros de documento de los terceros.
     */
    async resolveThirdPartiesByDocument(
        companyId: string,
        documentNumbers: string[],
    ): Promise<CoreThirdPartyDto[]> {
        return this.resolveInChunks(
            documentNumbers.map(value => value.trim()).filter(Boolean),
            chunk => ({
                url: '/api/v1/internal/core/third-parties/resolve-by-document',
                method: 'POST',
                data: { companyId, documentNumbers: chunk },
            }),
            CoreThirdPartyDto,
        );
    }

    /**
     * Busca terceros de una empresa mediante paginacion y texto libre.
     *
     * @param params Empresa, paginacion y termino opcional de busqueda.
     */
    async searchThirdParties(
        params: SearchCoreThirdPartiesDto,
    ): Promise<CoreThirdPartyPageDto> {
        return this.requestDto(
            {
                url: '/api/v1/internal/core/third-parties/search',
                method: 'POST',
                data: params,
            },
            CoreThirdPartyPageDto,
        );
    }

    /**
     * Crea o actualiza un tercero en CORE.
     *
     * Los errores HTTP 400 de CORE se conservan como `BadRequestException`
     * para no perder el detalle de validacion de negocio.
     *
     * @param params Datos normalizados del tercero y contexto de auditoria.
     */
    async upsertThirdParty(
        params: UpsertCoreThirdPartyDto,
    ): Promise<CoreThirdPartyUpsertResultDto> {
        try {
            return await this.requestDto(
                {
                    url: '/api/v1/internal/core/third-parties/upsert',
                    method: 'POST',
                    data: params,
                },
                CoreThirdPartyUpsertResultDto,
            );
        } catch (error: any) {
            if (error instanceof BadRequestException) throw error;
            if (error?.response?.status === 400) {
                throw new BadRequestException(error.response.data);
            }
            this.throwCoreError(error, 'No fue posible guardar el tercero en CORE.');
        }
    }

    /**
     * Resuelve etiquetas de catalogos comunes. Deduplica identificadores,
     * descarta solicitudes vacias y limita cada grupo al maximo soportado.
     *
     * @param requests Catalogos y sus identificadores por resolver.
     */
    async resolveCatalogs(
        requests: Array<{ catalog: CoreCatalog; ids: string[] }>,
    ): Promise<CoreResolvedCatalogDto[]> {
        const items = requests
            .map(request => ({
                catalog: request.catalog,
                ids: [...new Set(request.ids)].slice(0, this.batchSize),
            }))
            .filter(request => request.ids.length > 0);
        if (items.length === 0) return [];

        return this.requestDtoArray(
            {
                url: '/api/v1/internal/common/catalogs/resolve',
                method: 'POST',
                data: { items },
            },
            CoreResolvedCatalogDto,
        );
    }

    /**
     * Resuelve catalogos comunes desde CORE a partir de valores extraidos
     * por texto o codigo. Se usa para convertir datos del RUT en IDs internos
     * antes de precargar formularios administrativos.
     *
     * @param requests Catalogos con codigo, nombre y contexto opcional.
     */
    async matchCatalogs(requests: MatchCoreCatalogItemDto[]): Promise<CoreCatalogMatchDto[]> {
        if (requests.length === 0) return [];

        try {
            return await this.requestDtoArray(
                {
                    url: '/api/v1/internal/common/catalogs/match',
                    method: 'POST',
                    data: { items: requests },
                },
                CoreCatalogMatchDto,
            );
        } catch (error: any) {
            this.throwCoreError(error, 'No fue posible resolver los catalogos del RUT en CORE.');
        }
    }

    /**
     * Ejecuta una consulta puntual y valida el payload contra el DTO recibido.
     * Convierte respuestas HTTP 404 en `null`.
     */
    private async findById<T extends object>(
        path: string,
        dtoClass: new () => T,
        fallback: string,
    ): Promise<T | null> {
        try {
            return await this.requestDto({ url: path, method: 'GET' }, dtoClass);
        } catch (error: any) {
            if (error?.response?.status === 404) return null;
            this.throwCoreError(error, fallback);
        }
    }

    /**
     * Deduplica valores, los divide en lotes, ejecuta las solicitudes en
     * paralelo y combina las respuestas validadas.
     */
    private async resolveInChunks<T extends object>(
        values: string[],
        configFactory: (chunk: string[]) => AxiosRequestConfig,
        dtoClass: new () => T,
    ): Promise<T[]> {
        const unique = [...new Set(values)];
        if (unique.length === 0) return [];

        try {
            const responses = await Promise.all(
                this.chunk(unique, this.batchSize).map(chunk =>
                    this.requestDtoArray(configFactory(chunk), dtoClass),
                ),
            );
            return responses.flat();
        } catch (error: any) {
            this.logger.error(error)
            this.throwCoreError(error, 'No pudimos completar la tarea, intentalo mas tarde. '+ 'Codigo Error: AC-RIC');
        }
    }

    /**
     * Ejecuta una solicitud y transforma su payload en una instancia validada
     * del DTO esperado.
     */
    private async requestDto<T extends object>(
        config: AxiosRequestConfig,
        dtoClass: new () => T,
    ): Promise<T> {
        const data = await this.request<unknown>(config);
        try {
            const dto = plainToInstance(dtoClass, data);
            await validateOrReject(dto, { whitelist: true });
            return dto;
        } catch (error: any) {
            this.logger.error(error)
            throw new BadGatewayException('No pudimos completar la tarea, intentalo mas tarde. '+ 'Codigo Error: AC-RD');
        }
    }

    /**
     * Ejecuta una solicitud cuyo payload es una coleccion y valida cada
     * elemento contra el DTO esperado.
     */
    private async requestDtoArray<T extends object>(
        config: AxiosRequestConfig,
        dtoClass: new () => T,
    ): Promise<T[]> {
        const data = await this.request<unknown[]>(config);
        try {
            const dtos = plainToInstance(dtoClass, data);
            await Promise.all(dtos.map(dto => validateOrReject(dto, { whitelist: true })));
            return dtos;
        } catch (error: any) {
            this.logger.error(error)
            throw new BadGatewayException('No pudimos completar la tarea, intentalo mas tarde. '+ 'Codigo Error: AC-RDA');
        }
    }

    /**
     * Ejecuta una solicitud interna a CORE, aplica la URL base, el timeout y la
     * API key, y extrae `response` del envelope estandar de la aplicacion.
     */
    private async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const { data } = await this.httpService.axiosRef.request<InternalCoreResponse<T>>({
                ...config,
                url: `${envs.api_url_internal_core}${config.url}`,
                timeout: envs.internal_timeout_ms,
                headers: {
                    ...config.headers,
                    'x-api-key-internal': envs.api_key_internal_core.trim(),
                },
            });
            return data.response;
        } catch (error: any) {
            if (error?.response?.status === 400) {
                throw new BadRequestException(error.response.data);
            }
            throw error;
        }
    }

    /**
     * Traduce errores de transporte a una excepcion estable para los
     * consumidores, conservando excepciones de negocio ya normalizadas.
     */
    private throwCoreError(error: any, fallback: string): never {
        if (error instanceof BadGatewayException || error instanceof BadRequestException) {
            throw error;
        }
        throw new BadGatewayException(error?.response?.data?.message || fallback);
    }

    /**
     * Divide una coleccion en grupos consecutivos del tamano indicado.
     */
    private chunk<T>(items: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let index = 0; index < items.length; index += size) {
            chunks.push(items.slice(index, index + size));
        }
        return chunks;
    }
}


