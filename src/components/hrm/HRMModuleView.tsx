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
import { EmployeesPage } from './EmployeesPage';
import { AttendancePage } from './AttendancePage';
import { LeavesPage } from './LeavesPage';
import { PayrollPage } from './PayrollPage';
import { DepartmentsPage } from './DepartmentsPage';
import { HRMReportsView } from './HRMReportsView';
import { HRMDashboard } from './HRMDashboard';
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
          <HRMDashboard onNavigateTab={handleTabChange} />
        )}

        {activeSubTab === 'employees' && (
          <EmployeesPage />
        )}

        {activeSubTab === 'attendance' && (
          <AttendancePage />
        )}

        {activeSubTab === 'leaves' && (
          <LeavesPage />
        )}

        {activeSubTab === 'payroll' && (
          <PayrollPage />
        )}

        {activeSubTab === 'departments' && (
          <DepartmentsPage />
        )}

        {activeSubTab === 'reports' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <HRMReportsView />
          </div>
        )}
      </div>
    </div>
  );
};
