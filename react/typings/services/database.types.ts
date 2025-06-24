import type { DATABASE_ERROR_CODES, DATABASE_OPERATIONS } from '../../constants/services';
import type { BaseEventData } from '../events/base.types';

export type DatabaseOperationType = keyof typeof DATABASE_OPERATIONS;

export interface DatabaseConfig {
    name: string;
    version: number;
    store: string;
    keyPath: string;
}

export interface DatabaseRecord {
    id: string;
    hash: string;
    timestamp: number;
    version?: string;
}

export interface HashRecord extends DatabaseRecord {
 
    data?: Uint8Array;
    salt?: Uint8Array;
    iv?: Uint8Array;
}

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