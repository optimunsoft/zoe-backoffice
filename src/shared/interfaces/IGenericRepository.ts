import {
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
    SelectQueryBuilder,
    DeepPartial
} from 'typeorm';

export interface IGenericRepository<T> {
    // Lectura
    findAll(options?: FindManyOptions<T>): Promise<T[]>;
    findOne(options: FindOneOptions<T>): Promise<T | null>;
    findById(id: string): Promise<T | null>;
    findBy(where: FindOptionsWhere<T>): Promise<T[]>;
    findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]>;
    count(options?: FindManyOptions<T>): Promise<number>;
    exists(where: FindOptionsWhere<T>): Promise<boolean>;

    // Escritura
    create(data: DeepPartial<T>): T;
    save(entity: DeepPartial<T>): Promise<T>;
    update(id: string, data: DeepPartial<T>): Promise<T>;
    upsert(data: DeepPartial<T> | DeepPartial<T>[], conflict: (keyof T)[]): Promise<T[]>;
    remove(entity: T): Promise<void>;
    delete(id: string): Promise<void>;

    // Escape hatches
    qb(alias?: string): SelectQueryBuilder<T>;
    query(sql: string, params?: any[]): Promise<any>;
}
