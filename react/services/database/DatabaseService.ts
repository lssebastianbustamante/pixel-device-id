import type { DBConfig } from "../../typings/events/database.types";
import type { DatabaseRecord, HashRecord } from "../../typings/services/database.types";


import { updateDevice } from "../../utils/events/eventBus";

import { DATABASE_EVENTS, EVENT_DEFAULTS, EVENT_NAMES } from "../../constants/events";
import type { DatabaseOperation } from "../../types";
import { CRYPTO_CONFIG, DATABASE_CONFIG,  } from "../../constants/services";
import type { EncryptedData } from "../../typings/services";

class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export class DatabaseService {
    private static instance: DatabaseService;
    private db: IDBDatabase | null = null;
    private readonly config: DBConfig;
    private static readonly OPERATION_TO_EVENT: Record<DatabaseOperation, string> = {
        init: DATABASE_EVENTS.INIT,
        save: DATABASE_EVENTS.SAVE,
        get: DATABASE_EVENTS.GET,
        clean: DATABASE_EVENTS.CLEAN,
        close: DATABASE_EVENTS.CLOSE,
        connect: DATABASE_EVENTS.CONNECT,
        transaction: DATABASE_EVENTS.TRANSACTION
    };
    private initPromise: Promise<IDBDatabase> | null = null;

    private constructor() {
        this.config = {
            name: DATABASE_CONFIG.NAME || 'deviceIdDB',
            version: DATABASE_CONFIG.VERSION || 1,
            store: DATABASE_CONFIG.STORE_NAME || 'deviceId',
            keyPath: DATABASE_CONFIG.KEY_PATH || 'id'
        };
        // Inicializar automáticamente
        this.initPromise = this.init();
    }

