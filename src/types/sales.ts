// types/sales.ts

// --- Generic Response Wrapper ---
export interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
}

// --- Enum Types ---
export type SaleType = 'full_payment' | 'installment_with_down' | 'pure_installment';

// --- JSON Input Structures ---

export interface OrderItemInput {
    product_id: number;
    quantity: number;
    unit_price: number;
    total?: number;
}

export interface PaymentDetailsInput {
    amount: number;      // Down Payment Amount
    tendered: number;
    method: string;
    change?: number;
}

export interface CustomScheduleItemInput {
    due_date: string; // YYYY-MM-DD
    amount: number;
}

// --- Main Parameter Interface ---

export interface ProcessSaleParams {
    p_account_id: number;
    p_customer_id: number;
    p_sale_type: SaleType;
    p_items: OrderItemInput[];
    p_payment: PaymentDetailsInput;

    // Optional Installment configurations
    p_installment_plan_id?: number | null;
    p_custom_schedule?: CustomScheduleItemInput[] | null;

    // Date Override
    p_sale_date?: string; // ISO 8601 string

    // Interest Details
    p_interest_rate?: number;
    p_interest_amount?: number;

    // NEW: Override calculated totals (Optional)
    // If not provided, the DB calculates them based on items + interest
    p_total_with_interest?: number;
    p_total_financed?: number;
}

// --- Return Value Interface ---

export interface ProcessSaleResult {
    new_order_id: number;
    status: string;
}