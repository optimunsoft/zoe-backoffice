import { Module } from '@nestjs/common';
import { BackofficeModule } from './domains/backoffice/backoffice.module';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './infrastructure/psql/database.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { S3Module } from './infrastructure/s3/s3.module';

@Module({
	imports: [
		BackofficeModule,
		SharedModule,
		DatabaseModule,
		S3Module,

		// Rate limiting global
		ThrottlerModule.forRoot([
			{
				ttl: 60, // Ventana de tiempo en segundos
				limit: 100, // Máx. solicitudes por IP en la ventana
			},
		]),

		// Cache-manager
		CacheModule.register({
			isGlobal: true,
			ttl: 1000, // 1 segundos
		}),

		// Cqrs para procesos puntuales
		CqrsModule.forRoot(),

	],
	controllers: [],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: CacheInterceptor,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {
	constructor(/* private dataSource: DataSource */) { }
}
