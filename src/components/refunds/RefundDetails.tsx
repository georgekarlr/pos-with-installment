// components/refunds/RefundDetails.tsx
import React from 'react';
import { RefundLogItem } from '../../types/refundsLog';
import { RotateCcw, User, FileText, Calendar, CreditCard } from 'lucide-react';

interface RefundDetailsProps {
    refund: RefundLogItem;
}

const RefundDetails: React.FC<RefundDetailsProps> = ({ refund }) => {

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
        });

    return (
        <div className="space-y-6">
            {/* Header / Amount */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                <div className="bg-white text-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <RotateCcw size={24} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{formatCurrency(refund.amount_refunded)}</h2>
                <span className="text-sm font-medium text-red-600 uppercase tracking-wide">Refund Processed</span>
                <p className="text-xs text-gray-400 mt-2">Refund ID: #{refund.refund_id}</p>
            </div>

            {/* Details List */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm divide-y divide-gray-50">
                <div className="p-4 flex items-start">
                    <User className="text-gray-400 mt-1 mr-3" size={18} />
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Customer</div>
                        <div className="text-gray-900 font-medium">{refund.customer_name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Order #{refund.order_id}</div>
                    </div>
                </div>

                <div className="p-4 flex items-start">
                    <Calendar className="text-gray-400 mt-1 mr-3" size={18} />
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Date Processed</div>
                        <div className="text-gray-900 font-medium">{formatDate(refund.created_at)}</div>
                    </div>
                </div>

                <div className="p-4 flex items-start">
                    <CreditCard className="text-gray-400 mt-1 mr-3" size={18} />
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Refund Method</div>
                        <div className="text-gray-900 font-medium capitalize">{refund.method}</div>
                    </div>
                </div>

                <div className="p-4 flex items-start bg-gray-50/50">
                    <FileText className="text-gray-400 mt-1 mr-3" size={18} />
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Reason Provided</div>
                        <div className="text-gray-900 italic mt-1">
                            "{refund.reason || 'No specific reason recorded.'}"
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundDetails;