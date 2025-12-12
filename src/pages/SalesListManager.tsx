// pages/SalesListManager.tsx (or components/sales/SalesListManager.tsx)

import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    Calendar,
    ChevronRight,
    Briefcase,
    LayoutList,
    Loader2,
    XCircle, CreditCard,
    RefreshCcw
} from 'lucide-react';

// --- Types ---
import { SaleType, OrderStatus, SalesListItem } from '../types/salesList';
import { OrderDetails } from '../types/orderDetails';

// --- Services ---
import { SalesListService } from '../services/salesListService';
import { OrderDetailsService } from '../services/orderDetailsService';

// --- Components ---
import Modal from '../components/ui/Modal';
import SaleDetails from '../components/sales/SaleDetails';

const SalesListManager: React.FC = () => {

    // ===========================
    // 1. STATE MANAGEMENT
    // ===========================

    // --- Main List State ---
    const [sales, setSales] = useState<SalesListItem[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    // --- Filter State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [saleType, setSaleType] = useState<SaleType | 'all'>('all');
    const [status, setStatus] = useState<OrderStatus | 'all'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // --- Modal / Detail State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [detailedOrder, setDetailedOrder] = useState<OrderDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    // ===========================
    // 2. DATA FETCHING
    // ===========================

    /**
     * Fetches the summary list for the table.
     * Wrapped in useCallback for dependency management.
     */
    const fetchSalesList = useCallback(async () => {
        setLoadingList(true);
        const { data, error } = await SalesListService.getSalesList({
            p_search_term: searchTerm,
            p_sale_type: saleType === 'all' ? null : saleType,
            p_status: status === 'all' ? null : status,
            p_start_date: startDate || null,
            p_end_date: endDate || null,
            p_limit: 50
        });

        if (error) {
            setListError("Failed to load sales list.");
        } else {
            setSales(data || []);
            setListError(null);
        }
        setLoadingList(false);
    }, [searchTerm, saleType, status, startDate, endDate]);

    /**
     * Fetches the DEEP details for a single order.
     * Used when opening the modal OR refreshing after a payment.
     */
    const fetchOrderDetails = async (orderId: number) => {
        setLoadingDetails(true);
        setDetailError(null);

        const { data, error } = await OrderDetailsService.getOrderDetails(orderId);

        if (error) {
            setDetailError(error);
            setDetailedOrder(null);
        } else {
            setDetailedOrder(data);
        }
        setLoadingDetails(false);
    };

    // --- Effects ---

    // Debounce search input to prevent API spam
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSalesList();
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [fetchSalesList]);

    // ===========================
    // 3. HANDLERS
    // ===========================

    // User clicks a row in the table
    const handleRowClick = (orderId: number) => {
        setSelectedOrderId(orderId);
        setIsModalOpen(true);
        fetchOrderDetails(orderId);
    };

    // Callback passed to <SaleDetails />
    // Triggered after a successful payment
    const handleDataRefresh = () => {
        // 1. Refresh the modal content to show new payment/balance
        if (selectedOrderId) {
            fetchOrderDetails(selectedOrderId);
        }
        // 2. Refresh the background table to update status/totals
        fetchSalesList();
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Delay clearing data slightly for smooth animation, or clear immediately
        setTimeout(() => {
            setSelectedOrderId(null);
            setDetailedOrder(null);
        }, 300);
    };

    // ===========================
    // 4. UI HELPERS
    // ===========================

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(val);

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'defaulted': return 'bg-red-100 text-red-800 border-red-200';
            case 'refunded': return 'bg-gray-100 text-gray-600 line-through border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // ===========================
    // 5. RENDER
    // ===========================

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <LayoutList className="mr-2 text-blue-600" /> Sales Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage orders, track installments, and process payments.</p>
                </div>
            </div>

            {/* --- Filters Bar --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">

                {/* Search */}
                <div className="flex-1 relative min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Customer, Seller, Order ID..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Type Filter */}
                <div className="relative min-w-[160px]">
                    <select
                        className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white appearance-none cursor-pointer"
                        value={saleType}
                        onChange={(e) => setSaleType(e.target.value as SaleType | 'all')}
                    >
                        <option value="all">All Sale Types</option>
                        <option value="full_payment">Full Payment</option>
                        <option value="installment_with_down">Installment w/ Down</option>
                        <option value="pure_installment">Pure Installment</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* Status Filter */}
                <div className="relative min-w-[140px]">
                    <select
                        className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white appearance-none cursor-pointer"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as OrderStatus | 'all')}
                    >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="defaulted">Defaulted</option>
                        <option value="refunded">Refunded</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <input
                        type="date"
                        className="flex-1 lg:w-36 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-600"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        className="flex-1 lg:w-36 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-600"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                {/* Always-Available Refresh */}
                <div className="lg:ml-auto">
                    <button
                        onClick={fetchSalesList}
                        disabled={loadingList}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                            loadingList
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-blue-700 hover:bg-blue-50 border-blue-200'
                        }`}
                        aria-label="Refresh sales list"
                        title="Refresh"
                    >
                        {loadingList ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={16} />
                                Refreshing...
                            </>
                        ) : (
                            <>
                                <RefreshCcw className="mr-2" size={16} />
                                Refresh
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* --- Main Content --- */}

            {/* Error State */}
            {listError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center justify-between">
                    <div className="flex items-center">
                        <XCircle className="mr-2" size={20} />
                        <span className="mr-4">{listError}</span>
                    </div>
                    <button
                        onClick={fetchSalesList}
                        disabled={loadingList}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                            loadingList
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-red-700 hover:bg-red-100 border-red-200'
                        }`}
                    >
                        {loadingList ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={16} />
                                Refreshing...
                            </>
                        ) : (
                            <>Refresh</>
                        )}
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loadingList ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                    <p className="text-sm font-medium text-gray-500">Loading records...</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                        {/* 1. Wrapper handles BOTH Vertical (y) and Horizontal (x) scrolling */}
                        <div className="max-h-[70vh] overflow-auto custom-scrollbar">

                            {/* 2. Added min-w-[1000px] to FORCE horizontal scroll on small screens */}
                            <table className="min-w-[1000px] w-full divide-y divide-gray-200 relative">

                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    {/* Note: Added whitespace-nowrap to headers to prevent wrapping */}
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap">Seller</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap">Type</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap">Total</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap">Balance</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap">Action</th>
                                </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                {sales.map((sale) => (
                                    <tr
                                        key={sale.order_id}
                                        onClick={() => handleRowClick(sale.order_id)}
                                        className="hover:bg-blue-50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(sale.sale_date).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">{sale.customer_name}</span>
                                                <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">#{sale.order_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {sale.seller}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 capitalize">
                                                {sale.sale_type.replace(/_/g, ' ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                            {formatCurrency(sale.grand_total)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            {sale.remaining_balance > 0 ? (
                                                <span className="text-orange-600 font-bold">{formatCurrency(sale.remaining_balance)}</span>
                                            ) : (
                                                <span className="text-green-600 font-medium">Paid</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border capitalize ${getStatusStyle(sale.status)}`}>
                                {sale.status.replace('_', ' ')}
                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {sales.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                                            No sales found matching your filters.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {sales.map((sale) => (
                            <div
                                key={sale.order_id}
                                onClick={() => handleRowClick(sale.order_id)}
                                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 active:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                        <Calendar size={14} className="mr-1" />
                                        {new Date(sale.sale_date).toLocaleString()}
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize border ${getStatusStyle(sale.status)}`}>
                                        {sale.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">{sale.customer_name}</h3>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <Briefcase size={12} className="mr-1" />
                                        Seller: {sale.seller} &bull; Order #{sale.order_id}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600 mt-2 bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100">
                                        <CreditCard size={12} className="inline mr-1 text-gray-400"/>
                                        <span className="capitalize">{sale.sale_type.replace(/_/g, ' ')}</span>
                                    </div>
                                </div>


                                <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-0.5 uppercase font-medium">Contract Price</div>
                                        <div className="font-semibold text-gray-900">{formatCurrency(sale.grand_total)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 mb-0.5 uppercase font-medium">Balance</div>
                                        <div className={`text-lg font-bold ${sale.remaining_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                            {formatCurrency(sale.remaining_balance)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {sales.length === 0 && (
                            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                No records found.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* --- Detail Modal --- */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Transaction Details"
            >
                {/* Modal Loading State */}
                {loadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                        <p className="text-gray-500 font-medium animate-pulse">Retrieving order details...</p>
                    </div>
                ) : detailError ? (
                    // Modal Error State
                    <div className="p-8 text-center">
                        <div className="bg-red-100 p-3 rounded-full inline-flex mb-4">
                            <XCircle className="text-red-600" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Details</h3>
                        <p className="text-gray-600 mb-6">{detailError}</p>
                        <button
                            onClick={() => selectedOrderId && fetchOrderDetails(selectedOrderId)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : detailedOrder ? (
                    // Success State: Render Child Component
                    <SaleDetails
                        order={detailedOrder}
                        onRefresh={handleDataRefresh}
                    />
                ) : null}
            </Modal>
        </div>
    );
};

export default SalesListManager;