import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users2, 
  LayoutDashboard, 
  UserCheck, 
  Clock, 
  CalendarCheck, 
  Banknote, 
  Building, 
  BarChart3,
  Plus
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ModuleHeader } from '../layout/ModuleHeader';
import { WorkspaceNav, WorkspaceItem } from '../layout/WorkspaceNav';
import { HRMView } from './HRMView';
import { UserManagementView } from '../users/UserManagementView';
import { ReportsView } from '../reports/ReportsView';
import { updateBrowserURL } from '../../utils/navigationRouter';

export type HRMSubTab = 
  | 'dashboard' 
  | 'employees' 
  | 'attendance' 
  | 'leaves' 
  | 'payroll' 
  | 'departments' 
  | 'reports';

interface HRMModuleViewProps {
  initialSubTab?: string;
}

export const HRMModuleView: React.FC<HRMModuleViewProps> = ({ initialSubTab = 'employees' }) => {
  const { settings } = usePOS();
  const [activeWorkspace, setActiveWorkspace] = useState('executive');

  const hrmWorkspaces: WorkspaceItem[] = useMemo(() => [
    { id: 'executive', label: 'Executive', icon: BarChart3, description: 'Workforce headcount & payroll summary', priority: 1 },
    { id: 'attendance', label: 'Attendance', icon: Clock, description: 'Biometric time clocks & punctuality reports', priority: 2 },
    { id: 'payroll', label: 'Payroll', icon: Banknote, description: 'Salary disbursements & tax deductions', priority: 3 },
    { id: 'leaves', label: 'Leaves', icon: CalendarCheck, description: 'Vacation, sick leave & approval workflows', priority: 4 },
    { id: 'departments', label: 'Departments', icon: Building, description: 'Organizational charts & team assignments', priority: 5 },
    { id: 'employees', label: 'Employees', icon: UserCheck, description: 'Staff profiles & contact directories', priority: 6 },
  ], []);

  const normalizedSubTab: HRMSubTab = useMemo(() => {
    if (!initialSubTab) return 'employees';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
    if (['employees', 'staff', 'users', 'directory'].includes(clean)) return 'employees';
    if (['attendance', 'timeclock', 'clock'].includes(clean)) return 'attendance';
    if (['leaves', 'leave', 'vacation', 'holidays'].includes(clean)) return 'leaves';
    if (['payroll', 'salary', 'wages'].includes(clean)) return 'payroll';
    if (['departments', 'teams', 'org'].includes(clean)) return 'departments';
    if (['reports', 'analytics'].includes(clean)) return 'reports';
    return 'employees';
  }, [initialSubTab]);

  const [activeSubTab, setActiveSubTab] = useState<HRMSubTab>(normalizedSubTab);

  useEffect(() => {
    setActiveSubTab(normalizedSubTab);
  }, [normalizedSubTab]);

  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as HRMSubTab;
    setActiveSubTab(nextTab);
    updateBrowserURL('hrm', nextTab);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Standardized Module Header */}
      <ModuleHeader
        icon={Users2}
        title="Human Resources Management (HRM)"
        badge="Workforce & Payroll"
        subtitle="Staff directory, biometric attendance, leave entitlement tracking, payroll disbursement, and department organization"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleTabChange('employees')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeSubTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Staff</span>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  12 Employees
                </div>
                <p className="text-xs text-slate-500 mt-1">4 Field Engineers • 3 Sales • 5 Operations</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today Attendance Rate</span>
                <div className="text-2xl font-black text-emerald-600 mt-2">
                  96.8%
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-1">11 Present • 1 On Approved Leave</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Payroll Accrual</span>
                <div className="text-2xl font-black text-blue-600 mt-2">
                  {settings.currencySymbol}45,800.00
                </div>
                <p className="text-xs text-slate-400 mt-1">Scheduled for end-of-month release</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Quick Staff Activity Logs</h3>
                  <p className="text-xs text-slate-500">Real-time attendance punch-ins and station check-ins</p>
                </div>
                <button
                  onClick={() => handleTabChange('attendance')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Full Attendance Sheet →
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Sarah Jenkins — Cashier / Counter POS</span>
                    <p className="text-slate-400 text-[11px]">Clock-in: 08:55 AM • Verified Biometric Scan</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    On Duty
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Alex Rivera — Lead Service Technician</span>
                    <p className="text-slate-400 text-[11px]">Clock-in: 09:25 AM • Dispatched on Site Survey</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                    Field Duty
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'employees' && (
          <div className="p-6">
            <UserManagementView />
          </div>
        )}

        {activeSubTab === 'attendance' && (
          <div className="p-6">
            <HRMView initialSubTab="attendance" />
          </div>
        )}

        {activeSubTab === 'leaves' && (
          <div className="p-6">
            <HRMView initialSubTab="leaves" />
          </div>
        )}

        {activeSubTab === 'payroll' && (
          <div className="p-6">
            <HRMView initialSubTab="payroll" />
          </div>
        )}

        {activeSubTab === 'departments' && (
          <div className="p-6">
            <HRMView initialSubTab="departments" />
          </div>
        )}

        {activeSubTab === 'reports' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <WorkspaceNav
              workspaces={hrmWorkspaces}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={setActiveWorkspace}
            />
            <div className="flex-1 overflow-y-auto p-6">
              <ReportsView initialReportTab="hr" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
