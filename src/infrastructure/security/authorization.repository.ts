import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface RegisteredUser {
    id: string;
    userType: string;
    mustChangePassword: boolean | null;
}

export interface CompanyApiKey {
    id: string;
    apiKey: string;
}

export enum BackofficeRole {
    ADMIN = 'ADMINISTRADOR',
    OPERATOR = 'OPERARIO'
}

@Injectable()
export class AuthorizationRepository {
    constructor(private readonly dataSource: DataSource) {}

    async findRegisteredUserBySub(sub: string): Promise<RegisteredUser | null> {
        const [user] = await this.dataSource.query(
            `
                SELECT
                    id,
                    tipo_usuario AS "userType",
                    cambiar_contrasena AS "mustChangePassword"
                FROM core.usuarios
                WHERE sub = $1
                LIMIT 1
            `,
            [sub],
        );
        return user ?? null;
    }

    async isRootUser(userId: string): Promise<boolean> {
        const [result] = await this.dataSource.query(
            `
                SELECT EXISTS (
                    SELECT 1
                    FROM core.usuarios
                    WHERE id = $1
                      AND tipo_usuario = 'USUARIO'
                ) AS allowed
            `,
            [userId],
        );
        return Boolean(result?.allowed);
    }

    async isCompanyOwner(userId: string, companyId: string): Promise<boolean> {
        const [result] = await this.dataSource.query(
            'SELECT core.is_owner($1,$2) AS allowed',
            [userId, companyId],
        );
        return Boolean(result?.allowed);
    }

    async isCompanyRelated(userId: string, companyId: string): Promise<boolean> {
        const [result] = await this.dataSource.query(
            'SELECT core.is_related($1,$2) AS allowed',
            [userId, companyId],
        );
        return Boolean(result?.allowed);
    }

    async hasPermission(
        userId: string,
        companyId: string,
        module: string,
        resource: string,
        action: string,
    ): Promise<boolean> {
        const [result] = await this.dataSource.query(
            'SELECT core.has_permission($1,$2,$3,$4,$5) AS allowed',
            [userId, companyId, module, resource, action],
        );
        return Boolean(result?.allowed);
    }

    async isAdminEmail(email: string): Promise<boolean> {
        const [result] = await this.dataSource.query(
            'SELECT core.is_admin_email($1) AS allowed',
            [email],
        );
        return Boolean(result?.allowed);
    }

    async isBackofficeAdministratorEmail(email: string): Promise<boolean> {
        const [result] = await this.dataSource.query(
            `
                SELECT EXISTS (
                    SELECT 1
                    FROM core.usuarios
                    WHERE LOWER(correo) = LOWER($1)
                      AND es_admin = TRUE
                      AND rol_bo = 'ADMINISTRADOR'
                      AND eliminado = FALSE
                      AND activo = TRUE
                ) AS allowed
            `,
            [email],
        );
        return Boolean(result?.allowed);
    }

    async hasAccessBackoffice(userId: string, role: BackofficeRole) {
        const [result] = await this.dataSource.query(
            `
                SELECT core.has_access_backoffice($1, $2) AS allowed
            `,
            [userId, role],
        )

        return Boolean(result?.allowed)
    }

    async findCompanyApiKeys(): Promise<CompanyApiKey[]> {
        return this.dataSource.query(
            `
                SELECT id, api_key AS "apiKey"
                FROM core.empresas
                WHERE api_key IS NOT NULL
            `,
        );
    }
}
