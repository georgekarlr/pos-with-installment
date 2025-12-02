// types/orderHistory.ts

// --- Generic Response Wrapper ---
export interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
}

// --- Enum Types ---
// Matches PostgreSQL enum 'ins_order_status'
export type OrderStatus =
    | 'completed'
    | 'ongoing'
    | 'defaulted'
    | 'refunded'
    | 'partially_refunded';

// Matches PostgreSQL enum 'ins_sale_type'
export type SaleType =
    | 'full_payment'
    | 'installment_with_down'
    | 'pure_installment';

// --- Entity Types ---

export interface OrderHistoryItem {
    order_id: number;
    created_at: string; // ISO 8601 Timestamp
    customer_name: string;
    total_amount: number;
    sale_type: SaleType;
    status: OrderStatus;
    items_count: number;
}

// --- Parameter Interfaces ---

export interface GetOrderHistoryParams {
    p_search_term?: string;
    p_status?: OrderStatus | null;
    p_start_date?: string; // ISO String or null
    p_end_date?: string;   // ISO String or null
    p_limit?: number;
    p_offset?: number;
}