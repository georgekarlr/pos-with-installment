// components/sales/SaleDetails.tsx
import React, { useState } from 'react';
import { OrderDetails } from '../../types/orderDetails';
import Modal from '../ui/Modal';
import ProcessPaymentForm from './ProcessPaymentForm';
import {
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    Package,
    MapPin,
    Phone,
    History,
    FileText,
    TrendingUp,
    Wallet,
    Calendar,
    CreditCard
} from 'lucide-react';

interface SaleDetailsProps {
    order: OrderDetails;
    onRefresh: () => void; // Trigger parent to reload data after payment
}

const SaleDetails: React.FC<SaleDetailsProps> = ({ order, onRefresh }) => {

    // --- State ---
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

    // --- Destructuring Data ---
    const {
        order_info,
        customer,
        financials,
        items,
        payments,
        installment_details
    } = order;

    // --- Helpers ---
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    const formatSimpleDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const formatString = (str: string) =>
        str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Calculate Financial Progress
    const progressPercent = Math.min(
        100,
        Math.max(0, (financials.total_paid / financials.grand_total) * 100)
    );

    // --- Style Generators ---
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'completed': return 'text-green-700 bg-green-50 border-green-200';
            case 'ongoing': return 'text-blue-700 bg-blue-50 border-blue-200';
            case 'defaulted': return 'text-red-700 bg-red-50 border-red-200';
            case 'refunded': return 'text-gray-600 bg-gray-100 border-gray-200 line-through';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getScheduleStatusColor = (status: string) => {
        switch(status) {
            case 'paid': return 'text-green-700 bg-green-100 border border-green-200';
            case 'overdue': return 'text-red-700 bg-red-100 border border-red-200 font-semibold';
            case 'partial': return 'text-orange-700 bg-orange-100 border border-orange-200';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6 pb-4">

            {/* 1. Header & Status Banner */}
            <div className={`flex flex-col items-center justify-center p-5 rounded-xl border ${getStatusColor(order_info.status)}`}>
                <div className="flex justify-between w-full items-start mb-2 opacity-75">
                    <span className="text-xs font-bold uppercase tracking-wider">Order #{order_info.id}</span>
                    <span className="text-xs font-medium">{formatDate(order_info.date)}</span>
                </div>
                <div className="text-3xl font-bold flex items-center capitalize mb-1">
                    {order_info.status === 'completed' && <CheckCircle2 size={28} className="mr-3"/>}
                    {order_info.status === 'ongoing' && <Clock size={28} className="mr-3"/>}
                    {order_info.status === 'defaulted' && <AlertCircle size={28} className="mr-3"/>}
                    {formatString(order_info.status)}
                </div>
                <div className="text-sm font-medium opacity-80 flex items-center bg-white/50 px-3 py-1 rounded-full">
                    <CreditCard size={14} className="mr-2"/>
                    {formatString(order_info.sale_type)}
                </div>
            </div>

            {/* 2. Primary Action: Process Payment */}
            {financials.remaining_balance > 0 && order_info.status !== 'defaulted' && (
                <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-bold text-lg flex items-center justify-center transition-all transform active:scale-98"
                >
                    <Wallet className="mr-2" size={22} />
                    Process Payment
                </button>
            )}

            {/* 3. Financial Progress Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Total Paid</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(financials.total_paid)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Contract Price</p>
                        <p className="text-xl font-semibold text-gray-900">{formatCurrency(financials.grand_total)}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-4 mb-3 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                            order_info.status === 'defaulted' ? 'bg-red-500' :
                                progressPercent === 100 ? 'bg-green-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400 font-medium">{progressPercent.toFixed(1)}% Settled</span>
                    <div className="text-right">
                        <span className="text-xs text-gray-500 mr-2 uppercase font-semibold">Remaining Balance</span>
                        <span className="text-lg font-bold text-gray-800">{formatCurrency(financials.remaining_balance)}</span>
                    </div>
                </div>
            </div>

            {/* 4. Customer Information */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center uppercase tracking-wide">
                    <User size={16} className="mr-2 text-blue-600" /> Customer Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Full Name</div>
                        <div className="font-semibold text-gray-900">{customer.name}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Phone Number</div>
                        <div className="font-medium text-gray-900 flex items-center">
                            {customer.phone ? (
                                <><Phone size={14} className="mr-1.5 text-gray-400"/> {customer.phone}</>
                            ) : <span className="text-gray-400 italic">Not provided</span>}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Address</div>
                        <div className="font-medium text-gray-900 flex items-start">
                            <MapPin size={14} className="mr-1.5 text-gray-400 mt-0.5 shrink-0"/>
                            {customer.address || <span className="text-gray-400 italic">Not provided</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Order Items Table */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wide">
                    <Package size={16} className="mr-2 text-blue-600" /> Purchased Items
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qty</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    <div className="font-medium">{item.product_name}</div>
                                    {item.sku && <div className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</div>}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.line_total)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 6. Installment Schedule (Only if exists) */}
            {installment_details && (
                <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wide">
                        <TrendingUp size={16} className="mr-2 text-blue-600" />
                        Schedule ({formatString(installment_details.plan_name || 'Plan')})
                    </h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-64 overflow-y-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Paid</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {installment_details.schedule.map((sch, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-700">
                                        {formatSimpleDate(sch.due_date)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                        {formatCurrency(sch.amount_due)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        {sch.amount_paid > 0 ? (
                                            <span className="text-green-600 font-medium">{formatCurrency(sch.amount_paid)}</span>
                                        ) : <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 text-[10px] rounded-full uppercase tracking-wide ${getScheduleStatusColor(sch.status)}`}>
                                                {sch.status}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 7. Payment History */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wide">
                    <History size={16} className="mr-2 text-blue-600" /> Payment History
                </h4>
                {payments.length > 0 ? (
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {payments.map((pmt) => (
                                <tr key={pmt.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-600 flex items-center">
                                        <Calendar size={12} className="mr-2 text-gray-400"/>
                                        {formatDate(pmt.date)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 capitalize">{formatString(pmt.method)}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                                        + {formatCurrency(pmt.amount)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 italic bg-gray-50 border border-gray-100 p-6 rounded-xl text-center">
                        No payments recorded yet.
                    </div>
                )}
            </div>

            {/* 8. Notes */}
            {order_info.notes && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-yellow-800 mb-2 flex items-center">
                        <FileText size={14} className="mr-2" /> Notes
                    </h4>
                    <p className="text-sm text-yellow-900 leading-relaxed">{order_info.notes}</p>
                </div>
            )}

            {/* --- Payment Modal --- */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                title="" // Empty title because ProcessPaymentForm has its own header
            >
                <ProcessPaymentForm
                    orderId={order_info.id}
                    remainingBalance={financials.remaining_balance}
                    onCancel={() => setPaymentModalOpen(false)}
                    onSuccess={() => {
                        setPaymentModalOpen(false);
                        onRefresh(); // Reload data
                    }}
                />
            </Modal>
        </div>
    );
};

export default SaleDetails;