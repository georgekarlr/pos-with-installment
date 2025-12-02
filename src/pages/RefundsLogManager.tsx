// components/refunds/RefundsLogManager.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';

import {
    RotateCcw,
    Calendar,
    ChevronRight,
    AlertCircle,
    TrendingDown
} from 'lucide-react';
import {RefundLogItem} from "../types/refundsLog.ts";
import {RefundsLogService} from "../services/refundsLogService.ts";
import Modal from "../components/ui/Modal.tsx";
import RefundDetails from "../components/refunds/RefundDetails.tsx";

const RefundsLogManager: React.FC = () => {

    // --- State ---
    const [refunds, setRefunds] = useState<RefundLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters (Default to current month)
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');

    // Modal
    const [selectedRefund, setSelectedRefund] = useState<RefundLogItem | null>(null);

    // --- Fetch Data ---
    const fetchRefunds = useCallback(async () => {
        setLoading(true);
        const { data, error } = await RefundsLogService.getRefundsLog({
            p_start_date: startDate || null,
            p_end_date: endDate || null,
            p_limit: 50
        });

        if (error) setError("Failed to retrieve refund records.");
        else {
            setRefunds(data || []);
            setError(null);
        }
        setLoading(false);
    }, [startDate, endDate]);

    useEffect(() => {
        fetchRefunds();
    }, [fetchRefunds]);

    // --- Calculations ---
    const totalRefunded = useMemo(() => {
        return refunds.reduce((sum, item) => sum + item.amount_refunded, 0);
    }, [refunds]);

    // --- Helpers ---
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <RotateCcw className="mr-2 text-red-600" /> Refunds & Reversals
                </h1>
                <p className="text-gray-500 text-sm mt-1">Audit returned items and cash outflows.</p>
            </div>

            {/* Summary Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Refunded (Period)</p>
                    <h2 className="text-3xl font-bold text-gray-900">{formatCurrency(totalRefunded)}</h2>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                    <TrendingDown size={20} className="mr-2" />
                    <span className="text-sm font-medium">{refunds.length} transactions</span>
                </div>
            </div>

            {/* Date Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center text-gray-600 text-sm font-medium">
                        <Calendar size={18} className="mr-2 text-gray-400" />
                        Filter Date Range:
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <input
                            type="date"
                            className="flex-1 sm:w-40 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm text-gray-600"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            className="flex-1 sm:w-40 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm text-gray-600"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    {error}
                </div>
            )}

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {refunds.map((refund) => (
                                <tr
                                    key={refund.refund_id}
                                    onClick={() => setSelectedRefund(refund)}
                                    className="hover:bg-red-50/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(refund.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        #{refund.order_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {refund.customer_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {refund.method}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                        {refund.reason || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-red-600">
                                        {formatCurrency(refund.amount_refunded)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-gray-400 hover:text-red-600">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {refunds.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No refunds found for this period.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {refunds.map((refund) => (
                            <div
                                key={refund.refund_id}
                                onClick={() => setSelectedRefund(refund)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 active:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{refund.customer_name}</h3>
                                        <p className="text-xs text-gray-400">Order #{refund.order_id}</p>
                                    </div>
                                    <span className="font-bold text-red-600">{formatCurrency(refund.amount_refunded)}</span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    <span className="font-medium">Reason:</span> {refund.reason || 'N/A'}
                                </p>

                                <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs text-gray-500">
                                    <span>{formatDate(refund.created_at)}</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded capitalize">{refund.method}</span>
                                </div>
                            </div>
                        ))}
                        {refunds.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                No records found.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedRefund}
                onClose={() => setSelectedRefund(null)}
                title="Refund Details"
            >
                {selectedRefund && (
                    <RefundDetails refund={selectedRefund} />
                )}
            </Modal>
        </div>
    );
};

export default RefundsLogManager;