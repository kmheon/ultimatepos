import React from 'react';
import { 
  ClipboardList, 
  Wrench, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Star, 
  Clock 
} from 'lucide-react';
import { ServiceOperationsKpiResult } from '../../../services/serviceOperations.service';

interface OperationsKpiRowProps {
  kpis: ServiceOperationsKpiResult;
  currencySymbol: string;
}

export const OperationsKpiRow: React.FC<OperationsKpiRowProps> = ({
  kpis,
  currencySymbol
}) => {
  return (
    <div className="space-y-4">
      {/* ROW 1: PRIMARY OPERATIONS KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Open Service Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Open Service Requests
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{kpis.openRequestsCount}</span>
            <span className="text-xs text-blue-600 font-medium">({kpis.newTodayCount} new today)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <span>Pending Assessment: <strong className="text-slate-700">{kpis.pendingAssessmentCount}</strong></span>
            <span className="text-rose-600 font-bold">{kpis.urgentRequestsCount} Urgent</span>
          </div>
        </div>

        {/* Card 2: Active Work Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Work Orders
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{kpis.activeWorkOrdersCount}</span>
            <span className="text-xs text-amber-600 font-medium">{kpis.inProgressCount} in progress</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <span>Waiting: <strong className="text-slate-700">{kpis.waitingCount}</strong></span>
            <span className={kpis.overdueCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-600 font-medium'}>
              {kpis.overdueCount} Overdue
            </span>
          </div>
        </div>

        {/* Card 3: Today's Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Schedule
            </span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{kpis.todayScheduleCount} Slots</span>
            <span className="text-xs text-cyan-600 font-medium">Assigned: {kpis.assignedScheduleCount}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <span>Unassigned: <strong className="text-slate-700">{kpis.unassignedScheduleCount}</strong></span>
            <span className="text-emerald-600 font-bold">{kpis.completedTodayScheduleCount} Completed Today</span>
          </div>
        </div>

        {/* Card 4: Service Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Service Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {currencySymbol}{kpis.totalServiceRevenue.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +16.2%
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <span>Today: <strong className="text-slate-800">{currencySymbol}{kpis.revenueToday}</strong></span>
            <span>Week: <strong className="text-slate-800">{currencySymbol}{kpis.revenueThisWeek}</strong></span>
            <span>Month: <strong className="text-slate-800">{currencySymbol}{kpis.revenueThisMonth}</strong></span>
          </div>
        </div>
      </div>

      {/* ROW 2: ENTERPRISE OPERATIONS & PERFORMANCE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Staff Utilization */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Staff Utilization
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{kpis.staffUtilizationRate}%</span>
              <span className="text-[11px] text-purple-600 font-medium">Optimal Band</span>
            </div>
            <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-purple-600 h-full rounded-full" 
                style={{ width: `${kpis.staffUtilizationRate}%` }} 
              />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: SLA Compliance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              SLA Compliance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-600">{kpis.slaComplianceRate}%</span>
              <span className="text-[11px] text-emerald-600 font-medium">Target &gt;95%</span>
            </div>
            <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-600 h-full rounded-full" 
                style={{ width: `${kpis.slaComplianceRate}%` }} 
              />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Customer Satisfaction */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Customer Satisfaction
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-amber-600">★ {kpis.customerSatisfactionScore.toFixed(1)}</span>
              <span className="text-[11px] text-slate-500">out of 5.0</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">98.4% 5-Star Reviews</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Star className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Average Resolution Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Avg Resolution Time
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{kpis.averageResolutionTimeHours} Hours</span>
              <span className="text-[11px] text-emerald-600 font-medium">-18% vs benchmark</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Same-Day First Fix Rate: 78%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
