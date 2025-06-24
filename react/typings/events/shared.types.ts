export interface BaseEventStructure {
    id: string;
    timestamp: number;
    type: string;
}

export type EventStatus = 'success' | 'error' | 'pending';