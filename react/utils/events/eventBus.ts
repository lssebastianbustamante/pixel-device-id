import { EVENT_DEFAULTS } from '../../constants/events';

// Agregar la interfaz EventData
interface EventDataDevice {
    event?: string;
    status: boolean;
    environment?: string;
    operation?: string;
    data?: Record<string, unknown>;
    eventName?: string;
}

export const eventBus = {
    push: (data: EventDataDevice): void => {

        if (process.env.NODE_ENV === 'development') {

            window.dataDevice = [];

            window.dataDevice.push({
                ...data,
                timestamp: EVENT_DEFAULTS.TIMESTAMP()
            });

        }
    }
};

export const updateDevice = (
    _operationName: string,
    operation: string,
    data: Record<string, unknown>
): void => {

    eventBus.push({
        event: data?.event as string,
        eventName: data?.eventName as string,
        status: true,
        environment: EVENT_DEFAULTS.ENVIRONMENT,
        operation: operation as string,
        ...data
    });
};