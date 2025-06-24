// Constantes globales comunes
export const EVENT_DEFAULTS = {
    STATUS: true,
    TIMESTAMP: () => Date.now(),
    ENVIRONMENT: process.env.NODE_ENV || 'production'
} as const;

// Verifica que existan todas las constantes
export const LOCAL_EVENT_PHASES = {
    START: 'START',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
} as const;

export const EVENT_SOURCES = {
    DATABASE: 'database',
    HASH: 'hash',
    ORDER_FORM: 'orderForm'
} as const;

export const DATABASE_EVENTS = {
    INIT: 'database_init',
    SAVE: 'database_save',
    GET: 'database_get',
    CLEAN: 'database_clean',
    CLOSE: 'database_close',
    ERROR: 'database_error',
    CONNECT: 'database_connect',
    TRANSACTION: 'database_transaction'
} as const;

export const HASH_EVENTS = {
    GET: 'hash_get',
    SET: 'hash_set',
    ASSIGN: 'hash_assign',
    VALIDATE: 'hash_validate',
    ENCRYPT: 'hash_encrypt',
    DECRYPT: 'hash_decrypt',
    ERROR: 'hash_error'
} as const;

export const ORDER_FORM_EVENTS = {
    INIT: 'orderform_init',
    SET: 'orderform_set',
    GET: 'orderform_get',
    CLEAN: 'orderform_clean',
    ERROR: 'orderform_error'
} as const;

export const ERROR_CODES = {
    DATABASE: {
        INIT_FAILED: 'DB_INIT_FAILED',
        CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
        SAVE_FAILED: 'DB_SAVE_FAILED',
        GET_FAILED: 'DB_GET_FAILED',
        NOT_FOUND: 'DB_NOT_FOUND',
        INVALID_DATA: 'DB_INVALID_DATA'
    },
    HASH: {
        VALIDATION_FAILED: 'HASH_VALIDATION_FAILED',
        GENERATION_FAILED: 'HASH_GENERATION_FAILED',
        ENCRYPTION_FAILED: 'HASH_ENCRYPTION_FAILED',
        DECRYPTION_FAILED: 'HASH_DECRYPTION_FAILED'
    },
    ORDER_FORM: {
        INVALID_DATA: 'OF_INVALID_DATA',
        NOT_FOUND: 'OF_NOT_FOUND',
        UPDATE_FAILED: 'OF_UPDATE_FAILED'
    }
} as const;
