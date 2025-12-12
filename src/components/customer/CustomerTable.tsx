import React from 'react';
import { Edit2, Trash2, Mail, Phone, CreditCard, MapPin } from 'lucide-react';
import type { Customer } from '../../types/customer';

interface CustomerTableProps {
    customers: Customer[];
    isLoading: boolean;
    onEdit: (customer: Customer) => void;
    onDeleteClick: (customer: Customer) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
                                                                customers,
                                                                isLoading,
                                                                onEdit,
                                                                onDeleteClick
                                                            }) => {
    // --- Loading State ---
    if (isLoading && customers.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    // --- Empty State ---
    if (customers.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                No customers found.
            </div>
        );
    }

    return (
        <>
            {/* VIEW 1: Mobile Card Layout (< 768px) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {customers.map((customer) => (
                    <div key={customer.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-gray-900">{customer.full_name}</h3>
                                <p className="text-xs text-gray-500">ID: {customer.id}</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                {'\u20b1'+customer.credit_limit.toLocaleString()}
                            </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                            {customer.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-gray-400" />
                                    <span className="truncate">{customer.email}</span>
                                </div>
                            )}
                            {customer.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-gray-400" />
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                            <div className="flex items-start gap-2">
                                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{customer.address || 'No address'}</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex gap-2">
                            <button
                                onClick={() => onEdit(customer)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                            >
                                <Edit2 size={16} /> Edit
                            </button>
                            <button
                                onClick={() => onDeleteClick(customer)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* VIEW 2: Desktop Table Layout (>= 768px) */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold">
                    <tr>
                        <th className="px-6 py-4">Full Name</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Details</th>
                        <th className="px-6 py-4">Credit Limit</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 align-top">
                                {customer.full_name}
                            </td>
                            <td className="px-6 py-4 align-top">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        <span>{customer.email || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone size={14} />
                                        <span>{customer.phone || '-'}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded w-fit">
                                        <CreditCard size={12} />
                                        {customer.identity_card_no || 'N/A'}
                                    </div>
                                    <span className="text-xs text-gray-500 truncate max-w-[150px]" title={customer.address || ''}>
                                            {customer.address}
                                        </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-emerald-600 font-medium align-top">
                                {'\u20b1'+customer.credit_limit.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right align-top">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(customer)}
                                        className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteClick(customer)}
                                        className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default CustomerTable;