    static async getInstance(): Promise<DatabaseService> {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
            // Esperar a que la inicialización termine
            await DatabaseService.instance.initPromise;
        }
        return DatabaseService.instance;
    }

    public async init(): Promise<IDBDatabase> {
        if (this.db) return this.db;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(this.config.name, this.config.version);

                request.onerror = () => {
                    const error = `Error opening database: ${request.error}`;
                    reject(new Error(error));
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    resolve(this.db);
                };

                request.onupgradeneeded = this.handleUpgradeNeeded.bind(this);
                
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                this.handleError('init', message);
                reject(new Error(message));
            }
        });

        return this.initPromise;
    }
    private async ensureInitialized(): Promise<void> {
        if (!this.db) {
            await this.init();
        }
    }
    public async close(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.handleSuccess('close');
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    public isConnected(): any {
        const connected = this.db !== null;
        const respons = {
            event: DATABASE_EVENTS.CONNECT,
            eventName: EVENT_NAMES.DATABASE,
            opetation: 'connect',
            status: connected,
            timestamp: Date.now()
        }
        return respons;
    }

    public async saveDeviceHash(hash: string): Promise<string> {
  
        
        const connected = await this.isConnected();
        if (!connected.status) {
            await this.ensureInitialized();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.createTransaction(this.config.store, 'readwrite');

                if (!transaction) {
                    throw new Error('Transaction is undefined');
                }
                const store = transaction.objectStore(this.config.store);

                const record: HashRecord = {
                    [this.config.keyPath]: hash,
                    timestamp: Date.now(),
                    id: DATABASE_CONFIG.STORE_NAME,
                    hash: hash
                };

                const request = store.put(record);

                request.onsuccess = () => {
                    this.handleSuccess('save', {
                        hash,
                        operation: 'save',
                        store: this.config.store
                    });
                    resolve( hash);
                    return hash;
                };

                request.onerror = () => {
                    const error = `Error saving hash: ${request.error}`;
                    this.handleError('save', error);
                    reject(new Error(error));
                };
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                this.handleError('save', message);
                reject(new Error(message));
            }
        });
    }

    public async saveOriginalData(hash: string, encryptedData: EncryptedData): Promise<void> {
        await this.ensureInitialized();

        if (!this.db) throw new Error('Database not initialized');
        if (!this.isValidEncryptedData(encryptedData)) {
            throw new DatabaseError('Invalid data format');
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.createTransaction(this.config.store, 'readwrite');
                const store = transaction.objectStore(this.config.store);

                const record: HashRecord = {
                    id: hash,
                    hash: hash,
                    timestamp: Date.now(),
                    data: new Uint8Array(this.ensureArrayBuffer(encryptedData.data)),
                    salt: encryptedData.salt,
                    iv: encryptedData.iv,
                    version: encryptedData.version || CRYPTO_CONFIG.VERSION
                };

                const request = store.put(record);

                request.onsuccess = () => {
                    this.handleSuccess('save', {
                        hash,
                        operation: 'save_encrypted',
                        timestamp: Date.now()
                    });
                    resolve();
                };

                request.onerror = () => {
                    reject(new Error(`Error saving encrypted data: ${request.error}`));
                };
            } catch (error) {
                reject(new DatabaseError(`Failed to save encrypted data: ${error}`));
            }
        });
    }

    private isValidEncryptedData(data: unknown): data is EncryptedData {
        if (!data || typeof data !== 'object') return false

        const encrypted = data as EncryptedData

        return !!(
            encrypted.ciphertext instanceof Uint8Array &&
            encrypted.iv instanceof Uint8Array &&
            encrypted.salt instanceof Uint8Array &&
            encrypted.ciphertext.length > 0 &&
            encrypted.iv.length === CRYPTO_CONFIG.IV_LENGTH &&
            encrypted.salt.length === CRYPTO_CONFIG.SALT_LENGTH &&
            typeof encrypted.version === 'string' &&
            typeof encrypted.timestamp === 'number' &&
            typeof encrypted.data === 'string'
        )
    }

    public async getDeviceHash(): Promise<string | null> {

        if (!this.db) throw new Error('Database not initialized');



        return new Promise((resolve, reject) => {
            try {
                const transaction = this.createTransaction(this.config.store, 'readonly');
                if (!transaction) {
                    throw new Error('Transaction is undefined');
                }

                const store = transaction.objectStore(this.config.store);
                const request = store.getAll();

                request.onsuccess = () => {
                    const records = request.result as DatabaseRecord[];
                    if (records && records.length > 0) {
                        // Validar que los registros sean del tipo correcto
                        if (!this.validateRecordTypes(records)) {
                            throw new DatabaseError('Registros inválidos');
                        }

                        const latestRecord = records.reduce((latest, current) => {
                            return (current.timestamp || 0) > (latest.timestamp || 0) ? current : latest;
                        });

                        const hashValue = latestRecord.hash as DatabaseRecord['hash'] | null;
                        if (typeof hashValue !== 'string') {
                            throw new DatabaseError('Hash inválido');
                        }

                        this.handleSuccess('get', {
                            hash: hashValue,
                            operation: 'get',
                            store: this.config.store
                        });

                        resolve(hashValue);
                    } else {
                        resolve(null);
                        this.handleSuccess('get', { hash: null });
                    }
                };

                request.onerror = () => {
                    const error = `Error getting hash: ${request.error}`;
                    this.handleError('get', error);
                    reject(new Error(error));
                };
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                this.handleError('get', message);
                reject(new Error(message));
            }
        });
    }

    async getOriginalData(id: string): Promise<Uint8Array> {
        try {
            const transaction = this.createTransaction(this.config.store, 'readonly');
            const store = transaction.objectStore(this.config.store);
            const request = store.get(id);

            return new Promise((resolve, reject) => {
                request.onerror = () => {
                    reject(new Error(`Error al obtener datos originales para ID: ${id}`));
                };

                request.onsuccess = () => {
                    const result = request.result;

                    if (!result?.data) {
                        reject(new Error(`No se encontraron datos para ID: ${id}`));
                        return;
                    }

                    const data = this.ensureUint8Array(result.data);

                    resolve(data);
                };
            });
        } catch (error) {
            throw new DatabaseError(
                `Error al recuperar datos originales: ${error instanceof Error ? error.message : 'Error desconocido'}`
            );
        }
    }

    private ensureArrayBuffer(data: unknown): ArrayBuffer {
        if (data instanceof ArrayBuffer) {
            return data;
        }
        if (ArrayBuffer.isView(data)) {
            return data.buffer;
        }
        if (typeof data === 'string') {
            const encoder = new TextEncoder();
            return encoder.encode(data).buffer;
        }
        throw new DatabaseError('Error al convertir datos a ArrayBuffer');
    }

    private ensureUint8Array(data: unknown): Uint8Array {
        if (data instanceof Uint8Array) {
            return data;
        }
        if (data instanceof ArrayBuffer) {
            return new Uint8Array(data);
        }
        if (ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer);
        }
        throw new DatabaseError(
            'Error al convertir datos a Uint8Array'

        );
    }
    public async cleanOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
        await this.ensureInitialized();

        if (!this.db) throw new Error('Database not initialized');

        const cutoffTime = Date.now() - maxAge;

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.createTransaction(this.config.store, 'readwrite');
                const store = transaction.objectStore(this.config.store);
                const request = store.openCursor();

                request.onsuccess = () => {
                    const cursor = request.result;
                    if (cursor) {
                        const record = cursor.value as HashRecord;
                        if (record.timestamp < cutoffTime) {
                            cursor.delete();
                        }
                        cursor.continue();
                    } else {
                        this.handleSuccess('clean', {
                            operation: 'clean',
                            timestamp: Date.now()
                        });
                        resolve();
                    }
                };

                request.onerror = () => {
                    reject(new Error(`Error cleaning old data: ${request.error}`));
                };
            } catch (error) {
                reject(new Error(`Failed to clean old data: ${error}`));
            }
        });
    }

    private createTransaction(storeName: string, mode: IDBTransactionMode): IDBTransaction {

        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([storeName], mode);

        transaction.oncomplete = () => {
            this.handleSuccess('transaction', {
                store: storeName,
                mode
            });
        };

        transaction.onerror = () => {
            this.handleError('transaction', `Transaction failed: ${transaction.error}`);
        };

        return transaction;
    }
    private handleUpgradeNeeded(event: IDBVersionChangeEvent): void {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.config.store)) {
            const store = db.createObjectStore(this.config.store, {
                keyPath: this.config.keyPath
            });
            store.createIndex('timestamp', this.config.keyPath, { unique: false });

            this.handleSuccess('init', {
                version: db.version,
                store: this.config.store,
                upgraded: true
            });
        }
    }


    private validateRecordTypes(records: unknown[]): records is DatabaseRecord[] {
        return records.every(record => {
            return (
                record &&
                typeof record === 'object' &&
                'timestamp' in record &&
                typeof (record as DatabaseRecord).timestamp === 'number'
            );
        });
    }


    private handleError(operation: DatabaseOperation, error: string | Error): void {
        try {
            // Normalizar el mensaje de error
            const errorMessage = error instanceof Error ? error.message : error;

            // Crear error específico de base de datos
            const dbError = new DatabaseError(errorMessage);

            // Datos adicionales para el evento
            const errorData = {
                operation,
                timestamp: Date.now(),
                name: dbError.name,
                code: operation === 'init' ? 'DB_INIT_ERROR' : 'DB_OPERATION_ERROR'
            };

            // Emitir evento de error
            updateDevice(DATABASE_EVENTS.ERROR, 'error', {
                error: errorMessage,
                operation,
                data: errorData,
                eventName: EVENT_NAMES.DATABASE
            });

            // Logging para debugging
            console.error(`[DatabaseService] ${operation.toUpperCase()} Error:`, {
                message: dbError.message,
                ...errorData
            });

        } catch (handlingError) {
            // Fallback en caso de error al manejar el error
            console.error('Error handling database error:', handlingError);
        }
    }

    private getEventNameForOperation(operation: DatabaseOperation): string {
        return DatabaseService.OPERATION_TO_EVENT[operation] || DATABASE_EVENTS.ERROR;
    }

    private handleSuccess(operation: DatabaseOperation, _data?: Record<string, unknown>): void {
        const operationName = this.getEventNameForOperation(operation);

        updateDevice('Device ID:', `${operationName}`, {
            event: operationName,
            status: EVENT_DEFAULTS.STATUS,
            operation,
            timestamp: EVENT_DEFAULTS.TIMESTAMP(),
            eventName: EVENT_NAMES.DATABASE
        }
    );
    }

}