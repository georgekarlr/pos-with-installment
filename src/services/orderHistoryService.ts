// services/orderHistoryService.ts
import { supabase } from '../lib/supabase';
import type {
    OrderHistoryItem,
    GetOrderHistoryParams,
    ServiceResponse
} from '../types/orderHistory';

export class OrderHistoryService {

    /**
     * Fetches the order history with optional filtering by status, date range, and search term.
     */
    static async getOrderHistory(params: GetOrderHistoryParams = {}): Promise<ServiceResponse<OrderHistoryItem[]>> {
        try {
            const { data, error } = await supabase.rpc('ins_get_order_history', {
                p_search_term: params.p_search_term ?? '',
                p_status: params.p_status ?? null,
                p_start_date: params.p_start_date ?? null,
                p_end_date: params.p_end_date ?? null,
                p_limit: params.p_limit ?? 20,
                p_offset: params.p_offset ?? 0
            });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data: data as OrderHistoryItem[], error: null };

        } catch (err: any) {
            return {
                data: null,
                error: err.message || 'An unexpected error occurred while fetching order history.'
            };
        }
    }
}