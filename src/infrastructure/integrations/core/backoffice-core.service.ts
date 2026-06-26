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
    CoreCatalog,
    CoreCompanyListItemDto,
    CoreCompanyPageDto,
    CoreCompanyDto,
    CoreCompanyLogoDto,
    CoreResolvedCatalogDto,
    CoreThirdPartyDto,
    CoreThirdPartyPageDto,
    CoreThirdPartyUpsertResultDto,
    CoreUserDto,
    CoreUserListItemDto,
    CoreUserListPageDto,
    CoreUserPageDto,
    SearchCoreThirdPartiesDto,
    SearchCoreUsersDto,
    SearchCoreCompaniesDto,
    SearchCoreUserListDto,
    UpsertCoreThirdPartyDto,
} from './dto/backoffice-core.dto';
import { IBackofficeCoreIntegration } from './interfaces/backoffice-core.interface';
import { InternalCoreResponse } from './interfaces/internal-core-response.interface';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';

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


