// components/dashboard/Dashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from "../contexts/AuthContext";

import {
    TrendingUp,
    DollarSign,
    AlertTriangle,
    Calendar,
    CreditCard,
    RotateCcw,
    Activity,
    RefreshCw
} from 'lucide-react';
import {DashboardStats} from "../types/dashboard.ts";
import {DashboardService} from "../services/dashboardService.ts";

// --- Sub-Component: Stat Card ---
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
    subText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass, subText }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {subText && <p className="text-xs text-gray-400 mt-2">{subText}</p>}
            </div>
            <div className={`p-3 rounded-lg ${colorClass}`}>
                {icon}
            </div>
        </div>
    </div>
);

// --- Main Dashboard Component ---

const Dashboard: React.FC = () => {
    const { persona } = useAuth();
    const accountId = persona?.id ?? null;

    // --- State ---
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Default Date Range: Current Month
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);

    // --- Fetch Logic ---
    const fetchDashboardStats = useCallback(async () => {
        if (!accountId) return;

        setLoading(true);
        const { data, error } = await DashboardService.getStats({
            p_account_id: accountId,
            p_start_date: startDate,
            p_end_date: endDate
        });

        if (error) {
            setError(error);
        } else {
            setStats(data);
            setError(null);
        }
        setLoading(false);
    }, [accountId, startDate, endDate]);

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    // --- Helpers ---
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(val);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // --- Render ---

    if (!accountId) {
        return <div className="p-8 text-center text-gray-500">Please log in to view the dashboard.</div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Overview of your business performance.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center px-2">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <span className="text-xs font-semibold text-gray-600">Period:</span>
                    </div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-sm border-0 bg-gray-50 rounded px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="hidden sm:inline text-gray-400 self-center">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-sm border-0 bg-gray-50 rounded px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={fetchDashboardStats}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center">
                    <AlertTriangle size={20} className="mr-2" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : stats ? (
                <div className="space-y-6">

                    {/* 1. Primary Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Sales"
                            value={formatCurrency(stats.total_sales)}
                            icon={<TrendingUp size={24} className="text-blue-600" />}
                            colorClass="bg-blue-50"
                            subText="Gross sales (Completed + Ongoing)"
                        />
                        <StatCard
                            title="Cash Collected"
                            value={formatCurrency(stats.cash_collected)}
                            icon={<DollarSign size={24} className="text-green-600" />}
                            colorClass="bg-green-50"
                            subText="Actual money received"
                        />
                        <StatCard
                            title="Outstanding Debt"
                            value={formatCurrency(stats.total_outstanding_debt)}
                            icon={<CreditCard size={24} className="text-orange-600" />}
                            colorClass="bg-orange-50"
                            subText="Global active debt (All time)"
                        />
                    </div>

                    {/* 2. Secondary Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="Expected Collections"
                            value={formatCurrency(stats.expected_collections)}
                            icon={<Activity size={24} className="text-purple-600" />}
                            colorClass="bg-purple-50"
                            subText="Forecast for this period"
                        />
                        <StatCard
                            title="Overdue Items"
                            value={stats.overdue_count}
                            icon={<AlertTriangle size={24} className="text-red-600" />}
                            colorClass="bg-red-50"
                            subText="Installments past due date"
                        />
                        <StatCard
                            title="Refunds"
                            value={formatCurrency(stats.total_refunds)}
                            icon={<RotateCcw size={24} className="text-gray-600" />}
                            colorClass="bg-gray-100"
                            subText="Returned to customers"
                        />
                    </div>

                    {/* 3. Recent Sales List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Last 5 Orders
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-3">Order ID</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Total Amount</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {stats.recent_sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                            #{sale.id}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-500">
                                            {formatDate(sale.created_at)}
                                        </td>
                                        <td className="px-6 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                                    ${sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    sale.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                                        sale.status === 'defaulted' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }
                                                `}>
                                                    {sale.status.replace('_', ' ')}
                                                </span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                                            {formatCurrency(sale.total_amount)}
                                        </td>
                                    </tr>
                                ))}
                                {stats.recent_sales.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                            No recent sales found for this period.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Dashboard;