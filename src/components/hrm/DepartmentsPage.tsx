import React, { useState, useMemo } from 'react';
import { 
  Building, 
  Users2, 
  Plus, 
  Search, 
  Shield, 
  DollarSign, 
  MapPin 
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaTable, 
  TableCard, 
  Column 
} from '../../core/ui';

interface DepartmentRecord {
  id: string;
  departmentName: string;
  headName: string;
  headcount: number;
  monthlyCost: number;
  branch: string;
  status: 'Active' | 'Restructuring';
}

export const DepartmentsPage: React.FC = () => {
  const { settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [departments, setDepartments] = useState<DepartmentRecord[]>([
    {
      id: 'dept-1',
      departmentName: 'POS & Retail Sales',
      headName: 'Sarah Jenkins',
      headcount: 4,
      monthlyCost: 14500,
      branch: 'Downtown Flagship',
      status: 'Active'
    },
    {
      id: 'dept-2',
      departmentName: 'Electronics & Repair',
      headName: 'Alex Rivera',
      headcount: 3,
      monthlyCost: 12800,
      branch: 'Downtown Flagship',
      status: 'Active'
    },
    {
      id: 'dept-3',
      departmentName: 'Warehouse & Logistics',
      headName: 'David Miller',
      headcount: 3,
      monthlyCost: 11000,
      branch: 'Westside Mall',
      status: 'Active'
    },
    {
      id: 'dept-4',
      departmentName: 'Management & HR',
      headName: 'Marcus Vance',
      headcount: 2,
      monthlyCost: 7500,
      branch: 'Downtown Flagship',
      status: 'Active'
    }
  ]);

  const [newDeptForm, setNewDeptForm] = useState({
    departmentName: '',
    headName: 'Marcus Vance',
    branch: 'Downtown Flagship',
    monthlyCost: 5000
  });

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptForm.departmentName) return;

    const newDept: DepartmentRecord = {
      id: `dept-${Date.now()}`,
      departmentName: newDeptForm.departmentName,
      headName: newDeptForm.headName,
      headcount: 1,
      monthlyCost: Number(newDeptForm.monthlyCost) || 5000,
      branch: newDeptForm.branch,
      status: 'Active'
    };

    setDepartments([newDept, ...departments]);
    setIsAddDeptModalOpen(false);
    setNotice(`Successfully created department ${newDept.departmentName}.`);
    setTimeout(() => setNotice(null), 4000);
    setNewDeptForm({ departmentName: '', headName: 'Marcus Vance', branch: 'Downtown Flagship', monthlyCost: 5000 });
  };

  const filteredDepts = useMemo(() => {
    return departments.filter(d => {
      const q = searchQuery.toLowerCase().trim();
      return !q || d.departmentName.toLowerCase().includes(q) || d.headName.toLowerCase().includes(q);
    });
  }, [departments, searchQuery]);

  const columns: Column<DepartmentRecord>[] = useMemo(() => [
    {
      header: 'Department Name',
      accessor: (d) => <span className="font-black text-slate-900">{d.departmentName}</span>
    },
    {
      header: 'Department Head',
      accessor: (d) => <span className="font-bold text-slate-800 text-xs">{d.headName}</span>
    },
    {
      header: 'Active Staff Headcount',
      accessor: (d) => <span className="font-mono text-xs font-bold text-blue-600">{d.headcount} Employees</span>
    },
    {
      header: 'Branch Location',
      accessor: (d) => <span className="text-xs text-slate-600">{d.branch}</span>
    },
    {
      header: 'Monthly Cost Outlay',
      accessor: (d) => <span className="font-mono text-xs font-black text-emerald-600">{settings.currencySymbol}{d.monthlyCost.toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessor: (d) => <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{d.status}</span>
    }
  ], [settings]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="p-6 pb-0">
        {notice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Departments & Organizational Structure</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                  {departments.length} Units Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Manage departmental team assignments, cost centers, and supervisors.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddDeptModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Units</span>
            <h3 className="text-2xl font-black text-slate-900">{departments.length} Departments</h3>
            <p className="text-[11px] text-slate-500 font-medium">Fully staffed</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Workforce Headcount</span>
            <h3 className="text-2xl font-black text-blue-600">12 Employees</h3>
            <p className="text-[11px] text-emerald-700 font-bold">Distributed across branches</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Combined Monthly Outlay</span>
            <h3 className="text-2xl font-black text-emerald-600">{settings.currencySymbol}45,800.00</h3>
            <p className="text-[11px] text-slate-500 font-medium">Across all cost centers</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <TableCard title="Organizational Units & Cost Centers" subtitle="Listing of all store departments">
          <NebulaTable data={filteredDepts} columns={columns} keyExtractor={(row) => row.id} />
        </TableCard>
      </div>

      {isAddDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">Add New Department</h3>
              <button onClick={() => setIsAddDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marketing & Growth"
                  value={newDeptForm.departmentName}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, departmentName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Department Head</label>
                <select
                  value={newDeptForm.headName}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, headName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Marcus Vance">Marcus Vance</option>
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                  <option value="Alex Rivera">Alex Rivera</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Branch Location</label>
                <select
                  value={newDeptForm.branch}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, branch: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Downtown Flagship">Downtown Flagship</option>
                  <option value="Westside Mall">Westside Mall</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Allocated Monthly Cost ({settings.currencySymbol})</label>
                <input
                  type="number"
                  required
                  value={newDeptForm.monthlyCost}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, monthlyCost: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddDeptModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer shadow-indigo-200">Create Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
