export const ORDER_FORM_CONFIG = {
    CUSTOM_FIELD: 'deviceId',
    APP_ID: 'pixel-device-id'
} as const;


export const ORDER_FORM_OPERATIONS = {
    INIT: 'init',
    SET: 'set',
    GET: 'get',
    VALIDATE: 'validate'
} as const;

export const ORDER_FORM_STATE = {
    INITIAL: {
      orderForm: null,
      loading: true,
      error: null,
      hasCustomData: false,
      deviceHash: false,
      operation: null
    }
  } as const;

  export const ORDER_FORM_ERROR_CODES = {
    INITIALIZATION_FAILED: 'OF_INIT_FAILED',
    GET_FAILED: 'OF_GET_FAILED',
    SET_FAILED: 'OF_SET_FAILED',
    CLEAN_FAILED: 'OF_CLEAN_FAILED',
    INVALID_DATA: 'OF_INVALID_DATA',
    NOT_FOUND: 'OF_NOT_FOUND'
} as const;