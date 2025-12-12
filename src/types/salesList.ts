// types/salesList.ts

// --- Generic Response Wrapper ---
export interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
}

// --- Enum Types ---
export type SaleType = 'full_payment' | 'installment_with_down' | 'pure_installment';

export type OrderStatus =
    | 'completed'
    | 'ongoing'
    | 'defaulted'
    | 'refunded'
    | 'partially_refunded';

// --- Entity Types ---

export interface SalesListItem {
    order_id: number;
    customer_name: string;
    seller: string;

    /** The Sticker Price (Sum of products) */
    product_total: number;

    /** The Final Contract Price (Product + Interest) */
    grand_total: number;

    /** Cash collected so far */
    paid_amount: number;

    /** Outstanding debt */
    remaining_balance: number;

    /** The Business Date (as opposed to system created_at) */
    sale_date: string; // ISO 8601 Timestamp

    sale_type: SaleType;
    status: OrderStatus;
}

// --- Parameter Interfaces ---

export interface GetSalesListParams {
    p_search_term?: string;
    p_sale_type?: SaleType | null;
    p_status?: OrderStatus | null;
    p_start_date?: string | null; // ISO String
    p_end_date?: string | null;   // ISO String
    p_limit?: number;
    p_offset?: number;
}