import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';
import { envs } from './config/env.config';
import { BadRequestException, Logger, ValidationError, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

const REQUEST_BODY_LIMIT = '50mb';

async function bootstrap() {

	// main logs
	const logger = new Logger('MainApp');

	// app
	const app = await NestFactory.create(AppModule, {
		bodyParser: false,
	});

	// Limite explicito para cuerpos JSON y formularios/urlencoded.
	app.use(json({ limit: REQUEST_BODY_LIMIT }));
	app.use(urlencoded({ limit: REQUEST_BODY_LIMIT, extended: true }));

	// Si la app corre detrás de un proxy (Load Balancer), usar la IP real del cliente para rate limiting
	const proxyHops = Number(envs.trust_proxy_hops || 0);
	if (proxyHops > 0) {
		app.getHttpAdapter().getInstance().set('trust proxy', proxyHops);
	}

	// Configuración de CORS
	app.enableCors({
		origin: true, // En producción, especificar los orígenes permitidos 
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	});

	// Configuración de Helmet
	app.use(helmet());

	app.useGlobalInterceptors(new TransformInterceptor());
	app.useGlobalFilters(new AllExceptionsFilter());

	// Configurar versionado por URI
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: '1',
		prefix: 'api/v',
	});

	const config = new DocumentBuilder()
		.setTitle('ERP API NEST')
		.setDescription('ZOENUBE BACKEND REFACTOR')
		.setVersion('1.0')
		.addTag('zoe')
		.build();
	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, documentFactory);

	//global pipes
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
			exceptionFactory: (errors: ValidationError[]) => {
				const formatErrors = (errorList: ValidationError[]): string[] => {
					const messages: string[] = [];
					
					for (const error of errorList) {
						// Manejar errores de whitelist
						if (error.constraints?.whitelistValidation) {
							messages.push(`La propiedad '${error.property}' no está permitida.`);
							continue;
						}
						
						// Manejar errores con constraints (validaciones directas)
						if (error.constraints && Object.keys(error.constraints).length > 0) {
							const constraintMessages = Object.values(error.constraints);
							messages.push(...constraintMessages);
						}
						
						// Manejar errores anidados (ValidateNested)
						if (error.children && error.children.length > 0) {
							const nestedMessages = formatErrors(error.children);
							// Prefijar los mensajes anidados con el nombre de la propiedad padre
							const prefixedMessages = nestedMessages.map(msg => 
								`${error.property}.${msg}`
							);
							messages.push(...prefixedMessages);
						}
					}
					
					return messages;
				};
				
				const errorMessages = formatErrors(errors);
				throw new BadRequestException(errorMessages);
			},
		})
	)

	await app.listen(envs.port_app);
	logger.log(`App run on port: ${envs.port_app}`);
}


bootstrap();
