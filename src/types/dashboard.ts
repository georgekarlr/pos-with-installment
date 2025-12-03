// types/dashboard.ts

// --- Generic Response Wrapper ---
export interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
}

// --- Enum Types ---
// Reusing OrderStatus for recent sales list
export type OrderStatus = 'completed' | 'ongoing' | 'defaulted' | 'refunded' | 'partially_refunded';

// --- Nested Objects ---

export interface RecentSale {
    id: number;
    total_amount: number;
    status: OrderStatus;
    created_at: string; // ISO 8601 Timestamp
}

// --- Main Return Object ---

export interface DashboardStats {
    /** Gross sales (Completed + Ongoing) in the period */
    total_sales: number;

    /** Actual money received in the period */
    cash_collected: number;

    /** Money returned to customers */
    total_refunds: number;

    /** Installments scheduled for this period (Forecast) */
    expected_collections: number;

    /** Global active debt across all time */
    total_outstanding_debt: number;

    /** Count of overdue installments or pending items past due date */
    overdue_count: number;

    /** Top 5 most recent orders */
    recent_sales: RecentSale[];
}

// --- Parameter Interface ---

export interface GetDashboardStatsParams {
    p_account_id: number;
    p_start_date: string; // ISO String
    p_end_date: string;   // ISO String
}