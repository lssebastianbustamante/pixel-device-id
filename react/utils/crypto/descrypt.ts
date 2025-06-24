import type { EncryptedData } from "./encrypt"

const IV_LENGTH = 16
const SALT_LENGTH = 16

/**
 * Desencripta datos que fueron encriptados con la función encrypt
 */
export async function decrypt(
  encryptedData: Uint8Array,
  key: CryptoKey
): Promise<ArrayBuffer> {
  try {
    // Decodificar base64
    const combined = new Uint8Array(
      atob(String.fromCharCode(...encryptedData)).split('').map(char => char.charCodeAt(0))
    )

    // Extraer IV y datos
    const iv = combined.slice(0, 16)
    const data = combined.slice(16)

    // Desencriptar
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv
      },
      key,
      data
    )

    // Convertir a texto
    return decryptedBuffer

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    throw new Error(`Error en desencriptación: ${errorMessage}`)
  }
}

/**
 * Valida el formato de los datos encriptados
 */
export function validateEncryptedData(data: unknown): data is EncryptedData {
  if (!data || typeof data !== 'object') return false

  const encrypted = data as EncryptedData

  return !!(
    encrypted.ciphertext instanceof Uint8Array &&
    encrypted.iv instanceof Uint8Array &&
    encrypted.salt instanceof Uint8Array &&
    encrypted.ciphertext.length > 0 &&
    encrypted.iv.length === IV_LENGTH &&
    encrypted.salt.length === SALT_LENGTH
  )
}