// types/paymentsLog.ts

// --- Generic Response Wrapper ---
export interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
}

// --- Entity Types ---

// Derived from the CASE statement in the SQL function
export type PaymentCategory = 'Down Payment' | 'Monthly Installment' | 'Full Payment';

export interface PaymentLogItem {
    payment_id: number;
    created_at: string; // ISO 8601 Timestamp
    order_id: number;
    customer_name: string;
    payment_category: PaymentCategory | string; // Type union with string to be safe
    method: string;
    net_amount: number;
    tendered: number;
    change: number;
}

// --- Parameter Interfaces ---

export interface GetPaymentsLogParams {
    p_start_date?: string | null; // ISO String e.g., '2023-11-01T08:00:00'
    p_end_date?: string | null;   // ISO String
    p_search_term?: string;
    p_limit?: number;
    p_offset?: number;
}