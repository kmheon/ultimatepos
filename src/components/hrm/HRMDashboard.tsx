import React, { useState } from 'react';
import { 
  Users2, 
  Clock, 
  CalendarCheck, 
  Banknote, 
  Building, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  UserCheck, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface HRMDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const HRMDashboard: React.FC<HRMDashboardProps> = ({ onNavigateTab }) => {
  const { settings } = usePOS();
  const [notice, setNotice] = useState<string | null>(null);

  const totalStaff = 12;
  const attendanceRate = 96.8;
  const monthlyPayroll = 45800.00;
  const pendingLeaves = 1;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Top 4 KPI Metrics matching Nebula standard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab('employees')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 cursor-pointer hover:border-blue-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Staff</span>
            <Users2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalStaff} Employees</h3>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <span>100% Roster Verified</span>
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 cursor-pointer hover:border-emerald-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today Attendance</span>
            <Clock className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600">{attendanceRate}%</h3>
          <p className="text-[11px] text-slate-500 font-medium">11 Present • 1 On Approved Leave</p>
        </div>

        <div 
          onClick={() => onNavigateTab('payroll')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 cursor-pointer hover:border-blue-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Payroll Accrual</span>
            <Banknote className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-black text-blue-600">{settings.currencySymbol}{monthlyPayroll.toLocaleString()}</h3>
          <p className="text-[11px] text-blue-700 font-bold">Scheduled for release</p>
        </div>

        <div 
          onClick={() => onNavigateTab('leaves')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 cursor-pointer hover:border-amber-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Leave Requests</span>
            <CalendarCheck className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-black text-amber-600">{pendingLeaves} Request</h3>
          <p className="text-[11px] text-slate-500 font-medium">Requires supervisor sign-off</p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Staff Activity & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Real-Time Staff Activity & Timeclock</h3>
                <p className="text-xs text-slate-500">Live biometric punch-ins and shift check-ins across store lanes</p>
              </div>
              <button 
                onClick={() => onNavigateTab('attendance')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Timeclock</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Sarah Jenkins', role: 'Senior Cashier', checkIn: '08:55 AM', status: 'On Duty', badge: 'bg-emerald-100 text-emerald-800' },
                { name: 'Alex Rivera', role: 'Lead Technician', checkIn: '09:12 AM', status: 'Field Repair', badge: 'bg-blue-100 text-blue-800' },
                { name: 'Marcus Vance', role: 'Operations Manager', checkIn: '08:40 AM', status: 'On Duty', badge: 'bg-emerald-100 text-emerald-800' },
                { name: 'David Miller', role: 'Logistics Lead', checkIn: '09:05 AM', status: 'Warehouse', badge: 'bg-purple-100 text-purple-800' },
              ].map((staff, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{staff.name} — <span className="font-normal text-slate-600">{staff.role}</span></span>
                    <span className="text-[11px] text-slate-500">Clock-in: {staff.checkIn} • Verified Biometric Scan</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${staff.badge}`}>
                    {staff.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <h3 className="font-black text-slate-900 text-sm">Department Cost & Headcount Distribution</h3>
            <div className="space-y-3">
              {[
                { name: 'POS & Retail Sales', headcount: 4, cost: 14500, pct: '32%' },
                { name: 'Electronics & Repair', headcount: 3, cost: 12800, pct: '28%' },
                { name: 'Warehouse & Logistics', headcount: 3, cost: 11000, pct: '24%' },
                { name: 'Management & HR', headcount: 2, cost: 7500, pct: '16%' },
              ].map((dept, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{dept.name} ({dept.headcount} Staff)</span>
                    <span className="font-black text-slate-900">{settings.currencySymbol}{dept.cost.toLocaleString()} ({dept.pct})</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: dept.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Actions & Compliance */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <h3 className="font-black text-slate-900 text-sm">HRM Quick Actions</h3>
            <div className="space-y-2.5">
              <button 
                onClick={() => onNavigateTab('employees')}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Add New Employee
                </span>
                <span>→</span>
              </button>

              <button 
                onClick={() => onNavigateTab('payroll')}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border border-slate-200/80"
              >
                <span className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" /> Run Monthly Payroll
                </span>
                <span>→</span>
              </button>

              <button 
                onClick={() => onNavigateTab('leaves')}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border border-slate-200/80"
              >
                <span className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-amber-600" /> Review Leave Requests (1)
                </span>
                <span>→</span>
              </button>

              <button 
                onClick={() => onNavigateTab('reports')}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border border-slate-200/80"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Open HRM Reports Workspace
                </span>
                <span>→</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 text-white space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Labor & Tax Compliance
            </div>
            <h4 className="font-black text-sm">100% Statutory Clearance</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              All employee contracts, workers compensation insurance policies, and tax withholdings are fully verified for Q3 2026.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigateTab('reports')}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                View Compliance Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
