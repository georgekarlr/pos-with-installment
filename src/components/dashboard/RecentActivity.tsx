// components/dashboard/RecentActivity.tsx
import React from 'react';
import { RecentSale } from '../../types/dashboard';
import { ChevronRight, CheckCircle2, Clock, AlertCircle, RotateCcw } from 'lucide-react';

interface RecentActivityProps {
    sales: RecentSale[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ sales }) => {

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'completed': return <CheckCircle2 size={16} className="text-green-500" />;
            case 'ongoing': return <Clock size={16} className="text-blue-500" />;
            case 'defaulted': return <AlertCircle size={16} className="text-red-500" />;
            case 'refunded': return <RotateCcw size={16} className="text-gray-400" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-50">
                {sales.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">No recent activity.</div>
                ) : (
                    sales.map((sale) => (
                        <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    {getStatusIcon(sale.status)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Order #{sale.id}</p>
                                    <p className="text-xs text-gray-500">{formatDate(sale.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">{formatCurrency(sale.total_amount)}</span>
                                <ChevronRight size={16} className="text-gray-300" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentActivity;