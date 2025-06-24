import type { DeviceInfo, ValidationConfig } from "../../../typings/events";
import type { ValidationResult } from "../../../typings/services";

const validationConfigs: Record<keyof DeviceInfo, ValidationConfig> = {
    platform: {
        required: true,
        validate: (value: unknown) => !!value,
        field: 'platform'
    },
    userAgent: {
        required: true,
        validate: (value: unknown): boolean => !!value,
        field: 'userAgent'
    },
    language: {
        required: true,
        validate: (value: unknown): boolean => !!value,
        field: 'language'
    },
    timezone: {
        required: false,
        validate: (value: unknown): boolean => !!value,
        field: 'timezone'
    },
    screenResolution: {
        required: true,
        validate: (value: unknown): boolean => !!value,
        field: 'screenResolution'
    },
    colorDepth: {
        required: true,
        validate: (value: unknown): boolean => !!value,
        field: 'colorDepth'
    },
    pixelRatio: {
        required: true,
        validate: (value: unknown): boolean => !!value,
        field: 'pixelRatio'
    },
    touchPoints: {
        required: false,
        validate: (value: unknown): boolean => !!value,
        field: 'touchPoints'
    },
    hardwareConcurrency: {
        required: true,
        validate: (value: unknown): boolean => !!value,
        field: 'hardwareConcurrency'
    },
    memory: {
        required: false,
        validate: (value: unknown): boolean => !!value,
        field: 'memory'
    }
};

export const getEmptyValidationResult = (): ValidationResult => ({
    details: Object.keys(validationConfigs).reduce((acc, key) => {
        acc[key as keyof DeviceInfo] = false;
        return acc;
    }, {} as Record<keyof DeviceInfo, boolean>),
    isValid: false
});

export const validateDeviceInfo = (info: DeviceInfo): ValidationResult => {
    // Validación inicial
    if (!info) {
        return getEmptyValidationResult();
    }

    const configsArray = Object.entries(validationConfigs);

    const details = configsArray.reduce<Record<keyof DeviceInfo, boolean>>((acc, [field]) => {
        const value = info[field as keyof DeviceInfo];
        // Validar explícitamente si el valor está definido
        acc[field as keyof DeviceInfo] = !!value
        return acc;
    }, getEmptyValidationResult().details);

    const isValid = configsArray
        .filter(([_, config]) => config.required)
        .every(([field]) => details[field as keyof DeviceInfo]);

    return {
        details,
        isValid
    };
};