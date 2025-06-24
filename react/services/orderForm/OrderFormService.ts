import { ORDER_FORM_EVENTS } from "../../constants/events";
import type { OrderFormOperation } from "../../types";
import type { CustomFieldBody, TypeOrderFormDevice } from "../../typings/services";
import { getDeviceFingerprint } from "../../utils/device/getDeviceFingerprint";
import { updateDevice } from "../../utils/events/eventBus";



const FIELD_NAME = 'deviceId'
const APP_ID = "pixel-device-id"
const EVENT_NAME = 'orderform'
class OrderFormError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OrderFormError';
    }
}

export class OrderFormService {
    private static instance: OrderFormService = new OrderFormService()
    private readonly API_BASE = '/api/checkout/pub/orderForm'
    private static readonly OPERATION_TO_EVENT: Record<OrderFormOperation, string> = {
        init: ORDER_FORM_EVENTS.INIT,
        set: ORDER_FORM_EVENTS.SET,
        get: ORDER_FORM_EVENTS.GET,
        error: ORDER_FORM_EVENTS.ERROR,
        clean: ORDER_FORM_EVENTS.CLEAN
    };
    private constructor() { }

    public static getInstance(): OrderFormService {
        return OrderFormService.instance
    }

    public async getOrderForm(): Promise<TypeOrderFormDevice> {
        try {
            const response = await fetch(this.API_BASE, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
   
                throw new Error(`Error al obtener OrderForm: ${response.statusText}`);
            }

            const data: TypeOrderFormDevice = await response.json();

            return data;

        } catch (error) {
            await this.handleError('get', error);
            throw error;
        }
    }

    public async setCustomField(orderId: string | undefined, hash: string): Promise<void> {
        try {
            if (!orderId || !hash) {
                throw new Error('OrderFormId y hash son requeridos');
            }

            const body: CustomFieldBody = { value: hash };
            const response = await this.makeRequest(orderId, body);

            if (!response.ok) {
                await this.handleError('set', {
                    message: response.statusText,
                    statusCode: response.status,
                    orderId
                });
                return;
            }

            this.handleSuccess('set', {
                orderId,
                hash
            });

        } catch (error) {
            await this.handleError('get', error);
            throw error;
        }
    }

    private async makeRequest(orderId: string, body: CustomFieldBody): Promise<Response> {
        return fetch(
            `${this.API_BASE}/${orderId}/customData/${APP_ID}/${FIELD_NAME}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            }
        )
    }

    // Método para obtener el nombre del evento
    private getEventNameForOperation(operation: OrderFormOperation): string {
        return OrderFormService.OPERATION_TO_EVENT[operation] || ORDER_FORM_EVENTS.ERROR;
    }

    // Método para manejar éxitos
    private handleSuccess(operation: OrderFormOperation, data?: Record<string, unknown>): void {
        const operationName = this.getEventNameForOperation(operation);
        
        updateDevice('Device ID:', operationName, {
            operation,
            data,
            deviceInfo: getDeviceFingerprint(),
            eventName: EVENT_NAME,
            event: operationName,
        });
    }

    // Método para manejar errores
    private async handleError(operation: OrderFormOperation, error: unknown): Promise<void> {
        try {
            // Normalizar el mensaje de error
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

            // Crear error específico de OrderForm
            const orderFormError = new OrderFormError(errorMessage);

            // Datos adicionales para el evento
            const errorData = {
                operation,
                timestamp: Date.now(),
                name: orderFormError.name,
                code: operation === 'init' ? 'OF_INIT_ERROR' : 'OF_OPERATION_ERROR'
            };

            // Emitir evento de error
            updateDevice(`Device ID: ${ORDER_FORM_EVENTS}`, 'error', {
                error: errorMessage,
                operation,
                data: {
                    ...errorData,
                    deviceInfo: getDeviceFingerprint()
                },
                eventName: EVENT_NAME
            });

            // Logging para debugging
            console.error(`[OrderFormService] ${operation.toUpperCase()} Error:`, {
                message: orderFormError.message,
                ...errorData
            });

        } catch (handlingError) {
            // Fallback en caso de error al manejar el error
            console.error('Error handling orderForm error:', handlingError);
        }
    }

}