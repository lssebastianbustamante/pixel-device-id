import { useCallback, useEffect, useState } from 'react'
import type { FC } from 'react'
import { usePixelEventCallback } from 'vtex.pixel-manager'
import { useOrderFormData } from './hooks/useOrderFormData'
import { useUserDataHandler } from './utils/device/useUserDataHandler'
import type { OrderFormState } from './typings/services/orderForm.types'

// 1. Tipos
type OperationType = 'get' | 'set' | null

// 2. Constantes
const PIXEL_EVENT_ID = 'userData'

// 3. Componente Principal
const UserDeviceId: FC = () => {
  // Hooks de Estado
  const { loading, hasCustomData, deviceHash, status } = useOrderFormData() as OrderFormState
  const [statusOperation, setStatusOperation] = useState(false)
  const [operation, setOperationOrderForm] = useState<OperationType>(null)

  // Hook personalizado
  const handleUserData = useUserDataHandler({
    loading,
    hasCustomData,
    status,
    deviceHash: deviceHash as string,
  })

  // Manejador de eventos
  const handleListener = useCallback(async () => {
    try {
      // Validaciones iniciales
      if (!operation || !statusOperation) {
        console.debug('[UserDeviceId] Operación no válida');
        return;
      }

      // Procesar datos
      const result = handleUserData();
      
      if (!result.status) {
        console.debug('[UserDeviceId] Resultado no válido');
        return;
      }

      // Actualizar estado
      setStatusOperation(result.status);
      setOperationOrderForm(result.operationOrderForm as OperationType);

    } catch (error) {
      console.error('[UserDeviceId] Error:', error);
    }
  }, [handleUserData, operation, statusOperation]);

  // Suscripción a eventos
  usePixelEventCallback({
    eventId: PIXEL_EVENT_ID,
    handler: handleListener,
  });

  // Efecto para manejo inicial
  useEffect(() => {
    const shouldHandleData = statusOperation && operation?.length;
    
    if (!shouldHandleData) {
      console.debug('[UserDeviceId] Iniciando manejo de datos');
      handleListener();
    }
  }, [handleListener, statusOperation, operation]);

  return null;
};

export default UserDeviceId;