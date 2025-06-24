export const DATABASE_CONFIG = {
    NAME: 'deviceIdDB',
    STORE_NAME: 'deviceId',
    KEY_PATH: 'id',
    VERSION: 1,
    DEFAULT_MAX_AGE: 7 * 24 * 60 * 60 * 1000 // 7 días
} as const;

export const DATABASE_OPERATIONS = {
    INIT: 'init',
    SAVE: 'save',
    GET: 'get',
    CLEAN: 'clean',
    CLOSE: 'close',
    CONNECT: 'connect',
    TRANSACTION: 'transaction'
} as const;

export const DATABASE_ERROR_CODES = {
    INITIALIZATION_FAILED: 'DB_INIT_FAILED',
    CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
    SAVE_FAILED: 'DB_SAVE_FAILED',
    GET_FAILED: 'DB_GET_FAILED',
    NOT_FOUND: 'DB_NOT_FOUND',
    INVALID_DATA: 'DB_INVALID_DATA',
    TRANSACTION_FAILED: 'DB_TRANSACTION_FAILED'
} as const;