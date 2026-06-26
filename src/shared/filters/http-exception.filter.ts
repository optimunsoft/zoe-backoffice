// src/common/filters/http-exception.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';

interface ErrorResponse {
    status: boolean;
    message: string;
    response: any;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let statusCode: number;
        let message: string;
        let responseData: any;

        if (exception instanceof HttpException) {
            // NestJS Exceptions (HttpException)
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (
                statusCode === HttpStatus.BAD_REQUEST &&
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null &&
                Array.isArray((exceptionResponse as any).message)
            ) {
                message = 'Verifique los parámetros de la solicitud';
                responseData = (exceptionResponse as any).message;
            } else if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null
            ) {
                const res: any = exceptionResponse;
                message = res.message || null;
                responseData = res.response || res.errors || null;
            }

            // Exception dep
            this.logger.error(
                `Unexpected error: ${exception}`,
                (exception as any).stack || '',
            );
        } else {
            // Non Controlled Exception
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Ha ocurrido un error inesperado.';

            // Exception dep
            this.logger.error(
                `Unexpected error: ${exception}`,
                (exception as any).stack || '',
            );
        }

        const errorResponse: ErrorResponse = {
            status: false,
            message: message || 'Ha ocurrido un error inesperado (2).',
            response: responseData,
        };

        response.status(statusCode).json(errorResponse);
    }
}
