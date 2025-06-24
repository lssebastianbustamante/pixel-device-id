export const DATABASE_EVENTS = {
    INIT: 'database_init',
    SAVE: 'database_save',
    GET: 'database_get',
    CLEAN: 'database_clean',
    CLOSE: 'database_close',
    CONNECT: 'database_connect',
    TRANSACTION: 'database_transaction',
    ERROR: 'database_error'
} as const;

export const SOME_OTHER_CONSTANT = 'some_value'