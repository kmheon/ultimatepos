import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface NebulaStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  statusText?: string;
  statusColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  onClick?: () => void;
}

export const NebulaStatCard: React.FC<NebulaStatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-50',
  statusText,
  statusColor = 'text-slate-500',
  trend,
  trendText,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">{label}</span>
        {Icon && (
          <div className={`p-2 rounded-xl ${iconBgColor} ${iconColor} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{value}</div>
        {(statusText || trendText) && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            {trend && trendText && (
              <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md ${
                trend === 'up' ? 'text-emerald-700 bg-emerald-50' : trend === 'down' ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100'
              }`}>
                {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {trendText}
              </span>
            )}
            {statusText && <span className={statusColor}>{statusText}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
