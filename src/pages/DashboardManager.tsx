// components/dashboard/DashboardManager.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from "../contexts/AuthContext";
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    AlertTriangle,
    Wallet,
    Calendar,
    ArrowDownLeft
} from 'lucide-react';
import {DashboardStats} from "../types/dashboard.ts";
import {DashboardService} from "../services/dashboardService.ts";
import DashboardStatCard from "../components/dashboard/DashboardStatsCard.tsx";
import RecentActivity from "../components/dashboard/RecentActivity.tsx";

type TimeRange = 'today' | 'week' | 'month' | 'year';

const DashboardManager: React.FC = () => {
    const { persona } = useAuth();
    const accountId = persona?.id ?? null;

    // --- State ---
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    // --- Date Logic ---
    const getDateRange = (range: TimeRange) => {
        const end = new Date();
        const start = new Date();

        switch (range) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                // Set to 7 days ago
                start.setDate(start.getDate() - 7);
                start.setHours(0, 0, 0, 0);
                break;
            case 'month':
                // Set to 1st of current month
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                break;
            case 'year':
                start.setMonth(0, 1);
                start.setHours(0, 0, 0, 0);
                break;
        }

        return {
            start: start.toISOString(),
            end: end.toISOString()
        };
    };

    // --- Fetch Data ---
    const fetchStats = useCallback(async () => {
        if (!accountId) return;

        setLoading(true);
        const { start, end } = getDateRange(timeRange);

        const { data, error } = await DashboardService.getStats({
            p_account_id: accountId,
            p_start_date: start,
            p_end_date: end
        });

        if (error) setError("Could not load dashboard data.");
        else {
            setStats(data);
            setError(null);
        }
        setLoading(false);
    }, [accountId, timeRange]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // --- Helpers ---
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    // --- Render ---
    if (!accountId) {
        return <div className="p-8 text-center text-gray-500">Please sign in to view the dashboard.</div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
                </div>

                {/* Time Range Selector */}
                <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                    {(['today', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                                timeRange === range
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : stats ? (
                <>
                    {/* Alert Banner for Overdue */}
                    {stats.overdue_count > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between text-red-800 animate-pulse-slow">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-red-600" />
                                <span className="font-semibold">Action Required: {stats.overdue_count} overdue payments detected.</span>
                            </div>
                            <button className="text-sm bg-white border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 font-medium">
                                Review Now
                            </button>
                        </div>
                    )}

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <DashboardStatCard
                            title="Cash Collected"
                            value={formatCurrency(stats.cash_collected)}
                            icon={Wallet}
                            colorClass="bg-green-100 text-green-600"
                            description="Net cash received in period"
                        />
                        <DashboardStatCard
                            title="Total Sales (Gross)"
                            value={formatCurrency(stats.total_sales)}
                            icon={TrendingUp}
                            colorClass="bg-blue-100 text-blue-600"
                            description="Includes ongoing plans"
                        />
                        <DashboardStatCard
                            title="Expected Collections"
                            value={formatCurrency(stats.expected_collections)}
                            icon={Calendar}
                            colorClass="bg-purple-100 text-purple-600"
                            description="Upcoming installments (Period)"
                        />
                        <DashboardStatCard
                            title="Total Refunds"
                            value={formatCurrency(stats.total_refunds)}
                            icon={ArrowDownLeft}
                            colorClass="bg-orange-100 text-orange-600"
                            description="Returns & Reversals"
                        />
                    </div>

                    {/* Secondary Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Outstanding Debt - Spans 1 column */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-300 font-medium">Total Outstanding Debt</h3>
                                    <div className="bg-white/10 p-2 rounded-lg">
                                        <CreditCard size={20} />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1">
                                    {formatCurrency(stats.total_outstanding_debt)}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Global Receivables (All Time)
                                </p>
                                <div className="mt-6 pt-4 border-t border-gray-700">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Overdue items</span>
                                        <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs font-bold">
                                            {stats.overdue_count}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Widget (e.g. Quick Action) */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="text-blue-600" size={20} />
                                    <h3 className="font-bold text-blue-900">Quick Sale</h3>
                                </div>
                                <p className="text-sm text-blue-700 mb-4">Create a new order instantly.</p>
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                                    New Order
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity - Spans 2 columns */}
                        <div className="lg:col-span-2 h-full">
                            <RecentActivity sales={stats.recent_sales} />
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default DashboardManager;