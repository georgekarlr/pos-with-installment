// services/salesListService.ts
import { supabase } from '../lib/supabase';
import type {
    SalesListItem,
    GetSalesListParams,
    ServiceResponse
} from '../types/salesList';

export class SalesListService {

    /**
     * Fetches a comprehensive list of sales.
     * Now includes separate fields for Product Total vs Grand Total (with interest).
     * Filtering is done based on the Business Date (sale_date).
     */
    static async getSalesList(params: GetSalesListParams = {}): Promise<ServiceResponse<SalesListItem[]>> {
        try {
            const { data, error } = await supabase.rpc('ins_get_sales_list', {
                p_search_term: params.p_search_term ?? '',
                p_sale_type: params.p_sale_type ?? null,
                p_status: params.p_status ?? null,
                p_start_date: params.p_start_date ?? null,
                p_end_date: params.p_end_date ?? null,
                p_limit: params.p_limit ?? 20,
                p_offset: params.p_offset ?? 0
            });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data: data as SalesListItem[], error: null };

        } catch (err: any) {
            return {
                data: null,
                error: err.message || 'An unexpected error occurred while fetching the sales list.'
            };
        }
    }
}