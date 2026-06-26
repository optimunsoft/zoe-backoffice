import { configDotenv } from 'dotenv';
import 'dotenv/config';
import * as Joi from 'joi';
import path from 'path';





// seleccionamos el entorno de ejecucion (desarrollo, produccion)
const ENV = process.env.NODE_ENV || 'development';


// buscar file en cado de produccion
const envFilePath = path.resolve(process.cwd(), `.env.${ENV}`)

// especificamos cual archivo de entorno utilizar
configDotenv({
    path: envFilePath
})



// interface
interface EnvVarsI {
    PORT_APP: number;

    API_KEY_INTERNAL: string,
    API_KEY_INTERNAL_CORE: string,
    API_URL_INTERNAL_CORE: string,
    API_KEY_INTERNAL_ACCOUNTING: string,
    API_URL_INTERNAL_ACCOUNTING: string,
    INTERNAL_HTTP_TIMEOUT_MS: number,

    DB_HOST_ADDRESS: string;
    DB_PORT: number;
    DB_NAME: string;
    DB_USER_NAME: string;
    DB_PASSWORD: string;
    DB_SYNC_MODE: boolean;

    AWS_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_S3_BUCKET_NAME: string;

    MAILER_API_KEY: string;
    MAILER_HOST_ADDRESS: string;

    AUTH0_DOMAIN: string;
    AUTH0_CUSTOM_DOMAIN: string;
    AUTH0_AUDIENCE: string;

    API_KEY_ENCRYPTION_KEY: string,

    TRUST_PROXY_HOPS?: number,
    AUDIT_MAX_SYNC_IMPACTS?: number
}



// esquema de envs
const envSchema = Joi.object({
    PORT_APP: Joi.number().integer().required() ?? '',

    API_KEY_INTERNAL: Joi.string().required() ?? '',
    API_KEY_INTERNAL_CORE: Joi.string().required() ?? '',
    API_URL_INTERNAL_CORE: Joi.string().required() ?? '',
    API_KEY_INTERNAL_ACCOUNTING: Joi.string().required() ?? '',
    API_URL_INTERNAL_ACCOUNTING: Joi.string().required() ?? '',
    INTERNAL_HTTP_TIMEOUT_MS: Joi.number().integer().positive().required() ?? '',

    DB_HOST_ADDRESS: Joi.string().required() ?? '',
    DB_PORT: Joi.number().integer().required() ?? '',
    DB_NAME: Joi.string().required() ?? '',
    DB_USER_NAME: Joi.string().required() ?? '',
    DB_PASSWORD: Joi.string().required() ?? '',
    DB_SYNC_MODE: Joi.boolean().default(false) ?? '',

    AWS_REGION: Joi.string().required() ?? '',
    AWS_ACCESS_KEY_ID: Joi.string().required() ?? '',
    AWS_SECRET_ACCESS_KEY: Joi.string().required() ?? '',
    AWS_S3_BUCKET_NAME: Joi.string().required() ?? '',

    MAILER_API_KEY: Joi.string().required() ?? '',
    MAILER_HOST_ADDRESS: Joi.string().required() ?? '',

    AUTH0_DOMAIN: Joi.string().required() ?? '',
    AUTH0_CUSTOM_DOMAIN: Joi.string().required() ?? '',
    AUTH0_AUDIENCE: Joi.string().required() ?? '',
    API_KEY_ENCRYPTION_KEY: Joi.string().min(32).required() ?? '',

    TRUST_PROXY_HOPS: Joi.number().integer().min(0).default(0) ?? '',
    AUDIT_MAX_SYNC_IMPACTS: Joi.number().integer().min(1).default(250) ?? ''

}).unknown(true);




// validacion 
const { error, value } = envSchema.validate(process.env);


if (error) {
    throw new Error(`Config validation error: ${error}`);
}


const envVars: EnvVarsI = value;


export const envs = {
    port_app: envVars.PORT_APP,
    api_key_encryption_key: envVars.API_KEY_ENCRYPTION_KEY,

    api_key_internal: envVars.API_KEY_INTERNAL,
    api_key_internal_core: envVars.API_KEY_INTERNAL_CORE,
    api_url_internal_core: envVars.API_URL_INTERNAL_CORE.replace(/\/+$/, ''),
    api_key_internal_accounting: envVars.API_KEY_INTERNAL_ACCOUNTING,
    api_url_internal_accounting: envVars.API_URL_INTERNAL_ACCOUNTING.replace(/\/+$/, ''),
    internal_timeout_ms: envVars.INTERNAL_HTTP_TIMEOUT_MS,

    db_host_address: envVars.DB_HOST_ADDRESS,
    db_port: envVars.DB_PORT,
    db_name: envVars.DB_NAME,
    db_user_name: envVars.DB_USER_NAME,
    db_password: envVars.DB_PASSWORD,
    db_sync_mode: envVars.DB_SYNC_MODE,

    aws_region: envVars.AWS_REGION,
    aws_access_key_id: envVars.AWS_ACCESS_KEY_ID,
    aws_secret_access_key: envVars.AWS_SECRET_ACCESS_KEY,
    aws_s3_bucket_name: envVars.AWS_S3_BUCKET_NAME,
    
    mailer_api_key: envVars.MAILER_API_KEY,
    mailer_host_address: envVars.MAILER_HOST_ADDRESS,

    auth0_domain: envVars.AUTH0_DOMAIN,
    auth0_custom_domain: envVars.AUTH0_CUSTOM_DOMAIN,
    auth0_audience: envVars.AUTH0_AUDIENCE,

    trust_proxy_hops: envVars.TRUST_PROXY_HOPS,
    audit_max_sync_impacts: envVars.AUDIT_MAX_SYNC_IMPACTS
}

