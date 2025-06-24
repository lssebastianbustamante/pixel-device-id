import type { BaseEventData, EventOperation } from './base.types';

export interface DeviceEventInfo {
    eventName?: string
    platform?: string
    userAgent?: string
    language?: string
    timezone?: string
    colorDepth?: number
    pixelRatio?: number
    touchPoints?: number
    status?: boolean
    screenResolution?: string
    hardwareConcurrency: number
    memory?: number
    timestamp: number
    operation?: string
    error?: string
    data?: Record<string, unknown>
    orderFormId?: string
    userType?: string

}

export interface ValidationConfig {
    field: keyof DeviceEventInfo
    validate: (info: DeviceEventInfo) => boolean
    required: boolean
}

export type ValidationDetails = Record<string, boolean>;

export interface ValidationResult {
    details: ValidationDetails;
    isValid: boolean;
}

export type DeviceEventType =
    | 'init'
    | 'generate'
    | 'update'
    | 'validate'
    | 'error';

export interface DeviceInfo {
    platform: string;
    userAgent: string;
    language: string;
    screenResolution: string;
    colorDepth?: number
    pixelRatio?: number
    touchPoints?: number
    hardwareConcurrency?: number
    memory?: string
    timezone?: string;
}

export interface DeviceEventPayload {
    eventName: string;
    sessionId?: string;
    timestamp?: number;
    environment?: string;
    deviceInfo?: DeviceInfo;  // Usar DeviceInfo como tipo para deviceInfo
    status: boolean;
    data?: Record<string, unknown>;
    error?: string;
    operation?: string;
}

export interface DeviceEventData extends BaseEventData {
    operation: EventOperation;
    deviceInfo: DeviceInfo;
}

export namespace Device {
    export interface Info {
        platform: string;
        userAgent: string;
        // ...resto de propiedades
    }

    export interface Event {
        deviceInfo: Info;
        // ...resto de propiedades
    }
}