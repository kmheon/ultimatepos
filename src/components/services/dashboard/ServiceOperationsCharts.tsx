import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  ShieldCheck, 
  Calendar,
  Layers,
  Wrench
} from 'lucide-react';
import { ServiceChartDataSet } from '../../../services/serviceOperations.service';

interface ServiceOperationsChartsProps {
  chartsData: ServiceChartDataSet;
  currencySymbol: string;
}

export const ServiceOperationsCharts: React.FC<ServiceOperationsChartsProps> = ({
  chartsData,
  currencySymbol
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'status' | 'service_types' | 'resources' | 'sla' | 'monthly_completion'>('revenue');

  const customTooltipFormatter = (value: number, name: string) => {
    if (name.toLowerCase().includes('revenue') || name.toLowerCase().includes('labor') || name.toLowerCase().includes('parts') || name.toLowerCase().includes('value')) {
      return [`${currencySymbol}${value.toLocaleString()}`, name];
    }
    return [value, name];
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      {/* Header & Chart Category Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Service Operations Analytics</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
              Enterprise BI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational yield, SLA thresholds, workload distribution, and category telemetry
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveChartTab('revenue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeChartTab === 'revenue' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Revenue Trend</span>
          </button>

          <button
            onClick={() => setActiveChartTab('status')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeChartTab === 'status' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>By Status</span>
          </button>

          <button
            onClick={() => setActiveChartTab('service_types')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeChartTab === 'service_types' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Service Types</span>
          </button>

          <button
            onClick={() => setActiveChartTab('resources')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeChartTab === 'resources' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>By Resource</span>
          </button>

          <button
            onClick={() => setActiveChartTab('sla')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeChartTab === 'sla' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SLA Health</span>
          </button>

          <button
            onClick={() => setActiveChartTab('monthly_completion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeChartTab === 'monthly_completion' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Run-rate</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="h-[280px] w-full">
        {/* TAB 1: REVENUE TREND */}
        {activeChartTab === 'revenue' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartsData.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorLabor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                formatter={customTooltipFormatter}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px' }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" name="Total Service Revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="labor" name="Labor Fee Volume" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLabor)" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* TAB 2: WORK ORDERS BY STATUS */}
        {activeChartTab === 'status' && (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartsData.workOrdersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartsData.workOrdersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 pr-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                Status Distribution Breakdown
              </span>
              {chartsData.workOrdersByStatus.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value} jobs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: JOBS BY SERVICE TYPE */}
        {activeChartTab === 'service_types' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartsData.jobsByServiceType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                formatter={customTooltipFormatter}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="count" name="Executed Jobs" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="value" name="Revenue Generated ($)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* TAB 4: JOBS BY RESOURCE */}
        {activeChartTab === 'resources' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartsData.jobsByResource} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="resource" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="active" name="Active Assigned Jobs" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" name="Completed Work Orders" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* TAB 5: SLA PERFORMANCE */}
        {activeChartTab === 'sla' && (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-4 items-center">
            <div className="space-y-3 pl-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                SLA Tier Verification
              </span>
              {chartsData.slaPerformance.map((sla, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{sla.name}</span>
                    <span className="font-bold text-slate-900">{sla.percentage}% ({sla.count} jobs)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-emerald-600' : idx === 2 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${sla.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Overall SLA Compliance</span>
                <span className="text-sm font-bold text-emerald-600">96.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Avg Triage Speed</span>
                <span className="text-sm font-bold text-slate-900">18 Mins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Customer Re-work Rate</span>
                <span className="text-sm font-bold text-emerald-600">&lt; 0.5%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MONTHLY COMPLETION RUN-RATE */}
        {activeChartTab === 'monthly_completion' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartsData.monthlyCompletionRate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="completed" name="Actual Closed Jobs" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="target" name="Monthly Target KPI" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
