import { Request } from "express";
import { DataSource, EntityManager, Repository } from "typeorm";
import { AsyncLocalStorage } from "async_hooks";
import { ENTITY_MANAGER_KEY } from "../../shared/interceptors/transactional.interceptor";

// AsyncLocalStorage para almacenar el EntityManager cuando no hay request (ej: workers de BullMQ)
export const transactionContext = new AsyncLocalStorage<{ entityManager: EntityManager }>();

export class BaseRepository {

    constructor(
        private dataSource: DataSource, private request: Request
    ) { }

    protected getRepository<T>(entityClass: new () => T): Repository<T> {
        // 1. Intentar obtener del request (caso normal de HTTP)
        const requestEntityManager: EntityManager | undefined = this.request?.[ENTITY_MANAGER_KEY];
        if (requestEntityManager) {
            return requestEntityManager.getRepository(entityClass);
        }

        // 2. Intentar obtener del AsyncLocalStorage (caso de workers/transacciones manuales)
        const context = transactionContext.getStore();
        if (context?.entityManager) {
            return context.entityManager.getRepository(entityClass);
        }

        // 3. Fallback al manager del dataSource (sin transacción)
        return this.dataSource.manager.getRepository(entityClass);
    }

    protected getQueryRunner(): any {
        // 1. Intentar obtener del request
        const requestEntityManager: EntityManager | undefined = this.request?.[ENTITY_MANAGER_KEY];
        if (requestEntityManager && (requestEntityManager as any).queryRunner) {
            return (requestEntityManager as any).queryRunner;
        }

        // 2. Intentar obtener del AsyncLocalStorage
        const context = transactionContext.getStore();
        if (context?.entityManager && (context.entityManager as any).queryRunner) {
            return (context.entityManager as any).queryRunner;
        }

        return null;
    }

    protected async setLocalSessionVariable(key: string, value: string | number): Promise<void> {
        const queryRunner = this.getQueryRunner();
        if (queryRunner) {
            // Usar el queryRunner del interceptor transaccional
            await queryRunner.query(`SET LOCAL ${key} TO '${value}'`);
        } else {
            // Fallback a dataSource si no hay transacción activa
            await this.dataSource.query(`SET LOCAL ${key} TO '${value}'`);
        }
    }

    protected async getLocalSessionVariable(key: string): Promise<string | number | null> {
        const queryRunner = this.getQueryRunner();
        if (queryRunner) {
            // Usar el queryRunner del interceptor transaccional
            const result = await queryRunner.query(`SELECT current_setting('${key}', 't')`);
            return result[0]?.current_setting || null;
        } else {
            // Fallback a dataSource si no hay transacción activa
            const result = await this.dataSource.query(`SELECT current_setting('${key}', 't')`);
            return result[0]?.current_setting || null;
        }
    }

}