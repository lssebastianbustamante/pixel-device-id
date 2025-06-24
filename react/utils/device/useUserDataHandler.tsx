import { useCallback } from 'react'

// Corregir la importación de updateDevice
import { updateDevice } from '../events/eventBus'

const EVENT_NAME = 'user_device_id'
interface UseUserDataHandlerProps {
  loading?: boolean
  hasCustomData?: boolean
  operationOrderForm?: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  orderForm?: any
  deviceHash?: string,
  status?: boolean
}
interface UserDataHandlerResult {
  status: boolean;
  operationOrderForm: string | null;
}
export const useUserDataHandler = ({
  hasCustomData,
  operationOrderForm,
  status,
  deviceHash,
  loading
}: UseUserDataHandlerProps) => {
  return useCallback((): UserDataHandlerResult => {

    if (loading || !status || !deviceHash) return {
      status: false,
      operationOrderForm: null,
    }

    const shouldSendGetEvent = hasCustomData && operationOrderForm === 'get'
    const shouldSendSetEvent = !hasCustomData && operationOrderForm === 'set'
    try {

      if (shouldSendSetEvent) {
        updateDevice('Device Id:', operationOrderForm as string, {
          eventName: EVENT_NAME,
          event: operationOrderForm,
          deviceHash: deviceHash,
          assignHash: hasCustomData,
          status
        })

        return {
          status: shouldSendSetEvent,
          operationOrderForm: operationOrderForm ? operationOrderForm : null,
        }
      }

      if (shouldSendGetEvent) {
        updateDevice('Device Id:', operationOrderForm as string, {
          eventName: EVENT_NAME,
          event: operationOrderForm,
          deviceHash: deviceHash,
          assignHash: hasCustomData,
          status
        })

        return {
          status: shouldSendGetEvent,
          operationOrderForm: operationOrderForm ? operationOrderForm : null,
        }
      }
      return {
        status: false,
        operationOrderForm: operationOrderForm ? operationOrderForm : null,
      }
    } catch (error) {
      console.error('Error in useUserDataHandler:', error)
      return {
        status: false,
        operationOrderForm: 'error',
      }
    }
  }, [hasCustomData, operationOrderForm, deviceHash, loading, status])
}
