import type { DATABASE_ERROR_CODES } from "../../constants/services/database.constants";


// Operaciones disponibles para la base de datos
export type DatabaseOperationType =
    | 'init'
    | 'save'
    | 'get'
    | 'clean'
    | 'close'
    | 'connect'
    | 'transaction';

// Modos de transacción de IndexedDB
export type DatabaseTransactionMode = 'readonly' | 'readwrite';

export interface DatabaseEventData extends BaseEventData {
    operation: DatabaseOperationType;
    data: {
        store?: string;
        key?: string;
        value?: unknown;
        timestamp: number;
        version?: string;
    };
}

export interface DatabaseErrorEventData extends DatabaseEventData {
    status: false;
    error: string;
    errorCode: keyof typeof DATABASE_ERROR_CODES;
}

export interface DatabaseSuccessEventData extends DatabaseEventData {
    status: true;
    metadata?: {
        store: string;
        operation: DatabaseOperationType;
        timestamp: number;
    };
}

export interface HashRecord {
    id: string;
    hash: string;
    timestamp: number;
    data?: Uint8Array;
    salt?: Uint8Array;
    iv?: Uint8Array;
    version?: string;
}

export interface DBConfig {
    name: string;
    version: number;
    store: string;
    keyPath: string;
}

export interface DatabaseErrorData {
    error: string;
    status: false;
    data: {
        code: string;
        details?: unknown;
    };
}

export interface BaseEventData {
    eventName: string;
    timestamp: number;
    status: boolean;
    error?: string;
}

export interface EventData extends BaseEventData {
    data?: Record<string, unknown>;
    metadata?: {
        source: string;
        version: string;
        environment: string;
    };
}

// Tipo para validar eventos
export type EventValidator = (event: EventData) => boolean;

// Tipo para manejadores de eventos
export type EventHandler = (event: EventData) => void | Promise<void>;