// services/salesService.ts
import { supabase } from '../lib/supabase';
import type {
    ProcessSaleParams,
    ProcessSaleResult,
    ServiceResponse
} from '../types/sales';
import {getCurrentDate} from "../utils/schedule.ts";

export class SalesService {

    /**
     * Processes a new sale (Order).
     * Supports Full Payments and Installments (with interest calculations).
     *
     * @param params - The sale details including items, payment info, interest, schedule, and optional totals override.
     * @returns ServiceResponse containing the new order ID and status.
     */
    static async processSale(params: ProcessSaleParams): Promise<ServiceResponse<ProcessSaleResult>> {
        try {
            // Prepare the parameters mapping strictly to the SQL function arguments
            const rpcParams = {
                p_account_id: params.p_account_id,
                p_customer_id: params.p_customer_id,
                p_sale_type: params.p_sale_type,
                p_items: params.p_items,
                p_payment: params.p_payment,
                p_installment_plan_id: params.p_installment_plan_id ?? null,
                p_custom_schedule: params.p_custom_schedule ?? null,

                // Date handling
                p_sale_date: getCurrentDate(),

                // Interest Parameters
                p_interest_rate: params.p_interest_rate ?? 0,
                p_interest_amount: params.p_interest_amount ?? 0,

                // NEW: Total Overrides (Pass null to let DB calculate)
                p_total_with_interest: params.p_total_with_interest ?? null,
                p_total_financed: params.p_total_financed ?? null
            };

            const { data, error } = await supabase.rpc('ins_process_sale', rpcParams);

            if (error) {
                return { data: null, error: error.message };
            }

            // The function returns a TABLE, so data will be an array of rows.
            if (!data || data.length === 0) {
                return { data: null, error: 'Transaction failed: No response from server.' };
            }

            // Cast the first result row to our result interface
            return { data: data[0] as ProcessSaleResult, error: null };

        } catch (err: any) {
            return {
                data: null,
                error: err.message || 'An unexpected error occurred while processing the sale.'
            };
        }
    }
}