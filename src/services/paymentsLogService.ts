// services/paymentsLogService.ts
import { supabase } from '../lib/supabase';
import type {
    PaymentLogItem,
    GetPaymentsLogParams,
    ServiceResponse
} from '../types/paymentsLog';

export class PaymentsLogService {

    /**
     * Fetches the detailed payments log (Cash Drawer) with categorization.
     * Useful for End-of-Day reports or auditing money flow.
     */
    static async getPaymentsLog(params: GetPaymentsLogParams = {}): Promise<ServiceResponse<PaymentLogItem[]>> {
        try {
            const { data, error } = await supabase.rpc('ins_get_payments_log', {
                p_start_date: params.p_start_date ?? null,
                p_end_date: params.p_end_date ?? null,
                p_search_term: params.p_search_term ?? '',
                p_limit: params.p_limit ?? 50,
                p_offset: params.p_offset ?? 0
            });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data: data as PaymentLogItem[], error: null };

        } catch (err: any) {
            return {
                data: null,
                error: err.message || 'An unexpected error occurred while fetching the payments log.'
            };
        }
    }
}