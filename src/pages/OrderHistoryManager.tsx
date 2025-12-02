// components/orders/OrderHistoryManager.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    Download,
    ChevronRight,
    ShoppingBag
} from 'lucide-react';
import {OrderHistoryItem, OrderStatus} from "../types/orderHistory.ts";
import {OrderHistoryService} from "../services/orderHistoryService.ts";
import Modal from "../components/ui/Modal.tsx";
import OrderSummary from "../components/orders/OrderSummary.tsx";

const OrderHistoryManager: React.FC = () => {

    // --- State ---
    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal
    const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);

    // --- Fetch Data ---
    const fetchHistory = useCallback(async () => {
        setLoading(true);
        const { data, error } = await OrderHistoryService.getOrderHistory({
            p_search_term: searchTerm,
            p_status: statusFilter === 'all' ? null : statusFilter,
            p_start_date: startDate || undefined,
            p_end_date: endDate || undefined,
            p_limit: 50 // Fetch last 50 orders
        });

        if (error) setError("Failed to load order history.");
        else {
            setOrders(data || []);
            setError(null);
        }
        setLoading(false);
    }, [searchTerm, statusFilter, startDate, endDate]);

    // Debounce search slightly or just use effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchHistory();
        }, 300); // 300ms debounce for typing
        return () => clearTimeout(timeoutId);
    }, [fetchHistory]);

    // --- Helpers ---
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const formatSaleType = (type: string) =>
        type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const getStatusBadge = (status: string) => {
        const styles = {
            completed: 'bg-green-100 text-green-800',
            ongoing: 'bg-blue-100 text-blue-800',
            defaulted: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-600',
            partially_refunded: 'bg-gray-100 text-gray-600',
        };
        // @ts-ignore - indexing with string
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                    <p className="text-gray-500 text-sm mt-1">View past transactions, check status, and audit sales.</p>
                </div>
                {/* Export Button Placeholder */}
                <button
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={() => alert("Export functionality would go here.")}
                >
                    <Download size={18} className="mr-2" />
                    Export CSV
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">

                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search order ID or customer..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-48">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                        >
                            <option value="all">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="defaulted">Defaulted</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-36">
                        <input
                            type="date"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-600"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="relative flex-1 md:w-36">
                        <input
                            type="date"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-600"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {/* Loading */}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr
                                    key={order.order_id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{order.order_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.customer_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatSaleType(order.sale_type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {formatCurrency(order.total_amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusBadge(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-gray-400 hover:text-blue-600">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.order_id}
                                onClick={() => setSelectedOrder(order)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 active:bg-gray-50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <ShoppingBag size={14} className="mr-1" />
                                        Order #{order.order_id}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-gray-900">{order.customer_name}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${getStatusBadge(order.status)}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-0.5">{formatSaleType(order.sale_type)}</div>
                                        <div className="text-xs text-gray-500">{order.items_count} items</div>
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {formatCurrency(order.total_amount)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title="Order Summary"
            >
                {selectedOrder && (
                    <OrderSummary order={selectedOrder} />
                )}
            </Modal>
        </div>
    );
};

export default OrderHistoryManager;