import { DEVICE_EVENTS } from './device.constants';
import { DATABASE_EVENTS } from './database.constants';
import { HASH_EVENTS } from './hash.constants';
import { ORDER_FORM_EVENTS } from './orderForm.constants';
import { USER_EVENTS } from './user.constants';

export const EVENTS = {
    DEVICE: DEVICE_EVENTS,
    DATABASE: DATABASE_EVENTS,
    HASH: HASH_EVENTS,
    ORDER_FORM: ORDER_FORM_EVENTS,
    USER: USER_EVENTS
} as const;

export const EVENT_DEFAULTS = {
    STATUS: true,
    TIMESTAMP: () => Date.now(),
    ENVIRONMENT: process.env.NODE_ENV || 'production',
    EVENT_NAME: 'pixel-device-id',
    EVENT: 'device'
} as const;

export const EVENT_TYPES = {
    DEVICE: 'device',
    ERROR: 'error',
    SUCCESS: 'success',
    INFO: 'info'
} as const;

export const EVENT_OPERATIONS = {
    VALIDATE: 'validate',
    UPDATE: 'update',
    CREATE: 'create',
    DELETE: 'delete'
} as const;

export const EVENT_PHASES = {
    START: 'START',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
} as const;

export const EVENT_NAMES = {
    DEVICE: 'device_service',
    DATABASE: 'database',
    HASH: 'hash_service',
    ORDER_FORM: 'orderForm_service',
    ORDER_FORM_HOOK: 'orderForm_hook',
} as const;

export const COMMON_ERROR_CODES = {
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    INVALID_INPUT: 'INVALID_INPUT',
    OPERATION_FAILED: 'OPERATION_FAILED',
    NOT_FOUND: 'NOT_FOUND',
    TIMEOUT: 'TIMEOUT'
} as const;

// Exportaciones específicas
export {
    DEVICE_EVENTS,
    DATABASE_EVENTS,
    HASH_EVENTS,
    ORDER_FORM_EVENTS,
    USER_EVENTS
};