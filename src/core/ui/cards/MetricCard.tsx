import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface NebulaMetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  description?: string;
}

export const NebulaMetricCard: React.FC<NebulaMetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  iconColor = 'text-blue-600',
  bgColor = 'bg-blue-50',
  description,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${bgColor} ${iconColor} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {(change || description) && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {change && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${
                trend === 'up' ? 'text-emerald-700 bg-emerald-50' : trend === 'down' ? 'text-red-700 bg-red-50' : 'text-slate-600 bg-slate-100'
              }`}>
                {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {change}
              </span>
            )}
            {description && <span className="text-xs text-slate-500">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
