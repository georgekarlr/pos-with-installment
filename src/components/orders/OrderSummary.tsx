import React from "react";
import { OrderHistoryItem } from "../../types/orderHistory";
import {Calendar, CheckCircle2, Clock, CreditCard, Package, RotateCcw, User, XCircle} from "lucide-react";


interface OrderSummaryProps {
    order: OrderHistoryItem;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {

    // Formatting Helpers
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

    const formatSaleType = (type: string) =>
        type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Status UI Config
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'completed': return { color: 'text-green-600 bg-green-50', icon: CheckCircle2, label: 'Completed' };
            case 'ongoing': return { color: 'text-blue-600 bg-blue-50', icon: Clock, label: 'Ongoing Installment' };
            case 'defaulted': return { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'Defaulted' };
            case 'refunded':
            case 'partially_refunded': return { color: 'text-gray-600 bg-gray-100', icon: RotateCcw, label: 'Refunded' };
            default: return { color: 'text-gray-600', icon: CheckCircle2, label: status };
        }
    };

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="space-y-6">
            {/* Top Banner: Status & ID */}
            <div className={`flex flex-col items-center justify-center p-6 rounded-xl border border-dashed ${statusConfig.color} border-current border-opacity-30`}>
                <StatusIcon size={48} className="mb-2 opacity-90" />
                <h2 className="text-2xl font-bold">{formatCurrency(order.total_amount)}</h2>
                <span className="font-medium uppercase tracking-wide text-xs mt-1">{statusConfig.label}</span>
                <span className="text-xs opacity-75 mt-2">Order #{order.order_id}</span>
            </div>

            {/* Details Grid */}
            <div className="bg-white border border-gray-100 rounded-lg p-1 shadow-sm">
                <div className="grid grid-cols-1 gap-y-4 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-gray-50 rounded-lg mr-3">
                            <User size={18} className="text-gray-500" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-semibold">Customer</div>
                            <div className="text-gray-900 font-medium">{order.customer_name}</div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="p-2 bg-gray-50 rounded-lg mr-3">
                            <Calendar size={18} className="text-gray-500" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-semibold">Date Created</div>
                            <div className="text-gray-900 font-medium">{formatDate(order.created_at)}</div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="p-2 bg-gray-50 rounded-lg mr-3">
                            <CreditCard size={18} className="text-gray-500" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-semibold">Payment Type</div>
                            <div className="text-gray-900 font-medium">{formatSaleType(order.sale_type)}</div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="p-2 bg-gray-50 rounded-lg mr-3">
                            <Package size={18} className="text-gray-500" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-semibold">Items</div>
                            <div className="text-gray-900 font-medium">{order.items_count} Item(s) in order</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 pt-2">
                Need a detailed receipt? Please visit the transaction logs.
            </div>
        </div>
    );
};

export default OrderSummary;