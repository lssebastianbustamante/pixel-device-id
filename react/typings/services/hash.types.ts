export interface DeviceInfo {
    // Propiedades requeridas
    platform: string;
    userAgent: string;
    language: string;
    screenResolution: string;
    
    // Propiedades opcionales del dispositivo
    colorDepth?: number;
    pixelRatio?: number;
    touchPoints?: number;
    hardwareConcurrency?: number;
    memory?: string;
    timezone?: string;
}

export interface ValidationConfig {
    required: boolean;
    validate: (value: unknown) => boolean;
    field: keyof DeviceInfo;
}

export interface ValidationResult {
    details: Record<keyof DeviceInfo, boolean>;
    isValid: boolean;
}

export interface DeviceMetadata {
    deviceInfo: DeviceInfo;
    salt: number[];  // Array de bytes
    iv: number[];    // Array de bytes
    version: string;
}

export interface HashConfig {
    salt: Uint8Array
    iv: Uint8Array
    iterations: number
    keyLength: number
}

export interface HashMetadata {
    salt: Uint8Array
    iv: Uint8Array
    version: string
    timestamp: number
}

export interface CrossDeviceKey {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    version: any;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    timestamp: any;
    salt: Uint8Array
    iv: Uint8Array
    metadata: Record<string, unknown>
}

export type HashOperation =
    | 'generate'
    | 'assign'
    | 'decrypt'
    | 'verify'
    | 'error';

export interface HashState {
    hash: string | null
    error: Error | null
    isGenerating: boolean
}

export interface EncryptedData {
    data: Uint8Array;
    iv: Uint8Array;
    salt: Uint8Array;
    ciphertext: Uint8Array;  // Añadimos la propiedad ciphertext
    version?: string;        // Opcional para compatibilidad
    timestamp?: number;      // Opcional para compatibilidad
}



  export interface KeyGenerationData {
    deviceInfo: DeviceInfo;
    salt: Uint8Array;
    timestamp: number;
    version: string;
}