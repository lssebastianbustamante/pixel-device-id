import { useCallback, useEffect, useState } from 'react'

import { HashService } from '../services/hash/HashService'
import { OrderFormService } from '../services/orderForm/OrderFormService'

import { ORDER_FORM_EVENTS } from '../constants/events/orderForm.constants'
import type {
  OrderFormState,
  TypeOrderFormDevice
} from '../typings/services/orderForm.types'
import { DATABASE_CONFIG, ORDER_FORM_CONFIG } from '../constants/services'


export const useOrderFormData = () => {
  const [state, setState] = useState<OrderFormState>({
    orderForm: null,
    loading: true,
    error: null,
    hasCustomData: false,
    deviceHash: null,
    operation: null,
    status: false
  })

  const validateAndAssignHash = useCallback(
    async (orderForm: TypeOrderFormDevice) => {
      const { orderFormId, customData } = orderForm

      const hasCustomData = Boolean(
        customData?.customApps?.some(
          (app) => (app.id === ORDER_FORM_CONFIG.APP_ID || app.id === 'pixel-device-id') 
          && app.fields?.deviceId !== DATABASE_CONFIG.STORE_NAME 
        )
      )

      try {
        const [hashService, orderFormService] = await Promise.all([
          HashService.getInstance(),
          OrderFormService.getInstance()
        ])

        if (hasCustomData) {
          const deviceHash = customData?.customApps?.[0]?.fields?.deviceId
          return { hasCustomData, loading: false, deviceHash }
        }

        const hashCodeGenerated = await hashService.generateAndStoreHash()

        if (!hashCodeGenerated.length) {
          throw new Error('No se pudo generar hash para el dispositivo')
        }

        await orderFormService.setCustomField(orderFormId, hashCodeGenerated)

        return {
          hasCustomData,
          deviceHash: hashCodeGenerated || null,
          loading: false
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido'

        throw new Error(errorMessage)
      }
    },
    []
  )

  const fetchOrderForm = useCallback(async () => {
    try {
      const orderFormService = OrderFormService.getInstance()

      const data = await (await orderFormService).getOrderForm()

      const { hasCustomData, deviceHash, loading } =
        await validateAndAssignHash(data)

      setState({
        loading,
        hasCustomData,
        deviceHash: deviceHash || null,
        operation: hasCustomData ? ORDER_FORM_EVENTS.GET : ORDER_FORM_EVENTS.SET,
        status: !!data,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
    }
  }, [validateAndAssignHash])

  useEffect(() => {
    fetchOrderForm()
  }, [fetchOrderForm])

  return {
    ...state,
    refetch: fetchOrderForm
  }
}
