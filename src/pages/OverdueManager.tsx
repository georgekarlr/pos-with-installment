// components/overdue/OverdueManager.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    AlertCircle,
    Phone,
    Eye,
    AlertTriangle,
    Calendar
} from 'lucide-react';
import {OverduePayment} from "../types/overdue.ts";
import {OverduePaymentsService} from "../services/overduePaymentsService.ts";
import Modal from "../components/ui/Modal.tsx";
import OverdueDetails from "../components/overdue/OverdueDetails.tsx";

const OverdueManager: React.FC = () => {

    // 2. State
    const [payments, setPayments] = useState<OverduePayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [selectedPayment, setSelectedPayment] = useState<OverduePayment | null>(null);

    // 3. Fetch Data
    const fetchOverdue = useCallback(async () => {
        setLoading(true);
        const { data, error } = await OverduePaymentsService.getOverduePayments({
            p_search_term: searchTerm,
            p_limit: 50
        });

        if (error) {
            setError("Failed to load overdue payments.");
        } else {
            setPayments(data || []);
            setError(null);
        }
        setLoading(false);
    }, [searchTerm]);

    useEffect(() => {
        fetchOverdue();
    }, [fetchOverdue]);

    // Helpers
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);

    const getSeverityStyles = (days: number) => {
        if (days > 30) return 'bg-red-100 text-red-800 border-red-200'; // Severe
        if (days > 7) return 'bg-orange-100 text-orange-800 border-orange-200'; // Moderate
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Fresh
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <AlertTriangle className="text-red-600 mr-2" />
                    Overdue Collections
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Manage late payments. Prioritize customers with high "Days Overdue".
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-200">
                    <AlertCircle size={20} className="mr-2" />
                    {error}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {payments.map((payment) => (
                                <tr key={payment.schedule_id} className="hover:bg-red-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{payment.customer_name}</span>
                                            {payment.customer_phone && (
                                                <span className="text-xs text-gray-500 flex items-center mt-1">
                                                        <Phone size={12} className="mr-1" /> {payment.customer_phone}
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        {formatCurrency(payment.amount_due)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(payment.due_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getSeverityStyles(payment.days_overdue)}`}>
                                                {payment.days_overdue} Days Late
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedPayment(payment)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-end"
                                        >
                                            View Details <Eye size={16} className="ml-1" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No overdue payments found. Great job!
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {payments.map((payment) => (
                            <div key={payment.schedule_id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900">{payment.customer_name}</h3>
                                    <span className="font-bold text-gray-900">{formatCurrency(payment.amount_due)}</span>
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityStyles(payment.days_overdue)}`}>
                                        {payment.days_overdue} Days Late
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center">
                                        <Calendar size={12} className="mr-1" />
                                        {new Date(payment.due_date).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                                    {payment.customer_phone ? (
                                        <a
                                            href={`tel:${payment.customer_phone}`}
                                            className="flex items-center justify-center py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
                                        >
                                            <Phone size={16} className="mr-2" /> Call
                                        </a>
                                    ) : (
                                        <button disabled className="flex items-center justify-center py-2 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                            <Phone size={16} className="mr-2" /> No Phone
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedPayment(payment)}
                                        className="flex items-center justify-center py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
                                    >
                                        <Eye size={16} className="mr-2" /> Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedPayment}
                onClose={() => setSelectedPayment(null)}
                title="Collection Details"
            >
                {selectedPayment && (
                    <OverdueDetails payment={selectedPayment} />
                )}
            </Modal>
        </div>
    );
};

export default OverdueManager;