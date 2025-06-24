import type { BaseEventData, EventMetadata } from "./base.types";


export interface BaseEventInfo {
    eventName: string;
    status: boolean;
    timestamp?: number;
    data?: Record<string, unknown>;
    error?: string;
}

export interface DeviceEventInfo extends BaseEventInfo {
    deviceInfo?: DeviceInfo;
    sessionId?: string;
}

export interface DeviceInfo {
    deviceId: string;
    deviceType: string;
}

export enum EventType {
    ERROR = 'error',
    SUCCESS = 'success',
    INFO = 'info'
}

export type EventOperation = 'get' | 'set' | 'validate' | 'update';

export interface EnrichEventOptions extends BaseEventData {
    eventName: string;
    eventData?: DeviceEventInfo;
    status: boolean;
    operation?: EventOperation;
    data?: Record<string, unknown>;
    error?: string;
    timestamp: number;
}

// Actualizar la interfaz para usar el enum
export interface DeviceEventPayload extends DeviceEventInfo {
    id: string;
    eventType: EventType;
    sessionId: string;  // Requerido en el payload
    timestamp: number;  // Requerido en el payload
}



// Evento enriquecido con información del dispositivo
export interface EnrichedDeviceEventData extends BaseEventData {
    deviceInfo?: DeviceInfo;
    operation?: string;
    sessionId?: string;
}

// Tipos base para eventos
export interface BaseEvent {
    timestamp: number;
    status: boolean;
    error?: string;
}

// Tipos específicos para el hash
export interface HashEventData extends BaseEventData {
    operation?: EventOperation;
    data?: {
        deviceHash?: string;
        orderFormId?: string;
        hasCustomData?: boolean;
        customerClass?: string;
        salesChannel?: string;
        userType?: string;
    };
    deviceInfo?: DeviceInfo;
}

// Constantes
export const HASH_OPERATIONS = {
    GET: 'get' as const,
    SET: 'set' as const,
    VALIDATE: 'validate' as const,
    UPDATE: 'update' as const
} as const;

export const EVENT_DEFAULTS = {
    STATUS: true,
    OPERATION: 'update',
    TIMESTAMP: () => Date.now(),
    ENVIRONMENT: process.env.NODE_ENV || 'production'
} as const;

// Helpers y validadores
export function createHashEvent(
    operation?: EventOperation,
    data?: Record<string, unknown>,
    error?: string
): HashEventData {
    return {
    operation,
    timestamp: Date.now(),
    status: !error,
    data,
    ...(error && { error }),
    eventName: "",

};
}

export interface TrackingEvent extends BaseEvent {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    data: any;
    metadata: EventMetadata;
}

// Usar interface existente pero con tipo específico
export interface HashEvent extends TrackingEvent {
    deviceHash: string;
    orderFormId: string;
    hasCustomData: boolean;
}

// Usar interface existente pero con tipo específico
export interface DeviceEvent{
    platform: string;
    userAgent: string;
    language: string;
    screenResolution: string;
}