import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { envs } from 'src/config/env.config';
import { S3UploadOptions } from './interfaces/s3-upload-options.interface';

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor() {
        this.bucketName = envs.aws_s3_bucket_name;
        
        this.s3Client = new S3Client({
            region: envs.aws_region,
            credentials: {
                accessKeyId: envs.aws_access_key_id,
                secretAccessKey: envs.aws_secret_access_key,
            },
        });
    }

    /**
     * Sube un archivo a S3
     * @param buffer Buffer del archivo a subir
     * @param key Clave (ruta) del archivo en S3
     * @param contentType Tipo MIME del archivo
     * @returns La clave del archivo subido
     */
    async uploadFile(
        buffer: Buffer,
        key: string,
        contentType: string,
        options?: S3UploadOptions
    ): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                Metadata: options?.metadata,
            });

            await this.s3Client.send(command);
            this.logger.log(`File uploaded successfully to S3: ${key}`);
            return key;
        } catch (error) {
            this.logger.error(`Error uploading file to S3: ${error.message}`, error.stack);
            throw new BadRequestException(`Error al subir archivo a S3: ${error.message}`);
        }
    }

    /**
     * Elimina un archivo de S3
     * @param key Clave (ruta) del archivo en S3
     */
    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
            this.logger.log(`File deleted successfully from S3: ${key}`);
        } catch (error) {
            this.logger.error(`Error deleting file from S3: ${error.message}`, error.stack);
            // No lanzar excepción si el archivo no existe, solo loguear
            if (error.name !== 'NoSuchKey') {
                throw new BadRequestException(`Error al eliminar archivo de S3: ${error.message}`);
            }
        }
    }

    /**
     * Genera una URL pre-firmada para acceder a un archivo en S3
     * @param key Clave (ruta) del archivo en S3
     * @param expiresIn Tiempo de expiración en segundos (por defecto 300 = 5 minutos)
     * @returns URL pre-firmada
     */
    async getPreSignedUrl(key: string, expiresIn: number = 300): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const url = await getSignedUrl(this.s3Client, command, { expiresIn });
            this.logger.debug(`Pre-signed URL generated for key: ${key}, expires in ${expiresIn}s`);
            return url;
        } catch (error) {
            this.logger.error(`Error generating pre-signed URL: ${error.message}`, error.stack);
            throw new BadRequestException(`Error al generar URL pre-firmada: ${error.message}`);
        }
    }

    /**
     * Obtiene un archivo de S3 y lo retorna como base64
     * @param key Clave (ruta) del archivo en S3
     * @returns Base64 string del archivo
     */
    async getFileAsBase64(key: string): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const response = await this.s3Client.send(command);
            
            if (!response.Body) {
                throw new BadRequestException('El archivo está vacío');
            }

            // Convertir el stream a buffer y luego a base64
            const chunks: Uint8Array[] = [];
            const stream = response.Body as any;
            
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            
            const buffer = Buffer.concat(chunks);
            const base64 = buffer.toString('base64');
            
            this.logger.debug(`File retrieved as base64 from S3: ${key}`);
            return base64;
        } catch (error) {
            this.logger.error(`Error getting file as base64 from S3: ${error.message}`, error.stack);
            throw new BadRequestException(`Error al obtener archivo de S3: ${error.message}`);
        }
    }

    /**
     * Verifica si un archivo existe en S3
     * @param key Clave (ruta) del archivo en S3
     * @returns true si el archivo existe, false en caso contrario
     */
    async fileExists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
            return true;
        } catch (error) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                return false;
            }
            this.logger.error(`Error checking file existence in S3: ${error.message}`, error.stack);
            throw new BadRequestException(`Error al verificar existencia de archivo en S3: ${error.message}`);
        }
    }
}
