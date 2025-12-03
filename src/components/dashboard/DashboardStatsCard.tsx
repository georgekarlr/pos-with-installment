// components/dashboard/DashboardStatCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string; // Optional: e.g., "+5% from last week"
    colorClass: string; // Tailwind classes for icon background/text
    description?: string;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
                                                                 title,
                                                                 value,
                                                                 icon: Icon,
                                                                 colorClass,
                                                                 description
                                                             }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between transition-transform hover:-translate-y-1 duration-200">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {description && (
                    <p className="text-xs text-gray-400 mt-2">{description}</p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon size={24} />
            </div>
        </div>
    );
};

export default DashboardStatCard;