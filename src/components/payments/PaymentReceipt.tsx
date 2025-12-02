// components/payments/PaymentReceipt.tsx
import React from 'react';
import { PaymentLogItem } from '../../types/paymentsLog';
import { Printer, CheckCircle2 } from 'lucide-react';

interface PaymentReceiptProps {
    log: PaymentLogItem;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ log }) => {

    // Formatting Helpers
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

    return (
        <div className="flex flex-col items-center">
            {/* Receipt Container */}
            <div className="w-full bg-white p-6 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Decorative jagged edge top (simulated with border) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>

                {/* Header */}
                <div className="text-center mb-6 border-b border-dashed border-gray-200 pb-6">
                    <div className="bg-green-100 text-green-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Payment Success</h2>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(log.created_at)}</p>
                    <p className="text-xs text-gray-400 mt-1">Ref ID: {log.payment_id}</p>
                </div>

                {/* Details */}
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Customer</span>
                        <span className="text-sm font-medium text-gray-900">{log.customer_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Order ID</span>
                        <span className="text-sm font-medium text-gray-900">#{log.order_id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Payment Type</span>
                        <span className="text-sm font-medium text-gray-900">{log.payment_category}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Method</span>
                        <span className="text-sm font-medium uppercase text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {log.method}
                        </span>
                    </div>
                </div>

                {/* Financials */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-6 font-mono text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Amount Due</span>
                        <span>{formatCurrency(log.net_amount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tendered</span>
                        <span>{formatCurrency(log.tendered)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
                        <span>Change</span>
                        <span>{formatCurrency(log.change)}</span>
                    </div>
                </div>

                {/* Footer Action */}
                <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center w-full py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                    <Printer size={16} className="mr-2" />
                    Print Receipt
                </button>
            </div>
        </div>
    );
};

export default PaymentReceipt;