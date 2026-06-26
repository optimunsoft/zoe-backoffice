import { SetMetadata } from '@nestjs/common';

export const EXTERNAL_API_METADATA = 'external-api';

/**
 * Decorador para marcar controladores de API externa
 * Aplica automáticamente el interceptor de estandarización de respuestas
 */
export function ExternalApi() {
  return SetMetadata(EXTERNAL_API_METADATA, true);
}
