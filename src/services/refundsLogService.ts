// services/RefundsLogService.ts
import { supabase } from '../lib/supabase';
import type {
    RefundLogItem,
    GetRefundsLogParams,
    ServiceResponse
} from '../types/refundsLog';

export class RefundsLogService {

    /**
     * Fetches the log of processed refunds.
     * Useful for auditing losses and cash reversals.
     */
    static async getRefundsLog(params: GetRefundsLogParams = {}): Promise<ServiceResponse<RefundLogItem[]>> {
        try {
            const { data, error } = await supabase.rpc('ins_get_refunds_log', {
                p_start_date: params.p_start_date ?? null,
                p_end_date: params.p_end_date ?? null,
                p_limit: params.p_limit ?? 50,
                p_offset: params.p_offset ?? 0
            });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data: data as RefundLogItem[], error: null };

        } catch (err: any) {
            return {
                data: null,
                error: err.message || 'An unexpected error occurred while fetching the refunds log.'
            };
        }
    }
}