import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface Response<T> {
    status: boolean;
    message: string;
    response: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        return next.handle().pipe(
            map((data) => {
                if (
                    data &&
                    typeof data === 'object' &&
                    'status' in data &&
                    'message' in data &&
                    'response' in data
                ) {
                    // La respuesta ya tiene el formato deseado, se devuelve tal cual
                    return data;
                }
                return {
                    status: true,
                    message: 'Successfully processed request',
                    response: data,
                };
            })
        );
    }
}
