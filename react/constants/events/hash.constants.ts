// Nombres de eventos
export const HASH_EVENTS = {
    GET: 'hash_get',
    SET: 'hash_set',
    VALIDATE: 'hash_validate',
    ENCRYPT: 'hash_encrypt',
    DECRYPT: 'hash_decrypt',
    GENERATE: 'hash_generate',
    VERIFY: 'hash_verify',
    ERROR: 'hash_error'
} as const;

export const HASH_VALIDATION_EVENTS = {
    START: 'hash_validation_start',
    SUCCESS: 'hash_validation_success',
    FAILURE: 'hash_validation_failure'
} as const;

