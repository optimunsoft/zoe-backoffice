import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

/**
 * Utilidad para encriptar y desencriptar API keys
 * Usa AES-256-GCM para encriptación simétrica segura
 * Permite recuperar la API key original cuando es necesario
 */
export class ApiKeyHashUtil {
    private static readonly ALGORITHM = 'aes-256-gcm';
    private static readonly IV_LENGTH = 16; // 16 bytes para AES
    private static readonly SALT_LENGTH = 32; // 32 bytes para la clave derivada
    private static readonly TAG_LENGTH = 16; // 16 bytes para el tag de autenticación GCM
    private static readonly KEY_LENGTH = 32; // 32 bytes para AES-256

    /**
     * Deriva una clave de encriptación desde una clave maestra usando PBKDF2
     */
    private static deriveKey(masterKey: string, salt: Buffer): Buffer {
        return createHash('sha256')
            .update(masterKey + salt.toString('hex'))
            .digest();
    }

    /**
     * Encripta una API key usando AES-256-GCM
     * @param apiKey - La API key en texto plano
     * @param encryptionKey - Clave de encriptación (debe ser de al menos 32 caracteres)
     * @returns La API key encriptada en formato: salt:iv:tag:encryptedData (todos en hex)
     */
    static encrypt(apiKey: string, encryptionKey: string): string {
        if (!encryptionKey || encryptionKey.length < 32) {
            throw new Error('La clave de encriptación debe tener al menos 32 caracteres');
        }

        // Generar salt e IV aleatorios
        const salt = randomBytes(this.SALT_LENGTH);
        const iv = randomBytes(this.IV_LENGTH);

        // Derivar la clave de encriptación
        const key = this.deriveKey(encryptionKey, salt);

        // Crear cipher
        const cipher = createCipheriv(this.ALGORITHM, key as any, iv as any);

        // Encriptar
        let encrypted = cipher.update(apiKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Obtener el tag de autenticación
        const tag = cipher.getAuthTag();

        // Retornar en formato: salt:iv:tag:encryptedData
        return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    }

    /**
     * Desencripta una API key encriptada
     * @param encryptedApiKey - La API key encriptada en formato salt:iv:tag:encryptedData
     * @param encryptionKey - Clave de encriptación (debe ser la misma usada para encriptar)
     * @returns La API key en texto plano
     */
    static decrypt(encryptedApiKey: string, encryptionKey: string): string {
        if (!encryptedApiKey || !encryptionKey) {
            throw new Error('API key encriptada y clave de encriptación son requeridas');
        }

        // Separar los componentes
        const parts = encryptedApiKey.split(':');
        if (parts.length !== 4) {
            throw new Error('Formato de API key encriptada inválido');
        }

        const [saltHex, ivHex, tagHex, encrypted] = parts;

        // Convertir de hex a buffers
        const salt = Buffer.from(saltHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');

        // Derivar la clave de encriptación
        const key = this.deriveKey(encryptionKey, salt);

        // Crear decipher
        const decipher = createDecipheriv(this.ALGORITHM, key as any, iv as any);
        decipher.setAuthTag(tag as any);

        // Desencriptar
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Verifica si una API key en texto plano coincide con una API key encriptada
     * @param apiKey - La API key en texto plano a verificar
     * @param encryptedApiKey - La API key encriptada almacenada
     * @param encryptionKey - Clave de encriptación
     * @returns true si la API key coincide, false en caso contrario
     */
    static verify(apiKey: string, encryptedApiKey: string, encryptionKey: string): boolean {
        try {
            const decrypted = this.decrypt(encryptedApiKey, encryptionKey);
            return this.timingSafeEqual(apiKey, decrypted);
        } catch {
            return false;
        }
    }

    /**
     * Comparación segura contra timing attacks
     * Compara dos strings de forma que el tiempo de ejecución no revele información
     */
    private static timingSafeEqual(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }

        return result === 0;
    }
}

