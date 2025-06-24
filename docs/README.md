# Device Id Pixel 🚀

## 📋 Descripción
Pixel app que genera y gestiona identificadores únicos de dispositivos para VTEX, implementando técnicas avanzadas de fingerprinting y encriptación para garantizar la unicidad y seguridad de los IDs.

## 🔑 Características Principales

### 🛡️ Seguridad
- Encriptación AES-CBC con claves derivadas PBKDF2
- Gestión segura de salt y vectores de inicialización (IV)
- Validación de integridad en múltiples capas
- Almacenamiento encriptado en IndexedDB
- Persistencia de IDs controlada por cookies
- Sistema de limpieza automática configurable

### 🔄 Gestión de Datos
- Sistema de eventos robusto para trazabilidad
- Limpieza automática de datos antiguos (configurable)
- Validación de dispositivos en múltiples dimensiones
- Sincronización con OrderForm de VTEX
- Manejo de errores centralizado

### 🔍 Device Fingerprinting
```typescript
interface DeviceInfo {
    platform: string
    userAgent: string
    language: string
    timezone: string
    colorDepth: number
    pixelRatio: number
    touchPoints: number
    screenResolution: string
    hardwareConcurrency: number
    memory: number
}
```

## 🛠️ Arquitectura

### Servicios Principales

#### 1. HashService
```typescript
class HashService {
    // Gestión de hashes y encriptación
    async generateAndStoreHash(): Promise<string>
    async decryptHash(hash: string): Promise<string | null>
    async decryptThirdPartyHash(encryptedHash: string, keyMetadata: CrossDeviceKey): Promise<string>
}
```

#### 2. DatabaseService
```typescript
class DatabaseService {
    // Persistencia y gestión de datos
    async saveDeviceHash(hash: string): Promise<void>
    async getDeviceHash(): Promise<string | null>
    async cleanOldData(maxAge?: number): Promise<void>
    async saveOriginalData(hash: string, data: EncryptedData): Promise<void>
}
```

#### 3. OrderFormService
```typescript
class OrderFormService {
    // Integración con VTEX OrderForm
    async getOrderForm(): Promise<TypeOrderForm>
    async setCustomField(orderId: string, hash: string): Promise<void>
}
```

### Sistema de Eventos Mejorado

```typescript
// Constantes de eventos tipadas
const EVENT_NAMES = {
    DATABASE: {
        INIT: 'database_init',
        SAVE: 'database_save',
        GET: 'database_get'
    },
    HASH: {
        GENERATE: 'hash_generate',
        DECRYPT: 'hash_decrypt'
    },
    ORDERFORM: {
        SET: 'orderform_set',
        GET: 'orderform_get'
    }
} as const;

// Función de emisión de eventos enriquecidos
const enrichEventData = (options: EnrichEventOptions): EventData => ({
    ...options,
    timestamp: Date.now(),
    metadata: {
        browser: navigator?.userAgent,
        platform: navigator?.platform,
        language: navigator?.language
    }
});
```

## ⚙️ Configuración

```typescript
const DB_CONFIG = {
    DB_NAME: 'deviceIdDB',
    STORE_NAME: 'deviceId',
    KEY_PATH: 'id',
    FIELD_NAME: 'deviceId',
    APP_ID: 'pixel-device-id'
};

const CRYPTO_CONFIG = {
    PBKDF2: {
        iterations: 100000,
        hash: 'SHA-256'
    },
    AES: {
        name: 'AES-CBC',
        length: 256
    },
    SALT_LENGTH: 16,
    IV_LENGTH: 16,
    VERSION: '1.0'
};
```

## 📡 Integración

### React Hook Mejorado
```typescript
const { 
    deviceHash, 
    loading, 
    hasCustomData,
    operation,
    refetch 
} = useOrderFormData();
```

### Sistema de Tracking Mejorado
```typescript
// Evento enriquecido con metadata
updatedevice(EVENT_NAMES.HASH.GENERATE, {
    operation: 'create',
    status: true,
    data: {
        deviceHash,
        timestamp: Date.now(),
        metadata: {
            // Información del dispositivo
        }
    }
});
```

## 🔍 Debugging y Monitoreo

### Eventos y Logging
```typescript
// Monitoreo de eventos con metadata enriquecida
window.dataDevice.push({
    eventName: 'hash_generate',
    status: true,
    data: {
        deviceHash,
        timestamp: Date.now()
    },
    metadata: {
        // Información adicional del evento
    }
});
```

### Validación y Diagnóstico
```typescript
// Verificación del estado del dispositivo
console.log('Device Info:', deviceInfo);

// Verificación de persistencia
const dbService = await DatabaseService.getInstance();
console.log('DB Connected:', dbService.isConnected());
```

## 🔒 Seguridad Mejorada

1. **Encriptación Robusta**:
   - AES-CBC para datos sensibles
   - Derivación de claves con PBKDF2
   - Salt único por dispositivo
   - IV aleatorio por operación

2. **Persistencia Segura**:
   - Control de duración de IDs
   - Limpieza automática configurable
   - Validación de integridad

3. **Validación Multinivel**:
   - Verificación de fingerprint
   - Validación de metadata
   - Comprobación de integridad
   - Control de acceso
