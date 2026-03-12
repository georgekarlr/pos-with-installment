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
        const getOfflineFallback = () => {
            const cached = localStorage.getItem('ins_dashboard_stats_cache');
            if (cached) {
                return { data: JSON.parse(cached) as DashboardStats, error: null };
            }
            return {
                data: {
                    total_sales: 0,
                    cash_collected: 0,
                    total_refunds: 0,
                    expected_collections: 0,
                    total_outstanding_debt: 0,
                    overdue_count: 0,
                    recent_sales: []
                },
                error: 'Offline and no cached data available.'
            };
        };

        if (!navigator.onLine) {
            return getOfflineFallback();
        }

        try {
            const { data, error } = await supabase.rpc('ins_get_dashboard_stats', {
                p_account_id: params.p_account_id,
                p_start_date: params.p_start_date,
                p_end_date: params.p_end_date
            });

            if (error) {
                if (error.message.includes('Failed to fetch')) {
                    return getOfflineFallback();
                }
                return { data: null, error: error.message };
            }

            if (!data) {
                return { data: null, error: 'Failed to load dashboard statistics.' };
            }

            try {
                localStorage.setItem('ins_dashboard_stats_cache', JSON.stringify(data));
            } catch (e) {
                console.error('Error caching dashboard stats', e);
            }

            return { data: data as DashboardStats, error: null };

        } catch (err: any) {
            if (err.message && err.message.includes('Failed to fetch')) {
                return getOfflineFallback();
            }
            return {
                data: null,
                error: err.message || 'An unexpected error occurred while fetching dashboard stats.'
            };
        }
    }
}