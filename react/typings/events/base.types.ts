export interface BaseEvent {
    eventName?: string;
    timestamp?: number;
    status: boolean;
    error?: string;
}

export interface EventMetadata {
    version: string;
    environment: string;
    sessionId: string;
}

export type EventPhase = 'START' | 'SUCCESS' | 'ERROR';

export type EventStatus = 'success' | 'error' | 'pending';

export type EventSource = 'device' | 'database' | 'hash' | 'orderForm';

export interface BaseEventMetadata {
    timestamp: number;
    version: string;
    environment: string;
    source: EventSource;
}

export interface BaseEventData {
    eventName: string;
    status: boolean;
    timestamp: number;
    metadata?: BaseEventMetadata;
    error?: string;
}

export interface BaseErrorData {
    error: string;
    errorCode: string;
    details?: unknown;
}

export interface BaseOperationData {
    operation: string;
    data?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

export type EventOperation = 'get' | 'set' | 'validate' | 'update';