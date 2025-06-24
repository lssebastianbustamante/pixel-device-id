import type { BaseEvent, BaseEventMetadata, EventPhase } from './base.types';
import type { DeviceInfo } from './device.types';

// Operaciones permitidas para hash
export type HashOperation =
    | 'get'
    | 'set'
    | 'validate'
    | 'encrypt'
    | 'decrypt'
    | 'generate';

// Datos principales del evento hash
export interface HashEventData extends BaseEvent {
    operation: HashOperation;
    data: {
        deviceHash?: string;
        orderFormId?: string;
        hasCustomData?: boolean;
        encryptedData?: string;
        decryptedData?: string;
        source?: 'local' | 'third_party';
        version?: string;
        timestamp?: number;
    };
    deviceInfo?: DeviceInfo;
}

// Datos específicos para errores
export interface HashErrorData extends HashEventData {
    status: false;
    error: string;
    errorCode?: string;
}

export interface HashResult {
    deviceHash: string;
    timestamp: number;
    version: string;
}

export interface HashValidationResult {
    isValid: boolean;
    deviceHash?: string;
    error?: string;
    timestamp: number;
}

export interface HashGenerationResult {
    deviceHash: string;
    timestamp: number;
    version: string;
    orderFormId?: string;
}

export interface HashEncryptionResult {
    encryptedHash: string;
    version: string;
    timestamp: number;
}

export interface HashMetadata extends BaseEventMetadata {
    deviceId?: string;
    sessionId?: string;
}

export interface HashEventContext {
    operation: HashOperation;
    phase: EventPhase;
    timestamp: number;
    source: 'hash';
}