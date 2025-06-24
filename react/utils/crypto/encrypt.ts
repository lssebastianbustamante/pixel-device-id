export interface EncryptedData {
    ciphertext: Uint8Array;
    iv: Uint8Array;
    salt: Uint8Array;
    version?: string;
    timestamp?: number;
    data?: string;
}

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




/**
 * Encripta datos usando AES-CBC
 * @param data - Datos a encriptar
 * @param key - Clave criptográfica para la encriptación
 * @param customSalt - Salt existente (opcional)
 * @returns Datos encriptados con metadata
 */

export async function encrypt(
data: ArrayBufferLike | ArrayBufferView, key: CryptoKey, customSalt?: Uint8Array): Promise<EncryptedData> {
    try {
        // Validar entrada
        if (!data || !key) {
            throw new Error('Datos y clave son requeridos')
        }

        if (customSalt && customSalt.length !== CRYPTO_CONFIG.SALT_LENGTH) {
            throw new Error('El tamaño del salt proporcionado no es válido');
        }
        // Generar IV y salt
        const iv = crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.IV_LENGTH))
        const salt = customSalt || crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.SALT_LENGTH))

        // Asegurar que tenemos un ArrayBuffer
        const dataBuffer = data instanceof ArrayBuffer ? data : (data as ArrayBufferView).buffer
 
        // Encriptar datos
        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: CRYPTO_CONFIG.AES.name,
                iv
            },
            key,
            dataBuffer
        )

        // Crear array encriptado
        const encryptedArray = new Uint8Array(encryptedBuffer)

        // Combinar para versión base64
        const combined = new Uint8Array(iv.length + encryptedArray.length)
        combined.set(iv)
        combined.set(encryptedArray, iv.length)

        // Convertir a base64
        const base64Data = btoa(String.fromCharCode(...combined))

        const result: EncryptedData = {
            ciphertext: encryptedArray,
            iv,
            salt,
            version: CRYPTO_CONFIG.VERSION,
            timestamp: Date.now(),
            data: base64Data
        }

        // Validar resultado antes de retornar
        if (!validateEncryptedData(result)) {
            throw new Error('Error en la validación del resultado encriptado')
        }


        return result

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        throw new Error(`Error en encriptación: ${errorMessage}`)
    }
}

/**
 * Valida el formato de los datos encriptados
 */
export function validateEncryptedData(data: unknown): data is EncryptedData {
    if (!data || typeof data !== 'object') return false

    const encrypted = data as EncryptedData
    
    return !!(
        encrypted.ciphertext instanceof Uint8Array &&
        encrypted.iv instanceof Uint8Array &&
        encrypted.salt instanceof Uint8Array &&
        encrypted.ciphertext.length > 0 &&
        encrypted.iv.length === CRYPTO_CONFIG.IV_LENGTH &&
        encrypted.salt.length === CRYPTO_CONFIG.SALT_LENGTH &&
        typeof encrypted.version === 'string' &&
        typeof encrypted.timestamp === 'number' &&
        typeof encrypted.data === 'string'
    )
}