import React from 'react';
import { 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Hourglass, 
  Calendar, 
  Users, 
  DollarSign, 
  Activity 
} from 'lucide-react';
import { CommandCenterMetrics } from '../../../services/serviceOperations.service';

interface CommandCenterBarProps {
  metrics: CommandCenterMetrics;
  currencySymbol: string;
  onFilterClick?: (filterType: string) => void;
}

export const CommandCenterBar: React.FC<CommandCenterBarProps> = ({
  metrics,
  currencySymbol,
  onFilterClick
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
      <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Operations Command Center
          </span>
          <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
            Live Dispatch Telemetry
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-600">SLA Health:</span>
          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
            metrics.slaHealthStatus === 'Optimal' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : metrics.slaHealthStatus === 'Warning'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {metrics.slaHealthStatus} (96.8%)
          </span>
        </div>
      </div>

      {/* Grid of Compact Status Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <div 
          onClick={() => onFilterClick && onFilterClick('urgent')}
          className="bg-slate-50 hover:bg-rose-50/60 p-2 rounded-xl border border-slate-100 hover:border-rose-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase">
            <span>Critical Jobs</span>
            <AlertOctagon className="w-3 h-3 text-rose-600" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5 flex items-baseline gap-1">
            <span>{metrics.criticalJobsCount}</span>
            <span className="text-[10px] text-rose-600 font-semibold">Priority</span>
          </div>
        </div>

        <div 
          onClick={() => onFilterClick && onFilterClick('overdue')}
          className="bg-slate-50 hover:bg-amber-50/60 p-2 rounded-xl border border-slate-100 hover:border-amber-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase">
            <span>Overdue Jobs</span>
            <Clock className="w-3 h-3 text-amber-600" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5 flex items-baseline gap-1">
            <span className={metrics.overdueJobsCount > 0 ? 'text-amber-600' : 'text-slate-900'}>
              {metrics.overdueJobsCount}
            </span>
            <span className="text-[10px] text-slate-600">Lag</span>
          </div>
        </div>

        <div 
          onClick={() => onFilterClick && onFilterClick('waiting_approval')}
          className="bg-slate-50 hover:bg-blue-50/60 p-2 rounded-xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase">
            <span>Waiting Approval</span>
            <Hourglass className="w-3 h-3 text-blue-600" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5 flex items-baseline gap-1">
            <span>{metrics.waitingApprovalCount}</span>
            <span className="text-[10px] text-blue-600 font-medium">Quotes</span>
          </div>
        </div>

        <div 
          onClick={() => onFilterClick && onFilterClick('awaiting_parts')}
          className="bg-slate-50 hover:bg-purple-50/60 p-2 rounded-xl border border-slate-100 hover:border-purple-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase">
            <span>Waiting Parts</span>
            <Activity className="w-3 h-3 text-purple-600" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5 flex items-baseline gap-1">
            <span>{metrics.waitingPartsCount}</span>
            <span className="text-[10px] text-purple-600 font-medium">Supply</span>
          </div>
        </div>

        <div 
          onClick={() => onFilterClick && onFilterClick('due_today')}
          className="bg-slate-50 hover:bg-cyan-50/60 p-2 rounded-xl border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase">
            <span>Jobs Due Today</span>
            <Calendar className="w-3 h-3 text-cyan-600" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5 flex items-baseline gap-1">
            <span>{metrics.jobsDueTodayCount}</span>
            <span className="text-[10px] text-cyan-700 font-medium">Target</span>
          </div>
        </div>

        <div 
          onClick={() => onFilterClick && onFilterClick('resources')}
          className="bg-slate-50 hover:bg-emerald-50/60 p-2 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase">
            <span>Available Staff</span>
            <Users className="w-3 h-3 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5 flex items-baseline gap-1">
            <span className="text-emerald-600">{metrics.availableStaffCount}</span>
            <span className="text-[10px] text-slate-600">Ready</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase">
            <span>Revenue Today</span>
            <DollarSign className="w-3 h-3 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {currencySymbol}{Math.round(metrics.revenueTodayAmount)}
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase">
            <span>Service Uptime</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-emerald-700 mt-0.5">
            99.9%
          </div>
        </div>
      </div>
    </div>
  );
};
