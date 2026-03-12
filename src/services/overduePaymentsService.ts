
// services/overduePaymentsService.ts
import { supabase } from '../lib/supabase';
import type {
    OverduePayment,
    GetOverduePaymentsParams,
    ServiceResponse
} from '../types/overdue';

export class OverduePaymentsService {

    /**
     * Fetches a list of payments that are late.
     * Includes items marked 'overdue' OR items marked 'pending' that are past their due date.
     * Sorted by the most overdue items first.
     */
    static async getOverduePayments(params: GetOverduePaymentsParams = {}): Promise<ServiceResponse<OverduePayment[]>> {
        try {
            const { data, error } = await supabase.rpc('ins_get_overdue_payments', {
                p_search_term: params.p_search_term ?? '',
                p_limit: params.p_limit ?? 50
            });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data: data as OverduePayment[], error: null };

        } catch (err: any) {
            return {
                data: null,
                error: err.message || 'An unexpected error occurred while fetching overdue payments.'
            };
        }
    }
}