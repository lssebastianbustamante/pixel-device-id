// Verifica que existan todas las interfaces y tipos
export interface BaseEvent {
    status: boolean;
    timestamp: number;
    eventName: string;
    error?: string;
}

export type EventPhase = 'START' | 'SUCCESS' | 'ERROR';

export interface EventMetadata {
    source: string;
    version: string;
    environment: string;
}

// Database Types
export type DatabaseOperation = 'init' | 'save' | 'get' | 'clean' | 'close' | 'connect' | 'transaction';

export interface DatabaseEventData extends BaseEvent {
    operation: DatabaseOperation;
    data: {
        store?: string;
        key?: string;
        value?: unknown;
        timestamp: number;
    };
    metadata?: EventMetadata;
}

// Hash Types
export type HashOperation = 'get' | 'set' | 'validate' | 'encrypt' | 'decrypt';

export interface HashEventData extends BaseEvent {
    operation: HashOperation;
    data: {
        deviceHash?: string;
        orderFormId?: string;
        hasCustomData?: boolean;
        timestamp: number;
    };
    metadata?: EventMetadata;
}

// OrderForm Types
export type OrderFormOperation = 'init' | 'set' | 'get' | 'clean' | 'error';

export interface OrderFormEventData extends BaseEvent {
    operation: OrderFormOperation;
    data: {
        orderFormId?: string;
        deviceHash?: string;
        hasCustomData?: boolean;
        timestamp: number;
    };
    metadata?: EventMetadata;
}