export const HASH_CONFIG = {
    PBKDF2: {
        iterations: 100000,
        hash: 'SHA-256'
    },
    AES: {
        name: 'AES-CBC',
        length: 256
    },
    SALT_LENGTH: 16,
    IV_LENGTH: 16,
    VERSION: '1.0',
    DEFAULT_VERSION: '1.0.0',
    DEFAULT_TIMEOUT: 5000,
    MAX_RETRY_ATTEMPTS: 3,
    MIN_HASH_LENGTH: 32
} as const;


export const CRYPTO_CONFIG = {
    PBKDF2: {
        iterations: 100000,
        hash: 'SHA-256'
    },
    AES: {
        name: 'AES-CBC',
        length: 256
    },
    SALT_LENGTH: 16,
    IV_LENGTH: 16,
    VERSION: '1.0'
} as const

// Operaciones disponibles
export const HASH_OPERATIONS = {
    GET: 'get',
    SET: 'set',
    VALIDATE: 'validate',
    ENCRYPT: 'encrypt',
    DECRYPT: 'decrypt',
    GENERATE: 'generate'
} as const;

export const HASH_ERROR_CODES = {
    INVALID_INPUT: 'HASH_INVALID_INPUT',
    ENCRYPTION_FAILED: 'HASH_ENCRYPTION_FAILED',
    DECRYPTION_FAILED: 'HASH_DECRYPTION_FAILED',
    GENERATION_FAILED: 'HASH_GENERATION_FAILED',
    VALIDATION_FAILED: 'HASH_VALIDATION_FAILED'
} as const;