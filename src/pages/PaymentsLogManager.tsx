// components/payments/PaymentsLogManager.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Search,
    Calendar,
    DollarSign,
    Receipt,
    ChevronRight,
} from 'lucide-react';
import {PaymentLogItem} from "../types/paymentsLog.ts";
import {PaymentsLogService} from "../services/paymentsLogService.ts";
import Modal from "../components/ui/Modal.tsx";
import PaymentReceipt from "../components/payments/PaymentReceipt.tsx";

const PaymentsLogManager: React.FC = () => {

    // --- State ---
    const [logs, setLogs] = useState<PaymentLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    // Default to today for start date
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');

    // Modal
    const [selectedLog, setSelectedLog] = useState<PaymentLogItem | null>(null);

    // --- Fetch Data ---
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await PaymentsLogService.getPaymentsLog({
            p_search_term: searchTerm,
            p_start_date: startDate || null,
            p_end_date: endDate || null,
            p_limit: 100 // Higher limit for logs to see full day history
        });

        if (error) setError("Failed to retrieve payment records.");
        else {
            setLogs(data || []);
            setError(null);
        }
        setLoading(false);
    }, [searchTerm, startDate, endDate]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchLogs();
        }, 400); // Debounce
        return () => clearTimeout(timeoutId);
    }, [fetchLogs]);

    // --- Calculations ---
    const totalCollected = useMemo(() => {
        return logs.reduce((sum, item) => sum + item.net_amount, 0);
    }, [logs]);

    // --- Helpers ---
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

    const getCategoryColor = (cat: string) => {
        if (cat === 'Down Payment') return 'bg-blue-100 text-blue-800';
        if (cat === 'Full Payment') return 'bg-green-100 text-green-800';
        return 'bg-purple-100 text-purple-800'; // Monthly Installment
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Receipt className="mr-2" /> Cash Drawer Log
                </h1>
                <p className="text-gray-500 text-sm mt-1">Audit daily transactions and verify cash collected.</p>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">Total Collected (Selected Period)</p>
                        <h2 className="text-3xl font-bold">{formatCurrency(totalCollected)}</h2>
                        <p className="text-xs text-blue-200 mt-2 opacity-80">
                            Based on {logs.length} transaction records
                        </p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                        <DollarSign size={32} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search customer, Order ID..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Date Range */}
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Calendar size={16} />
                        </span>
                        <input
                            type="date"
                            className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-600"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-600"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr
                                    key={log.payment_id}
                                    onClick={() => setSelectedLog(log)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(log.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{log.customer_name}</span>
                                            <span className="text-xs text-gray-400">Order #{log.order_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(log.payment_category)}`}>
                                                {log.payment_category}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                                        {log.method}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                        {formatCurrency(log.net_amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-gray-400 hover:text-blue-600">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No payments found for this period.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {logs.map((log) => (
                            <div
                                key={log.payment_id}
                                onClick={() => setSelectedLog(log)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 active:bg-gray-50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-gray-500 font-medium">{formatDate(log.created_at)}</span>
                                    <span className="text-xs text-gray-400">#{log.order_id}</span>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-gray-900">{log.customer_name}</h3>
                                    <span className="font-bold text-gray-900">{formatCurrency(log.net_amount)}</span>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(log.payment_category)}`}>
                                        {log.payment_category}
                                    </span>
                                    <span className="text-xs uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                        {log.method}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                No records found.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Receipt Modal */}
            <Modal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="Payment Receipt"
            >
                {selectedLog && (
                    <PaymentReceipt log={selectedLog} />
                )}
            </Modal>
        </div>
    );
};

export default PaymentsLogManager;