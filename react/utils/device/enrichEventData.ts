import type { TypeOrderFormDevice } from "../../typings/services";
import { getDeviceFingerprint } from "./getDeviceFingerprint";

export const enrichEventData = async (orderForm: TypeOrderFormDevice) => {
    const timestamp = Date.now();
    const environment = process.env.NODE_ENV || 'production';

    if (environment === 'production') return

    // Destructuring de los datos necesarios
    const {
        salesChannel,
        clientProfileData,
        customData,
    } = orderForm

    return {
        environment: environment || null,
        hashIfo: {
            assignHash: Boolean(customData?.customApps?.[0]?.fields?.deviceId),
            deviceId: customData?.customApps?.[0]?.fields?.deviceId,
        },
        cryptoInfo: {
            metadata: await getDeviceFingerprint(),
        },
        clientInfo: {
            salesChannel: salesChannel,
            customerClass: clientProfileData?.customerClass,
            customData: customData?.customApps?.[0]?.fields?.deviceId,
        },
        timestamp
    };
};
