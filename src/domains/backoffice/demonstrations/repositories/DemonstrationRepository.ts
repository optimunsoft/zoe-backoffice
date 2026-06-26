import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import {
  DataSource,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  In,
  SelectQueryBuilder,
} from 'typeorm';
import { BaseRepository } from 'src/infrastructure/psql/BaseRepository';
import { Demonstration } from '../entities/demonstration.entity';
import { IDemonstrationRepository } from '../interfaces/IDemonstrationRepository';

@Injectable({ scope: Scope.REQUEST })
export class DemonstrationRepository extends BaseRepository implements IDemonstrationRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async findAll(options?: FindManyOptions<Demonstration>): Promise<Demonstration[]> {
    return this.getRepository(Demonstration).find(options);
  }

  async findOne(options: FindOneOptions<Demonstration>): Promise<Demonstration | null> {
    return this.getRepository(Demonstration).findOne(options);
  }

  async findById(id: string): Promise<Demonstration | null> {
    return this.getRepository(Demonstration).findOne({ where: { id } });
  }

  async findBy(where: FindOptionsWhere<Demonstration>): Promise<Demonstration[]> {
    return this.getRepository(Demonstration).find({ where });
  }

  async findAndCount(options?: FindManyOptions<Demonstration>): Promise<[Demonstration[], number]> {
    return this.getRepository(Demonstration).findAndCount(options);
  }

  async count(options?: FindManyOptions<Demonstration>): Promise<number> {
    return this.getRepository(Demonstration).count(options);
  }

  create(data: DeepPartial<Demonstration>): Demonstration {
    return this.getRepository(Demonstration).create(data);
  }

  async save(entity: DeepPartial<Demonstration>): Promise<Demonstration> {
    return this.getRepository(Demonstration).save(entity);
  }

  async update(id: string, data: DeepPartial<Demonstration>): Promise<Demonstration> {
    await this.getRepository(Demonstration).update(id, data);
    return (await this.findById(id)) as Demonstration;
  }

  async upsert(data: DeepPartial<Demonstration> | DeepPartial<Demonstration>[], conflict: (keyof Demonstration)[]): Promise<Demonstration[]> {
    await this.getRepository(Demonstration).upsert(data as any, { conflictPaths: conflict as string[] });
    const ids = (Array.isArray(data) ? data : [data]).map(item => item.id).filter(Boolean) as string[];
    return ids.length ? this.getRepository(Demonstration).findBy({ id: In(ids) }) : [];
  }

  async remove(entity: Demonstration): Promise<void> {
    await this.getRepository(Demonstration).remove(entity);
  }

  async delete(id: string): Promise<void> {
    await this.getRepository(Demonstration).delete(id);
  }

  async exists(where: FindOptionsWhere<Demonstration>): Promise<boolean> {
    return (await this.getRepository(Demonstration).count({ where })) > 0;
  }

  qb(alias = 'demonstration'): SelectQueryBuilder<Demonstration> {
    return this.getRepository(Demonstration).createQueryBuilder(alias);
  }

  query(sql: string, params?: any[]): Promise<any> {
    return this.getRepository(Demonstration).query(sql, params);
  }

  async setLocal(key: string, value: string | number): Promise<void> {
    await this.setLocalSessionVariable(key, value);
  }

  async getLocal(key: string): Promise<string | number | null> {
    return this.getLocalSessionVariable(key);
  }
}
