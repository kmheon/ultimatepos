import React, { useState, useMemo } from 'react';
import { 
  Users2, 
  UserPlus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  DollarSign, 
  Calendar, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText,
  Download,
  Printer
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column 
} from '../../core/ui';

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contractor';
  branch: string;
  baseSalary: number;
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Suspended';
}

export const EmployeesPage: React.FC = () => {
  const { settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 'emp-1',
      employeeId: 'EMP-2026-001',
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@ultimatepos.internal',
      phone: '+1 (555) 234-8901',
      department: 'POS & Retail Sales',
      designation: 'Senior Cashier',
      employmentType: 'Full-Time',
      branch: 'Downtown Flagship',
      baseSalary: 3200,
      joinDate: '2024-03-15',
      status: 'Active'
    },
    {
      id: 'emp-2',
      employeeId: 'EMP-2026-002',
      fullName: 'Alex Rivera',
      email: 'alex.rivera@ultimatepos.internal',
      phone: '+1 (555) 432-1980',
      department: 'Electronics & Repair',
      designation: 'Lead Technician',
      employmentType: 'Full-Time',
      branch: 'Downtown Flagship',
      baseSalary: 3800,
      joinDate: '2023-11-01',
      status: 'Active'
    },
    {
      id: 'emp-3',
      employeeId: 'EMP-2026-003',
      fullName: 'Marcus Vance',
      email: 'marcus.vance@ultimatepos.internal',
      phone: '+1 (555) 891-2345',
      department: 'Management & HR',
      designation: 'Operations Manager',
      employmentType: 'Full-Time',
      branch: 'Downtown Flagship',
      baseSalary: 4500,
      joinDate: '2022-06-10',
      status: 'Active'
    },
    {
      id: 'emp-4',
      employeeId: 'EMP-2026-004',
      fullName: 'David Miller',
      email: 'david.miller@ultimatepos.internal',
      phone: '+1 (555) 678-3421',
      department: 'Warehouse & Logistics',
      designation: 'Logistics Lead',
      employmentType: 'Full-Time',
      branch: 'Westside Mall',
      baseSalary: 3100,
      joinDate: '2024-01-20',
      status: 'Active'
    },
    {
      id: 'emp-5',
      employeeId: 'EMP-2026-005',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@ultimatepos.internal',
      phone: '+1 (555) 345-6789',
      department: 'POS & Retail Sales',
      designation: 'Retail Associate',
      employmentType: 'Part-Time',
      branch: 'Westside Mall',
      baseSalary: 1800,
      joinDate: '2025-02-10',
      status: 'On Leave'
    }
  ]);

  // Form state for new employee
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'POS & Retail Sales',
    designation: '',
    employmentType: 'Full-Time' as const,
    branch: 'Downtown Flagship',
    baseSalary: 3000,
    joinDate: new Date().toISOString().slice(0, 10),
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      alert('Please fill in required fields.');
      return;
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeId: `EMP-2026-00${employees.length + 1}`,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone || '+1 (555) 000-0000',
      department: formData.department,
      designation: formData.designation || 'Staff Member',
      employmentType: formData.employmentType,
      branch: formData.branch,
      baseSalary: Number(formData.baseSalary) || 3000,
      joinDate: formData.joinDate,
      status: 'Active'
    };

    setEmployees([newEmp, ...employees]);
    setIsAddModalOpen(false);
    setNotice(`Successfully onboarded employee ${newEmp.fullName} (${newEmp.employeeId}).`);
    setTimeout(() => setNotice(null), 4000);

    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      department: 'POS & Retail Sales',
      designation: '',
      employmentType: 'Full-Time',
      branch: 'Downtown Flagship',
      baseSalary: 3000,
      joinDate: new Date().toISOString().slice(0, 10),
    });
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        emp.fullName.toLowerCase().includes(q) || 
        emp.email.toLowerCase().includes(q) || 
        emp.employeeId.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q);

      const matchesDept = departmentFilter === 'All Departments' || emp.department === departmentFilter;
      const matchesBranch = branchFilter === 'All Branches' || emp.branch === branchFilter;

      return matchesSearch && matchesDept && matchesBranch;
    });
  }, [employees, searchQuery, departmentFilter, branchFilter]);

  const columns: Column<Employee>[] = useMemo(() => [
    {
      header: 'Employee ID & Name',
      accessor: (emp) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900">{emp.fullName}</span>
          <span className="font-mono text-[11px] text-blue-600">{emp.employeeId}</span>
        </div>
      )
    },
    {
      header: 'Department & Role',
      accessor: (emp) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{emp.designation}</span>
          <span className="text-[11px] text-slate-500">{emp.department}</span>
        </div>
      )
    },
    {
      header: 'Branch & Type',
      accessor: (emp) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-700">{emp.branch}</span>
          <span className="text-[10px] text-slate-400">{emp.employmentType}</span>
        </div>
      )
    },
    {
      header: 'Contact Info',
      accessor: (emp) => (
        <div className="flex flex-col text-xs">
          <span className="text-slate-700 flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {emp.email}</span>
          <span className="text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-slate-400" /> {emp.phone}</span>
        </div>
      )
    },
    {
      header: 'Base Salary',
      accessor: (emp) => <span className="font-black text-slate-900">{settings.currencySymbol}{emp.baseSalary.toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessor: (emp) => (
        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
          emp.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
          emp.status === 'On Leave' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {emp.status}
        </span>
      )
    }
  ], [settings]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Module Header matching Nebula standards */}
      <div className="p-6 pb-0">
        {notice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Staff Directory & Employee Profiles</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                  {employees.length} Active Roster
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Manage employee onboarding, job roles, departments, base compensation, and branch assignments.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shadow-blue-200"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard New Employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Filters & Table */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Staff</span>
            <h3 className="text-2xl font-black text-slate-900">{employees.length} Employees</h3>
            <p className="text-[11px] text-emerald-600 font-bold">100% Verified Roster</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Monthly Payroll</span>
            <h3 className="text-2xl font-black text-blue-600">
              {settings.currencySymbol}{employees.reduce((sum, e) => sum + e.baseSalary, 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Sum of all base salaries</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Departments</span>
            <h3 className="text-2xl font-black text-indigo-600">4 Operational Units</h3>
            <p className="text-[11px] text-slate-500 font-medium">Sales, Tech, Logistics, Management</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All Departments">All Departments</option>
                <option value="POS & Retail Sales">POS & Retail Sales</option>
                <option value="Electronics & Repair">Electronics & Repair</option>
                <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                <option value="Management & HR">Management & HR</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All Branches">All Branches</option>
                <option value="Downtown Flagship">Downtown Flagship</option>
                <option value="Westside Mall">Westside Mall</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employees Table Card */}
        <TableCard title="Employees Roster Directory" subtitle="Comprehensive listing of all active staff and salary assignments">
          <NebulaTable
            data={filteredEmployees}
            columns={columns}
            keyExtractor={(row) => row.id}
          />
        </TableCard>
      </div>

      {/* Onboard New Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Onboard New Employee</h3>
                  <p className="text-xs text-slate-500">Enter personal details, role, and salary compensation.</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Alba"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jessica.alba@ultimatepos.internal"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mobile Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 987-6543"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="POS & Retail Sales">POS & Retail Sales</option>
                    <option value="Electronics & Repair">Electronics & Repair</option>
                    <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                    <option value="Management & HR">Management & HR</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Job Designation / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Sales Executive"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Branch Assignment</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Downtown Flagship">Downtown Flagship</option>
                    <option value="Westside Mall">Westside Mall</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Base Salary ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all shadow-blue-200">Confirm & Onboard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
