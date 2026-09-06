import React, { useState, useMemo } from 'react';
import { 
  Users2, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CalendarCheck, 
  Banknote, 
  Building, 
  Shield, 
  Calendar,
  Filter,
  Download,
  Printer,
  Mail,
  Building2,
  FileText,
  UserCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';

export type HRMReportTab = 'overview' | 'attendance' | 'payroll' | 'leaves' | 'departments' | 'turnover' | 'compliance';

interface HRMReportsViewProps {
  initialTab?: string;
}

export const HRMReportsView: React.FC<HRMReportsViewProps> = ({ initialTab = 'overview' }) => {
  const { settings } = usePOS();
  const [activeTab, setActiveTab] = useState<HRMReportTab>((initialTab as HRMReportTab) || 'overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('This Month (September 2026)');
  const [branchFilter, setBranchFilter] = useState('All Branches');

  const workspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3, description: 'Workforce headcount, active roster, and payroll summary' },
    { id: 'attendance', label: 'Attendance & Punctuality', icon: Clock, description: 'Biometric punch-ins, late arrivals, and absence tracking' },
    { id: 'payroll', label: 'Salary & Compensation', icon: Banknote, description: 'Disbursement ledgers, tax deductions, and net payouts' },
    { id: 'leaves', label: 'Leave Utilization', icon: CalendarCheck, description: 'Vacation days, sick leave accruals, and approval logs' },
    { id: 'departments', label: 'Departments & Teams', icon: Building, description: 'Organizational headcount and departmental cost centers' },
    { id: 'turnover', label: 'Retention & Tenure', icon: TrendingUp, description: 'Staff turnover rates, hiring velocity, and average tenure' },
    { id: 'compliance', label: 'Statutory Compliance', icon: Shield, description: 'Labor law compliance, worker contracts, and insurance' },
  ], []);

  const totalEmployees = 12;
  const monthlyPayroll = 45800.00;
  const attendanceRate = 96.8;
  const pendingLeavesCount = 1;

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isCustomExportModalOpen, setIsCustomExportModalOpen] = useState(false);
  const [exportFields, setExportFields] = useState({
    headcount: true,
    payrollExpenditure: true,
    attendanceRate: true,
    leaveSummary: true,
    departmentBreakdown: true,
  });
  const [customExportFormat, setCustomExportFormat] = useState<'csv' | 'excel'>('csv');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'print' | 'email') => {
    setIsExportMenuOpen(false);
    const csvContent = "data:text/csv;charset=utf-8," + 
      [
        ["HRM Metric", "Value"],
        ["Report Workspace", activeTab.toUpperCase()],
        ["Date Range", dateRange],
        ["Branch Filter", branchFilter],
        ["Total Active Employees", totalEmployees],
        ["Monthly Payroll Expenditure", monthlyPayroll.toFixed(2)],
        ["Average Attendance Rate", `${attendanceRate}%`],
        ["Pending Leave Requests", pendingLeavesCount]
      ].map(e => e.join(",")).join("\n");

    if (format === 'csv' || format === 'excel') {
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `hrm_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${format === 'excel' ? 'xls' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'print') {
      window.print();
    } else {
      setExportNotice(`HRM Report export (${format.toUpperCase()}) successfully generated and dispatched.`);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const handleCustomExportSubmit = () => {
    setIsCustomExportModalOpen(false);
    const rows: string[][] = [["Metric / Section", "Value / Telemetry"]];
    rows.push(["Report Workspace", activeTab.toUpperCase()]);
    rows.push(["Date Range", dateRange]);
    rows.push(["Branch Filter", branchFilter]);

    if (exportFields.headcount) rows.push(["Total Employees", totalEmployees.toString()]);
    if (exportFields.payrollExpenditure) rows.push(["Monthly Payroll Expenditure", monthlyPayroll.toFixed(2)]);
    if (exportFields.attendanceRate) rows.push(["Average Attendance Rate", `${attendanceRate}%`]);
    if (exportFields.leaveSummary) rows.push(["Pending Leave Requests", pendingLeavesCount.toString()]);

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `custom_hrm_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${customExportFormat === 'excel' ? 'xls' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const headcountTrendData = [
    { month: 'May', headcount: 10, payroll: 39000 },
    { month: 'Jun', headcount: 11, payroll: 42000 },
    { month: 'Jul', headcount: 11, payroll: 42000 },
    { month: 'Aug', headcount: 12, payroll: 45000 },
    { month: 'Sep', headcount: 12, payroll: 45800 },
  ];

  const departmentData = [
    { name: 'POS & Retail Sales', headcount: 4, cost: 14500, color: '#2563eb' },
    { name: 'Electronics & Repair', headcount: 3, cost: 12800, color: '#10b981' },
    { name: 'Warehouse & Logistics', headcount: 3, cost: 11000, color: '#f59e0b' },
    { name: 'Management & HR', headcount: 2, cost: 7500, color: '#8b5cf6' },
  ];

  const employeeRoster = [
    { id: '1', name: 'Sarah Jenkins', role: 'Senior Cashier', dept: 'POS & Retail Sales', status: 'Active', salary: 3200 },
    { id: '2', name: 'Alex Rivera', role: 'Lead Technician', dept: 'Electronics & Repair', status: 'Active', salary: 3800 },
    { id: '3', name: 'Marcus Vance', role: 'Operations Manager', dept: 'Management & HR', status: 'Active', salary: 4500 },
    { id: '4', name: 'David Miller', role: 'Logistics Lead', dept: 'Warehouse & Logistics', status: 'Active', salary: 3100 },
  ];

  const rosterColumns: Column<any>[] = [
    { header: 'Employee Name', accessor: (item: any) => <span className="font-bold text-slate-900">{item.name}</span> },
    { header: 'Job Title', accessor: (item: any) => <span className="text-xs text-slate-700">{item.role}</span> },
    { header: 'Department', accessor: (item: any) => <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">{item.dept}</span> },
    { header: 'Status', accessor: (item: any) => <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">{item.status}</span> },
    { header: 'Base Salary', accessor: (item: any) => <span className="font-black text-slate-900">{settings.currencySymbol}{item.salary.toLocaleString()}</span> }
  ];

  return (
    <NebulaPage
      icon={Users2}
      title="Human Resources Intelligence & Workforce Reports"
      badge="Universal Reporting Framework"
      description="Comprehensive real-time workforce analytics, attendance rates, payroll cost distributions, and statutory compliance."
      workspaces={workspaces}
      activeWorkspace={activeTab}
      onWorkspaceChange={(id) => setActiveTab(id as HRMReportTab)}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search employees, departments, or payroll vouchers..."
      extraToolbarActions={
        <div className="flex items-center gap-2">
          {/* Date Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="This Month">This Month (September 2026)</option>
              <option value="Last Month">Last Month (August 2026)</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Year to Date">Year to Date (2026)</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All Branches">All Store Branches</option>
              <option value="Downtown Flagship">Downtown Flagship</option>
              <option value="Westside Mall">Westside Mall</option>
            </select>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-semibold text-slate-700">
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Export as CSV
                </button>
                <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> Export as Excel (.xls)
                </button>
                <button onClick={() => handleExport('print')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <Printer className="w-3.5 h-3.5 text-slate-600" /> Print Statement
                </button>
                <button onClick={() => handleExport('email')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <Mail className="w-3.5 h-3.5 text-amber-600" /> Email Report
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button 
                  onClick={() => { setIsExportMenuOpen(false); setIsCustomExportModalOpen(true); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600 font-bold cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" /> Custom Export...
                </button>
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {exportNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{exportNotice}</span>
            <button onClick={() => setExportNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Employees</span>
            <h3 className="text-2xl font-black text-slate-900">{totalEmployees} Staff</h3>
            <p className="text-[11px] text-emerald-600 font-bold">100% Roster Verification</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Attendance Rate</span>
            <h3 className="text-2xl font-black text-emerald-600">{attendanceRate}%</h3>
            <p className="text-[11px] text-slate-500 font-medium">11 Present • 1 Approved Leave</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Payroll Outlay</span>
            <h3 className="text-2xl font-black text-blue-600">{settings.currencySymbol}{monthlyPayroll.toLocaleString()}</h3>
            <p className="text-[11px] text-blue-700 font-bold">Scheduled for release</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Leave Requests</span>
            <h3 className="text-2xl font-black text-amber-600">{pendingLeavesCount} Request</h3>
            <p className="text-[11px] text-slate-500 font-medium">Requires supervisor sign-off</p>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SummaryCard title="Workforce Headcount & Payroll Accrual Trajectory" subtitle="Multi-month growth in team size and monthly salary expenditure">
              <div className="h-72 w-full p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={headcountTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="headcount" name="Active Headcount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="payroll" name="Monthly Payroll ($)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SummaryCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TableCard title="Departmental Cost Distribution" subtitle="Headcount and salary allocation across store operations">
                <div className="p-5 space-y-3">
                  {departmentData.map((dept, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                          {dept.name} ({dept.headcount} Staff)
                        </span>
                        <span className="font-black text-slate-900">{settings.currencySymbol}{dept.cost.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(dept.cost / 45800) * 100}%`, backgroundColor: dept.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </TableCard>

              <TableCard title="Key HR Telemetry & Compliance" subtitle="Summary of statutory filings and workforce metrics">
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="font-bold text-slate-700">Full-Time Employee Contracts</span>
                    <span className="font-black text-slate-900">12 / 12 Verified</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="font-bold text-slate-700">Biometric Attendance Sync</span>
                    <span className="font-black text-emerald-600">Online & Active</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="font-bold text-slate-700">Workers Compensation Insurance</span>
                    <span className="font-black text-blue-600">Active thru Q4 2026</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="font-bold text-slate-700">Average Employee Tenure</span>
                    <span className="font-black text-slate-900">2.4 Years</span>
                  </div>
                </div>
              </TableCard>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <SummaryCard title="Attendance & Punctuality Analytics" subtitle="Biometric check-in compliance and tardiness telemetry">
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Workforce punctuality remains extremely high across all retail branches and repair workshops. 96.8% of scheduled shifts commenced on time with verified biometric or POS pin authorization.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <span className="font-bold block text-sm">On-Time Starts</span>
                  <span className="text-lg font-black mt-1 block">94.2%</span>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block text-sm">Late Arrivals (&gt;15m)</span>
                  <span className="text-lg font-black mt-1 block">2.6%</span>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
                  <span className="font-bold block text-sm">Unexcused Absences</span>
                  <span className="text-lg font-black mt-1 block">0.6%</span>
                </div>
              </div>
            </div>
          </SummaryCard>
        )}

        {activeTab === 'payroll' && (
          <TableCard title="Salary Disbursement & Tax Ledger" subtitle="Itemized compensation and statutory deductions">
            <div className="p-5 space-y-3 text-xs">
              {[
                { name: 'Sarah Jenkins', dept: 'POS & Retail Sales', gross: 3450, tax: 350, net: 3100, status: 'Disbursed' },
                { name: 'Alex Rivera', dept: 'Electronics & Repair', gross: 4200, tax: 420, net: 3780, status: 'Disbursed' },
                { name: 'Marcus Vance', dept: 'Management & HR', gross: 5000, tax: 550, net: 4450, status: 'Disbursed' },
              ].map((p, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{p.name} ({p.dept})</span>
                    <span className="text-[11px] text-slate-500">Gross: {settings.currencySymbol}{p.gross} • Tax Withholding: -{settings.currencySymbol}{p.tax}</span>
                  </div>
                  <span className="font-black text-emerald-600 text-sm">Net Payout: {settings.currencySymbol}{p.net}</span>
                </div>
              ))}
            </div>
          </TableCard>
        )}

        {activeTab === 'leaves' && (
          <SummaryCard title="Leave Utilization & Time-Off Analytics" subtitle="Distribution of casual, sick, and annual leave requests">
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Employees are allocated 15 annual vacation days and 10 sick leave days per calendar year. Current utilization is well within budgeted operational thresholds, ensuring zero staffing shortages across retail registers.
              </p>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 font-bold flex justify-between items-center">
                <span>Total Leave Days Utilized YTD:</span>
                <span className="text-sm">48 Days</span>
              </div>
            </div>
          </SummaryCard>
        )}

        {activeTab === 'departments' && (
          <TableCard title="Active Employee Roster & Departments" subtitle="Complete staff directory grouped by organizational units">
            <NebulaTable 
              data={employeeRoster}
              columns={rosterColumns}
              keyExtractor={(row) => row.id}
            />
          </TableCard>
        )}

        {activeTab === 'turnover' && (
          <SummaryCard title="Staff Retention & Turnover Metrics" subtitle="Recruitment velocity and employee stability index">
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                The annual staff turnover rate stands at an exceptionally low 4.2%, reflecting strong internal culture, competitive remuneration, and comprehensive healthcare benefits.
              </p>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-bold flex justify-between items-center">
                <span>Employee Stability Index:</span>
                <span className="text-sm">95.8% Retention</span>
              </div>
            </div>
          </SummaryCard>
        )}

        {activeTab === 'compliance' && (
          <SummaryCard title="Labor Law & Statutory Compliance Audit" subtitle="Verification of employment contracts, wage laws, and safety regulations">
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                All employee records comply with federal labor standards, occupational safety requirements, and statutory tax withholdings. Regular quarterly audits confirm 100% compliance.
              </p>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-bold flex justify-between items-center">
                <span>Compliance Audit Status:</span>
                <span className="text-sm">Passed (Zero Violations)</span>
              </div>
            </div>
          </SummaryCard>
        )}
      </div>

      {/* Custom Export Modal */}
      {isCustomExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Custom HRM Report Export</h3>
              <button onClick={() => setIsCustomExportModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>
            <p className="text-xs text-slate-500">Select the workforce metrics you want to include in your exported report.</p>
            <div className="space-y-2.5 pt-2">
              {[
                { key: 'headcount', label: 'Total Active Employees' },
                { key: 'payrollExpenditure', label: 'Monthly Payroll Outlay' },
                { key: 'attendanceRate', label: 'Attendance Punctuality Rate' },
                { key: 'leaveSummary', label: 'Leave Requests & Utilization' },
              ].map(f => (
                <label key={f.key} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={(exportFields as any)[f.key]} 
                    onChange={(e) => setExportFields({ ...exportFields, [f.key]: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 block">Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setCustomExportFormat('csv')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${customExportFormat === 'csv' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  CSV Spreadsheet
                </button>
                <button 
                  onClick={() => setCustomExportFormat('excel')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${customExportFormat === 'excel' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  Excel (.xls)
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setIsCustomExportModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleCustomExportSubmit} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">Download Export</button>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
