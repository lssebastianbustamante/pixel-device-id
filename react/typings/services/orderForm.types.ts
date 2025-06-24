import type { ORDER_FORM_ERROR_CODES } from "../../constants/services";

export interface OrderFormState {
    orderForm?: TypeOrderFormDevice | null;
    loading: boolean;
    error?: string | null;
    hasCustomData: boolean;
    deviceHash?: string| null;
    operation?: string | null;
    status?: boolean;
}

export interface OrderFormAddress {
    city: string
    neighborhood: string
    state: string
    street: string
    number: string
    postalCode: string
    country: string
}

export interface OrderFormShippingData {
    address?: OrderFormAddress
}

export interface OrderFormClientProfile {
    email?: string
    firstName?: string
    lastName?: string
    phone?: string
    customerClass?: string
}

export interface CustomApp {
    id?: string
    fields?: {
        [key: string]: string
    }
}

export interface OrderFormCustomData {
    customApps: CustomApp[]
}

export interface TypeOrderFormDevice {
    [key: string]: unknown;  // Añadir firma de índice
    deviceHash?: string;
    orderFormId?: string;
    hasCustomData?: boolean;
    customerClass?: string;
    salesChannel?: string;
    userType?: string;
    city?: string;
    neighborhood?: string;
    state?: string;
    country?: string;
    street?: string;
    customData?: OrderFormCustomData;
    clientProfileData?: OrderFormClientProfile;
}

export interface CustomFieldBody {
    value: string;
}

export type OrderFormOperation =
    | 'init'
    | 'set'
    | 'get'
    | 'error'

export type OrderFormOperationType = 'init' | 'set' | 'get';

export interface OrderFormEventData {
    operation: OrderFormOperationType;
    data: {
        orderFormId?: string;
        deviceHash?: string;
        hasCustomData?: boolean;
        timestamp: number;
    };
}

export interface OrderFormErrorEventData extends OrderFormEventData {
    status: false;
    error: string;
    errorCode: keyof typeof ORDER_FORM_ERROR_CODES;
}

export interface OrderFormSuccessEventData {
    status: true;
    metadata?: {
        operation: OrderFormOperationType;
        timestamp: number;
    };
}



