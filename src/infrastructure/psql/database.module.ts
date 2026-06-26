import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from 'src/config/env.config';
import { Demonstration } from 'src/domains/backoffice/demonstrations/entities/demonstration.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: envs.db_host_address,
            port: envs.db_port,
            username: envs.db_user_name,
            password: envs.db_password,
            database: envs.db_name,
            synchronize: envs.db_sync_mode,
            poolSize: 120,
            entities: [
                Demonstration,
            ],
            autoLoadEntities: false,
            retryAttempts: 2,
            ssl: {
                rejectUnauthorized: false,
            },
            logging: false,
            subscribers: [],
            migrations: [],
        }),
    ]
})
export class DatabaseModule { }
