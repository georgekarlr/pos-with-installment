// services/dashboardService.ts
import { supabase } from '../lib/supabase';
import type {
    DashboardStats,
    GetDashboardStatsParams,
    ServiceResponse
} from '../types/dashboard';

export class DashboardService {

    /**
     * Fetches aggregated statistics for the dashboard.
     * Includes revenue, cash flow, debt summary, and recent transactions.
     */
    static async getStats(params: GetDashboardStatsParams): Promise<ServiceResponse<DashboardStats>> {
        try {
            const { data, error } = await supabase.rpc('ins_get_dashboard_stats', {
                p_account_id: params.p_account_id,
                p_start_date: params.p_start_date,
                p_end_date: params.p_end_date
            });

            if (error) {
                return { data: null, error: error.message };
            }

            // The function returns a single JSON object, so data is not an array (unless RPC behavior varies, usually single object for json return types)
            // If Supabase RPC returns it as a single object directly:
            if (!data) {
                return { data: null, error: 'Failed to load dashboard statistics.' };
            }

            return { data: data as DashboardStats, error: null };

        } catch (err: any) {
            return {
                data: null,
                error: err.message || 'An unexpected error occurred while fetching dashboard stats.'
            };
        }
    }
}