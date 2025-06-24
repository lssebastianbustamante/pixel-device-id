import { getDeviceFingerprint } from "../../utils/device/getDeviceFingerprint";

import { DatabaseService } from "../database/DatabaseService";
import { validateDeviceInfo } from "./helpers/validateDeviceInfo";
import { encrypt } from "../../utils/crypto/encrypt";
import { decrypt } from "../../utils/crypto/descrypt";
import type { CrossDeviceKey, DeviceMetadata, EncryptedData, HashOperation, KeyGenerationData } from "../../typings/services/hash.types";
import type { DeviceInfo } from "../../typings/events/device.types";
import { CRYPTO_CONFIG, DATABASE_CONFIG } from "../../constants/services";
import { updateDevice } from "../../utils/events/eventBus";
import { HASH_EVENTS } from "../../constants";
import { EVENT_NAMES } from "../../constants/events";



class HashServiceError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'HashServiceError';
    }
}

export class HashService {
    private static instance: HashService | null = null
    private dbService: DatabaseService | null = null

    private static readonly OPERATION_TO_EVENT: Record<HashOperation, string> = {
        generate: HASH_EVENTS.SET,
        assign: HASH_EVENTS.ASSIGN,
        decrypt: HASH_EVENTS.DECRYPT,
        error: HASH_EVENTS.ERROR,
        verify: HASH_EVENTS.VALIDATE
    };

    private constructor() { }

    public static async getInstance(): Promise<HashService> {
        if (!HashService.instance) {
            HashService.instance = new HashService()
            HashService.instance.dbService = await DatabaseService.getInstance()
        }
        return HashService.instance
    }

    private toUint8Array(data: string | ArrayBuffer | Uint8Array): Uint8Array {
        if (data instanceof Uint8Array) {
            return data;
        }
        if (data instanceof ArrayBuffer) {
            return new Uint8Array(data);
        }
        if (typeof data === 'string') {
            // Convertir string base64 a Uint8Array
            return Uint8Array.from(atob(data), c => c.charCodeAt(0));
        }
        throw new HashServiceError(
            'Tipo de datos no soportado',
            'UNSUPPORTED_DATA_TYPE'
        );
    }

