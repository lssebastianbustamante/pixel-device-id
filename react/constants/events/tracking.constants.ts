import type { HashEventData } from "../../types";
import { HASH_OPERATIONS } from "../services/hash.constants";

export const HASH_ERRORS = {
    INVALID_OPERATION: 'INVALID_OPERATION',
    MISSING_DATA: 'MISSING_DATA',
    VALIDATION_FAILED: 'VALIDATION_FAILED'
} as const;

export function isValidHashEvent(event: unknown): event is HashEventData {
    if (!event || typeof event !== 'object') return false;

    const hashEvent = event as Partial<HashEventData>;

    return (
        typeof hashEvent.timestamp === 'number' &&
        typeof hashEvent.status === 'boolean' &&
        typeof hashEvent.operation === 'string' &&
        Object.values(HASH_OPERATIONS).includes(hashEvent.operation)
    );
}