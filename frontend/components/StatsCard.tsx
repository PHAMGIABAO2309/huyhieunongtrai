
import React from 'react';
import { formatXU } from '../utils/formatters';

interface StatsCardProps {
  label: string;
  value: number;
  suffix?: string;
  colorClass?: string;
  icon?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, suffix = "XU", colorClass = "bg-white", icon }) => {
  return (
    <div className={`${colorClass} p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md`}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800">
          {formatXU(value)} <span className="text-sm font-semibold text-slate-400">{suffix}</span>
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
