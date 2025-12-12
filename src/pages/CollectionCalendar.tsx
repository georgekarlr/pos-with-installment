// components/calendar/CollectionCalendar.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';

import {
    Calendar as CalendarIcon,
    ChevronRight,
    User,
    Phone,
    DollarSign,
    Filter
} from 'lucide-react';
import {CalendarItem} from "../types/calendar.ts";
import {CalendarService} from "../services/calendarService.ts";
import CalendarStats from "../components/calendar/CalendarStats.tsx";
import Modal from "../components/ui/Modal.tsx";

const CollectionCalendar: React.FC = () => {

    // --- State ---
    const [items, setItems] = useState<CalendarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

    // Date Filters (Default to current month view logic)
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(today);
    // Default end date: 30 days from now
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const [endDate, setEndDate] = useState<string>(nextMonth.toISOString().split('T')[0]);

    // --- Fetch Data ---
    const fetchCalendar = useCallback(async () => {
        setLoading(true);
        const { data, error } = await CalendarService.getDueCalendar({
            p_start_date: startDate,
            p_end_date: endDate,
            p_limit: 100
        });

        if (error) setError(error);
        else setItems(data || []);

        setLoading(false);
    }, [startDate, endDate]);

    useEffect(() => {
        fetchCalendar();
    }, [fetchCalendar]);

    // --- Grouping Logic (Memoized) ---
    // Groups items by Date string for a nice "Agenda" visual
    const groupedItems = useMemo(() => {
        const groups: Record<string, CalendarItem[]> = {};
        items.forEach(item => {
            if (!groups[item.due_date]) {
                groups[item.due_date] = [];
            }
            groups[item.due_date].push(item);
        });
        // Sort dates
        return Object.keys(groups).sort().reduce((obj, key) => {
            obj[key] = groups[key];
            return obj;
        }, {} as Record<string, CalendarItem[]>);
    }, [items]);

    // --- Helpers ---
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(val);

    const getStatusStyles = (days: number) => {
        if (days < 0) return 'bg-red-50 border-red-200 text-red-700'; // Overdue
        if (days === 0) return 'bg-amber-50 border-amber-200 text-amber-700'; // Today
        return 'bg-white border-gray-200 text-gray-700'; // Future
    };

    const getStatusLabel = (days: number) => {
        if (days < 0) return `${Math.abs(days)} days overdue`;
        if (days === 0) return 'Due Today';
        return `Due in ${days} days`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <CalendarIcon className="mr-2" /> Collections Calendar
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage upcoming installments and overdue payments.</p>
                </div>

                {/* Date Controls */}
                <div className="flex items-center space-x-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center px-2">
                        <Filter size={16} className="text-gray-400 mr-2" />
                        <span className="text-xs font-semibold text-gray-600 hidden sm:inline">Range:</span>
                    </div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-sm border-0 focus:ring-0 text-gray-700 bg-transparent"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-sm border-0 focus:ring-0 text-gray-700 bg-transparent"
                    />
                </div>
            </div>

            {/* Stats Summary */}
            <CalendarStats items={items} />

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
            ) : (
                <div className="space-y-8">
                    {Object.keys(groupedItems).length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No payments scheduled for this date range.</p>
                        </div>
                    ) : (
                        Object.entries(groupedItems).map(([date, dayItems]) => (
                            <div key={date} className="relative">
                                {/* Date Header (Sticky on Mobile) */}
                                <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-2 px-1 mb-3 border-b border-gray-200 flex items-baseline">
                                    <h3 className="text-lg font-bold text-gray-900 mr-2">
                                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {dayItems.length} payment{dayItems.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* List of Items for this Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {dayItems.map((item) => (
                                        <div
                                            key={item.schedule_id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`
                                                relative p-4 rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer
                                                ${getStatusStyles(item.days_remaining)}
                                            `}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center text-sm font-semibold">
                                                        <User size={14} className="mr-1 opacity-70" />
                                                        {item.customer_name}
                                                    </div>
                                                    <div className="text-xs opacity-70 mt-0.5">
                                                        Order #{item.order_id}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">
                                                        {formatCurrency(item.amount_due)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between text-xs font-medium">
                                                <span className={`px-2 py-1 rounded-full ${
                                                    item.days_remaining < 0 ? 'bg-red-200/50 text-red-900' :
                                                        item.days_remaining === 0 ? 'bg-amber-200/50 text-amber-900' :
                                                            'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {getStatusLabel(item.days_remaining)}
                                                </span>
                                                <ChevronRight size={16} className="opacity-40" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title="Payment Details"
            >
                {selectedItem && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <span className="text-xs uppercase text-gray-500 font-bold">Amount Due</span>
                                <div className="text-2xl font-bold text-gray-900">{formatCurrency(selectedItem.amount_due)}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs uppercase text-gray-500 font-bold">Due Date</span>
                                <div className="text-lg font-medium text-gray-900">
                                    {new Date(selectedItem.due_date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                                <User className="text-gray-400 mr-3" />
                                <div>
                                    <div className="text-xs text-gray-500">Customer Name</div>
                                    <div className="font-medium">{selectedItem.customer_name}</div>
                                </div>
                            </div>

                            <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                                <Phone className="text-gray-400 mr-3" />
                                <div>
                                    <div className="text-xs text-gray-500">Phone Number</div>
                                    {selectedItem.customer_phone ? (
                                        <a href={`tel:${selectedItem.customer_phone}`} className="font-medium text-blue-600 hover:underline">
                                            {selectedItem.customer_phone}
                                        </a>
                                    ) : (
                                        <div className="text-gray-400 italic">No phone registered</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                                <DollarSign className="text-gray-400 mr-3" />
                                <div>
                                    <div className="text-xs text-gray-500">References</div>
                                    <div className="text-sm">
                                        Order ID: <b>{selectedItem.order_id}</b> <br/>
                                        Installment ID: <b>{selectedItem.installment_id}</b> <br/>
                                        Schedule ID: <b>{selectedItem.schedule_id}</b>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <button
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                onClick={() => {
                                    alert("Navigate to Payment Processing for Schedule ID: " + selectedItem.schedule_id);
                                    // Here you would typically navigate to a collection/payment screen
                                }}
                            >
                                Process Payment
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CollectionCalendar;