    private async generateHash(deviceInfo: DeviceInfo): Promise<{
        hash: string;
        encryptedData: EncryptedData;
        metadata: DeviceMetadata;
    }> {
        // Generar clave para encriptación
        const salt = crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.SALT_LENGTH));


        const keyData: KeyGenerationData = {
            deviceInfo,
            salt,
            timestamp: Date.now(),
            version: CRYPTO_CONFIG.VERSION
        };

        const key = await this.generateKey(keyData);

        // Preparar datos para encriptar
        const dataToEncrypt = new TextEncoder().encode(
            JSON.stringify(deviceInfo)
        );

        // Usar la función encrypt importada
        const encryptedData = await encrypt(dataToEncrypt, key, salt);

        if (!encryptedData) {
            throw new HashServiceError('La encriptación falló', 'ENCRYPTION_FAILED');
        }

        // Crear metadata
        const metadata: DeviceMetadata = {
            deviceInfo,
            salt: Array.from(encryptedData.salt),
            iv: Array.from(encryptedData.iv),
            version: encryptedData?.version ?? ''
        };

        // Generar hash único
        const hash = await this.generateUniqueHash(metadata);

        return {
            hash,
            encryptedData: {
                ...encryptedData,
                data: this.toUint8Array(encryptedData.data as string | ArrayBuffer | Uint8Array)
            },
            metadata
        };
    }


    private async generateKey(data: KeyGenerationData): Promise<CryptoKey> {
        const keyMaterial = new TextEncoder().encode(JSON.stringify(data));

        const baseKey = await crypto.subtle.importKey(
            'raw',
            keyMaterial,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: new Uint8Array(data.salt),
                iterations: CRYPTO_CONFIG.PBKDF2.iterations,
                hash: CRYPTO_CONFIG.PBKDF2.hash
            },
            baseKey,
            CRYPTO_CONFIG.AES,
            true,
            ['encrypt', 'decrypt']
        )
    }


    async generateAndStoreHash(): Promise<string> {
        try {
            
            if (!this.dbService?.init) {
                throw new HashServiceError('Database service not initialized', 'DB_NOT_INIT');
            }

            const isConnected = await this.dbService?.isConnected()
            if (!isConnected.status) {
                updateDevice('Device ID:', `${isConnected.operation}` , {
                    operation: isConnected.operation,
                    status: isConnected.status,
                    eventName: EVENT_NAMES.HASH
                });

                throw new HashServiceError('Database not connected', 'DB_NOT_CONNECTED');
            }
            
    
            // Verificar hash existente
            const existingHash = await this.dbService.getDeviceHash();

            if (existingHash && existingHash !== DATABASE_CONFIG.STORE_NAME) {
                this.handleSuccess('assign', { hash: existingHash, existing: true });
                return existingHash;
            }

            // Obtener información del dispositivo
            const deviceInfo = getDeviceFingerprint();
            const {details, isValid} = validateDeviceInfo(deviceInfo)
            
        if (!isValid || !details) {
                throw new HashServiceError('Información del dispositivo inválida', 'INVALID_DEVICE_INFO');
            }

            // Generar nuevo hash y metadata
            const { hash } = await this.generateHash(deviceInfo);
            if (!hash) {
                throw new HashServiceError('No se pudo generar el hash', 'HASH_GENERATION_FAILED');
            }
            
            const requestResult = await this.dbService.saveDeviceHash(hash);

            return requestResult;

        } catch (error) {
            this.handleError('generate', error);
            throw error;
        }
    }

    async decryptHash(hash: string): Promise<string | null> {
        try {
            if (!this.dbService) {
                throw new HashServiceError('Database service not initialized', 'DB_NOT_INIT');
            }

            const rawEncryptedData = await this.dbService.getOriginalData(hash);
            const encryptedData = this.ensureEncryptedData(rawEncryptedData);

            const deviceInfo = await getDeviceFingerprint();
            const keyMetadata: CrossDeviceKey = {
                salt: encryptedData.salt,
                iv: encryptedData.iv,
                version: encryptedData.version ?? CRYPTO_CONFIG.VERSION,
                timestamp: encryptedData.timestamp ?? Date.now(),
                metadata: {}
            };

            // Recrear clave y desencriptar
            const deviceKey = await this.recreateDeviceKey(deviceInfo, keyMetadata);

            // Convertir los datos a Uint8Array antes de desencriptar
            const dataToDecrypt = this.toUint8Array(encryptedData.data as unknown as string | ArrayBuffer | Uint8Array);
            const decryptedBuffer = await decrypt(dataToDecrypt, deviceKey);
            const decryptedData = new TextDecoder().decode(decryptedBuffer);

            if (!decryptedData) {
                throw new HashServiceError(
                    'Desencriptación produjo resultado vacío',
                    'EMPTY_DECRYPTION'
                );
            }

            this.handleSuccess('decrypt', {
                hash,
                deviceInfo: {
                    version: keyMetadata.version,
                    decryptedData
                }
            });

            return decryptedData;

        } catch (error) {
            this.handleError('decrypt', error);
            throw error
        }
    }

    // Método principal para desencriptar hash de terceros
    async decryptThirdPartyHash(encryptedHash: string, keyMetadata: CrossDeviceKey): Promise<string> {
        try {
            // Validaciones de entrada
            if (!encryptedHash?.trim()) {
                throw new HashServiceError(
                    'Hash encriptado no puede estar vacío',
                    'EMPTY_HASH'
                );
            }

            if (!this.validateKeyMetadata(keyMetadata)) {
                throw new HashServiceError(
                    'Metadata de clave inválida',
                    'INVALID_METADATA'
                );
            }

            // Obtener y validar información del dispositivo actual
            const deviceInfo = await getDeviceFingerprint();
            if (!validateDeviceInfo(deviceInfo)) {
                throw new HashServiceError(
                    'Información del dispositivo insuficiente',
                    'INVALID_DEVICE_INFO'
                );
            }

            // Recrear clave y desencriptar
            const deviceKey = await this.recreateDeviceKey(deviceInfo, keyMetadata);

            // Convertir string base64 a Uint8Array para descifrar
            const encryptedData = Uint8Array.from(atob(encryptedHash), c => c.charCodeAt(0));
            const decryptedBuffer = await decrypt(encryptedData, deviceKey);
            const decryptedData = new TextDecoder().decode(decryptedBuffer);

            if (!decryptedData) {
                throw new HashServiceError(
                    'Desencriptación produjo resultado vacío',
                    'EMPTY_DECRYPTION'
                );
            }

            // Notificar éxito
            updateDevice(HASH_EVENTS.DECRYPT, HASH_EVENTS.DECRYPT, {
                hash: encryptedHash,
                deviceInfo: {
                    version: keyMetadata.version,
                    decryptedData
                }
            });

            return decryptedData;

        } catch (error) {
            this.handleError('decrypt', error);
            throw error;
        }
    }

    // Método auxiliar para recrear la clave
    private async recreateDeviceKey(deviceInfo: DeviceInfo, keyMetadata: CrossDeviceKey): Promise<CryptoKey> {
        const combinedInfo = {
            ...deviceInfo,
            originalSalt: keyMetadata.salt,
            originalIv: keyMetadata.iv,
            version: keyMetadata.version
        }

        const keyMaterial = new TextEncoder().encode(JSON.stringify(combinedInfo))

        const baseKey = await crypto.subtle.importKey(
            'raw',
            keyMaterial,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        )

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: keyMetadata.salt,
                iterations: CRYPTO_CONFIG.PBKDF2.iterations,
                hash: CRYPTO_CONFIG.PBKDF2.hash
            },
            baseKey,
            CRYPTO_CONFIG.AES,
            true,
            ['encrypt', 'decrypt']
        )
    }


    private async generateUniqueHash(metadata: DeviceMetadata): Promise<string> {
        try {
            // Convertir metadata a string para el hash
            const metadataString = JSON.stringify({
                deviceInfo: metadata.deviceInfo,
                salt: metadata.salt,
                iv: metadata.iv,
                version: metadata.version,
                timestamp: Date.now()
            });

            // Crear un hash usando SHA-256
            const encoder = new TextEncoder();
            const data = encoder.encode(metadataString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);

            // Convertir el hash a string base64
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashBase64 = btoa(String.fromCharCode(...hashArray));

            return hashBase64;
        } catch (error) {
            throw new HashServiceError(
                'Error generando hash único',
                error instanceof Error ? error.message : 'Error desconocido'
            );
        }
    }
    // Método auxiliar para validar metadata
    private validateKeyMetadata(metadata: CrossDeviceKey): boolean {
        return !!(
            metadata &&
            metadata.salt instanceof Uint8Array &&
            metadata.salt.length === CRYPTO_CONFIG.SALT_LENGTH &&
            metadata.iv instanceof Uint8Array &&
            metadata.iv.length === CRYPTO_CONFIG.IV_LENGTH &&
            metadata.version &&
            metadata.timestamp
        )
    }
    private isValidEncryptedData(data: unknown): data is EncryptedData {
        const encrypted = data as EncryptedData;
        return !!(
            encrypted &&
            encrypted.data instanceof Uint8Array &&
            encrypted.iv instanceof Uint8Array &&
            encrypted.salt instanceof Uint8Array &&
            (!encrypted.version || typeof encrypted.version === 'string') &&
            (!encrypted.timestamp || typeof encrypted.timestamp === 'number')
        );
    }

    private ensureEncryptedData(data: unknown): EncryptedData {
        if (!this.isValidEncryptedData(data)) {
            throw new HashServiceError(
                'Datos encriptados inválidos o corruptos',
                'INVALID_ENCRYPTED_DATA'
            );
        }
        return data;
    }

    // Método para obtener el nombre del evento basado en la operación
    private getEventNameForOperation(operation: HashOperation): string {
        return HashService.OPERATION_TO_EVENT[operation] || HASH_EVENTS.ERROR;
    }

    // Método para manejar éxitos
    private handleSuccess(operation: HashOperation, data?: Record<string, unknown>): void {
        const operationName = this.getEventNameForOperation(operation);

        updateDevice('Device ID:', operationName, {
            operation,
                data,        
                deviceInfo: getDeviceFingerprint(),
            eventName: EVENT_NAMES.HASH
        });
        
    }




    // Método para manejar errores
    private handleError(operation: HashOperation, error: string | Error): void {
        try {
            // Normalizar el mensaje de error
            const errorMessage = error instanceof Error ? error.message : error;

            // Crear error específico del hash
            const hashError = new HashServiceError(errorMessage, 'HASH_ERROR');

            // Datos adicionales para el evento
            const errorData = {
                operation,
                timestamp: Date.now(),
                name: hashError.name,
                code: hashError.code
            };

            // Emitir evento de error
            updateDevice(HASH_EVENTS.ERROR, HASH_EVENTS.ERROR, {
                error: errorMessage,
                operation,
                data: {
                    ...errorData,
                    deviceInfo: getDeviceFingerprint()
                },
                eventName: EVENT_NAMES.HASH
            });

            // Logging para debugging
            console.error(`[HashService] ${operation.toUpperCase()} Error:`, {
                message: hashError.message,
                ...errorData
            });

        } catch (handlingError) {
            // Fallback en caso de error al manejar el error
            console.error('Error handling hash error:', handlingError);
        }
    }
}