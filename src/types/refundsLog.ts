// types/refundsLog.ts

// --- Generic Response Wrapper ---
export interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
}

// --- Entity Types ---

export interface RefundLogItem {
    refund_id: number;
    created_at: string; // ISO 8601 Timestamp
    order_id: number;
    customer_name: string;
    amount_refunded: number;
    method: string;     // 'cash', 'card', 'void', etc.
    reason: string | null;
}

// --- Parameter Interfaces ---

export interface GetRefundsLogParams {
    p_start_date?: string | null; // ISO String
    p_end_date?: string | null;   // ISO String
    p_limit?: number;
    p_offset?: number;
}