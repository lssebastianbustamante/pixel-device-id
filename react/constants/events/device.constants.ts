export const DEVICE_EVENTS = {
    INIT: 'device_init',
    GENERATE: 'device_generate',
    UPDATE: 'device_update',
    ERROR: 'device_error',
    VALIDATE: 'device_validate'
} as const;

export const EVENT_OPERATIONS = {
    VALIDATE: 'validate',
    UPDATE: 'update',
    CREATE: 'create',
    DELETE: 'delete'
} as const;

export const EVENT_DEFAULTS = {
    STATUS: true,
    TIMESTAMP: () => Date.now(),
    ERROR_PREFIX: 'EVENT_ERROR'
} as const;