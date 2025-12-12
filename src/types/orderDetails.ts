// types/orderDetails.ts

// --- Generic Response Wrapper ---
export interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
}

// --- Enum Types ---
export type OrderStatus = 'completed' | 'ongoing' | 'defaulted' | 'refunded' | 'partially_refunded';
export type SaleType = 'full_payment' | 'installment_with_down' | 'pure_installment';
export type ScheduleStatus = 'pending' | 'paid' | 'overdue' | 'partial' | 'cancelled';

// --- Nested Objects for Order Details ---

export interface OrderHeaderInfo {
    id: number;
    date: string;       // Business Date (sale_date) - ISO String
    created_at: string; // System Date - ISO String
    status: OrderStatus;
    sale_type: SaleType;
    notes: string | null;
}

export interface CustomerSummary {
    id: number | null;
    name: string;
    phone: string | null;
    address: string | null;
    credit_limit: number | null;
}

export interface FinancialSummary {
    product_total: number;     // Sticker Price (Sum of items)
    grand_total: number;       // Contract Price (Product + Interest)
    total_paid: number;        // Dynamic sum of payments
    remaining_balance: number; // Current outstanding debt
}

export interface OrderItemDetail {
    product_name: string;
    sku: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
}

export interface PaymentHistoryItem {
    id: number;
    date: string;
    method: string;
    amount: number;
    tendered: number;
    change: number;
}

export interface InstallmentScheduleItem {
    due_date: string;
    amount_due: number;
    amount_paid: number;
    status: ScheduleStatus;
}

export interface InstallmentDetails {
    plan_name: string | null;

    // New Interest Fields
    interest_rate: number;
    interest_amount: number;

    // Debt Structure
    down_payment: number;
    total_financed: number; // (Principal + Interest)
    start_date: string;

    schedule: InstallmentScheduleItem[];
}

// --- Main Return Type for ins_get_order_details ---
export interface OrderDetails {
    order_info: OrderHeaderInfo;
    customer: CustomerSummary;
    financials: FinancialSummary;
    items: OrderItemDetail[];
    payments: PaymentHistoryItem[];
    installment_details: InstallmentDetails | null;
}

// --- Payment Creation Types (Kept for completeness of the Service) ---
export interface CreatePaymentParams {
    p_account_id: number;
    p_order_id: number;
    p_amount_paid: number;
    p_payment_method: string;
    p_tendered_amount?: number;
    p_created_at?: string;
}

export interface CreatePaymentResult {
    payment_id: number;
    new_remaining_balance: number;
    order_status: OrderStatus;
}