import type { DeviceInfo } from "../../typings/events/device.types"

const DEFAULT_VALUES = {
    MEMORY: '0',
    COLOR_DEPTH: 24,
    PIXEL_RATIO: 1,
    TOUCH_POINTS: 0,
    HARDWARE_CONCURRENCY: 1
} as const;

export const getDeviceFingerprint =  (): DeviceInfo => {
    try {
        const deviceInfo: DeviceInfo = {
            platform: window.navigator.platform,
            userAgent: window.navigator.userAgent,
            language: window.navigator.language,
            colorDepth: window.screen.colorDepth || DEFAULT_VALUES.COLOR_DEPTH,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hardwareConcurrency: window.navigator.hardwareConcurrency || DEFAULT_VALUES.HARDWARE_CONCURRENCY,
            memory: window.performance?.memory?.jsHeapSizeLimit || DEFAULT_VALUES.MEMORY,
            pixelRatio: window.devicePixelRatio || DEFAULT_VALUES.PIXEL_RATIO,
            touchPoints: window.navigator.maxTouchPoints || DEFAULT_VALUES.TOUCH_POINTS
        }

        return deviceInfo

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        throw new Error(`Error obteniendo información del dispositivo: ${errorMessage}`)
    }
}