import React, { useState, useMemo } from 'react';
import { 
  Banknote, 
  Search, 
  Filter, 
  CheckCircle2, 
  DollarSign, 
  Download, 
  Printer, 
  Building2, 
  FileText 
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaTable, 
  TableCard, 
  Column 
} from '../../core/ui';

interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  grossSalary: number;
  taxDeduction: number;
  netPayout: number;
  status: 'Disbursed' | 'Pending Release' | 'Processing';
  payPeriod: string;
}

export const PayrollPage: React.FC = () => {
  const { settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [isRunPayrollModalOpen, setIsRunPayrollModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([
    {
      id: 'pay-1',
      employeeName: 'Sarah Jenkins',
      employeeId: 'EMP-2026-001',
      department: 'POS & Retail Sales',
      grossSalary: 3450,
      taxDeduction: 350,
      netPayout: 3100,
      status: 'Disbursed',
      payPeriod: 'September 2026'
    },
    {
      id: 'pay-2',
      employeeName: 'Alex Rivera',
      employeeId: 'EMP-2026-002',
      department: 'Electronics & Repair',
      grossSalary: 4200,
      taxDeduction: 420,
      netPayout: 3780,
      status: 'Disbursed',
      payPeriod: 'September 2026'
    },
    {
      id: 'pay-3',
      employeeName: 'Marcus Vance',
      employeeId: 'EMP-2026-003',
      department: 'Management & HR',
      grossSalary: 5000,
      taxDeduction: 550,
      netPayout: 4450,
      status: 'Disbursed',
      payPeriod: 'September 2026'
    },
    {
      id: 'pay-4',
      employeeName: 'David Miller',
      employeeId: 'EMP-2026-004',
      department: 'Warehouse & Logistics',
      grossSalary: 3400,
      taxDeduction: 300,
      netPayout: 3100,
      status: 'Pending Release',
      payPeriod: 'September 2026'
    }
  ]);

  const totalPayrollOutlay = payrolls.reduce((sum, p) => sum + p.netPayout, 0);

  const handleRunPayroll = (e: React.FormEvent) => {
    e.preventDefault();
    setPayrolls(payrolls.map(p => ({ ...p, status: 'Disbursed' })));
    setIsRunPayrollModalOpen(false);
    setNotice(`Successfully processed and disbursed monthly payroll totaling ${settings.currencySymbol}${totalPayrollOutlay.toLocaleString()}.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || p.employeeName.toLowerCase().includes(q) || p.department.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All Statuses' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payrolls, searchQuery, statusFilter]);

  const columns: Column<PayrollRecord>[] = useMemo(() => [
    {
      header: 'Employee Name & ID',
      accessor: (p) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900">{p.employeeName}</span>
          <span className="font-mono text-[11px] text-blue-600">{p.employeeId}</span>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: (p) => <span className="text-xs font-semibold text-slate-700">{p.department}</span>
    },
    {
      header: 'Pay Period',
      accessor: (p) => <span className="text-xs text-slate-600">{p.payPeriod}</span>
    },
    {
      header: 'Gross Salary',
      accessor: (p) => <span className="font-mono text-xs font-bold text-slate-900">{settings.currencySymbol}{p.grossSalary.toLocaleString()}</span>
    },
    {
      header: 'Tax Withholding',
      accessor: (p) => <span className="font-mono text-xs font-bold text-rose-600">-{settings.currencySymbol}{p.taxDeduction.toLocaleString()}</span>
    },
    {
      header: 'Net Payout',
      accessor: (p) => <span className="font-mono text-xs font-black text-emerald-600">{settings.currencySymbol}{p.netPayout.toLocaleString()}</span>
    },
    {
      header: 'Disbursement Status',
      accessor: (p) => (
        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
          p.status === 'Disbursed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {p.status}
        </span>
      )
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
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Salary Payroll & Tax Disbursement Ledger</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                  {settings.currencySymbol}{totalPayrollOutlay.toLocaleString()} Monthly Outlay
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Itemized compensation, statutory deductions, tax withholdings, and bank transfers.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsRunPayrollModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shadow-blue-200"
            >
              <Banknote className="w-4 h-4" />
              <span>Run Monthly Payroll</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Net Payroll</span>
            <h3 className="text-2xl font-black text-blue-600">{settings.currencySymbol}{totalPayrollOutlay.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Scheduled for release</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tax Withholdings</span>
            <h3 className="text-2xl font-black text-rose-600">{settings.currencySymbol}1,620.00</h3>
            <p className="text-[11px] text-slate-500 font-medium">Remitted to federal authority</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Disbursement Status</span>
            <h3 className="text-2xl font-black text-emerald-600">Fully Verified</h3>
            <p className="text-[11px] text-emerald-700 font-bold">All 12 employee accounts synced</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search payroll by employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Pending Release">Pending Release</option>
            </select>
          </div>
        </div>

        <TableCard title="Salary Disbursement & Tax Ledger" subtitle="Itemized monthly compensation register">
          <NebulaTable data={filteredPayrolls} columns={columns} keyExtractor={(row) => row.id} />
        </TableCard>
      </div>

      {isRunPayrollModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">Execute Monthly Payroll</h3>
              <button onClick={() => setIsRunPayrollModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to initiate bank disbursement for September 2026. Total net payout across all active employees is <span className="font-black text-slate-900">{settings.currencySymbol}{totalPayrollOutlay.toLocaleString()}</span>.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setIsRunPayrollModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleRunPayroll} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer shadow-blue-200">Confirm Disbursement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
