import { IGenericRepository } from 'src/shared/interfaces/IGenericRepository';
import { Demonstration } from '../entities/demonstration.entity';

export interface IDemonstrationRepository extends IGenericRepository<Demonstration> {}
