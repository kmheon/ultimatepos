import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  PlusCircle, 
  Search, 
  Truck, 
  Package, 
  Building, 
  DollarSign, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';

export interface PurchasingExpenseRecord {
  id: string;
  expenseNo: string;
  vendor: string;
  category: 'Freight & Shipping' | 'Import Duties' | 'Packaging & Crating' | 'Warehouse Handling' | 'Procurement Misc';
  referenceNo: string;
  amount: number;
  department: string;
  approvedBy: string;
  date: string;
  status: 'Approved' | 'Pending Audit' | 'Paid';
}

export const PurchasingExpensesView: React.FC = () => {
  const { settings } = usePOS();
  const [activeWorkspace, setActiveWorkspace] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const expenses: PurchasingExpenseRecord[] = useMemo(() => [
    { id: 'exp-1', expenseNo: 'EXP-2026-041', vendor: 'FedEx Global Freight', category: 'Freight & Shipping', referenceNo: 'WAYBILL-998201', amount: 1450.00, department: 'Central Warehouse', approvedBy: 'Sarah Jenkins', date: '2026-09-03', status: 'Paid' },
    { id: 'exp-2', expenseNo: 'EXP-2026-042', vendor: 'US Customs & Border Protection', category: 'Import Duties', referenceNo: 'DUTY-DECL-8812', amount: 3820.00, department: 'Import Logistics', approvedBy: 'David Sterling', date: '2026-09-02', status: 'Paid' },
    { id: 'exp-3', expenseNo: 'EXP-2026-043', vendor: 'EcoPack Solutions', category: 'Packaging & Crating', referenceNo: 'INV-55102', amount: 890.50, department: 'Retail Flagship', approvedBy: 'Sarah Jenkins', date: '2026-09-01', status: 'Approved' },
    { id: 'exp-4', expenseNo: 'EXP-2026-044', vendor: 'Portside Container Handling', category: 'Warehouse Handling', referenceNo: 'PORT-CH-9102', amount: 2100.00, department: 'Central Warehouse', approvedBy: 'David Sterling', date: '2026-08-30', status: 'Pending Audit' },
    { id: 'exp-5', expenseNo: 'EXP-2026-045', vendor: 'SwiftLine Courier Services', category: 'Freight & Shipping', referenceNo: 'SL-77291', amount: 420.00, department: 'Field Service Squad', approvedBy: 'Sarah Jenkins', date: '2026-08-28', status: 'Paid' },
  ], []);

  const workspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'all', label: 'All Expenses', icon: Receipt, description: 'Direct operational procurement expenditures' },
    { id: 'freight', label: 'Freight & Shipping', icon: Truck, description: 'Carrier freight and inbound transit fees' },
    { id: 'duties', label: 'Import Duties', icon: Package, description: 'Customs tariffs and tax clearances' },
    { id: 'handling', label: 'Warehouse Costs', icon: Building, description: 'Port handling and storage fees' },
  ], []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || e.expenseNo.toLowerCase().includes(q) || e.vendor.toLowerCase().includes(q) || e.referenceNo.toLowerCase().includes(q);
      let matchesTab = true;
      if (activeWorkspace === 'freight') matchesTab = e.category === 'Freight & Shipping';
      if (activeWorkspace === 'duties') matchesTab = e.category === 'Import Duties';
      if (activeWorkspace === 'handling') matchesTab = e.category === 'Warehouse Handling' || e.category === 'Packaging & Crating';
      return matchesSearch && matchesTab;
    });
  }, [expenses, searchQuery, activeWorkspace]);

  const columns: Column<PurchasingExpenseRecord>[] = useMemo(() => [
    {
      header: 'Expense #',
      accessor: (e) => <span className="font-mono font-black text-blue-600">{e.expenseNo}</span>,
      sortable: true
    },
    {
      header: 'Vendor & Category',
      accessor: (e) => (
        <div>
          <div className="font-bold text-slate-900">{e.vendor}</div>
          <div className="text-[10px] text-slate-400">{e.category} • Ref: {e.referenceNo}</div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: (e) => <span className="text-xs font-bold text-slate-700">{e.department}</span>
    },
    {
      header: 'Amount',
      accessor: (e) => <span className="font-black text-slate-900">{settings.currencySymbol}{e.amount.toFixed(2)}</span>,
      sortable: true
    },
    {
      header: 'Approved By',
      accessor: (e) => <span className="text-xs text-slate-600">{e.approvedBy} ({e.date})</span>
    },
    {
      header: 'Status',
      accessor: (e) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
          e.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
          e.status === 'Approved' ? 'bg-blue-50 text-blue-700' :
          'bg-amber-50 text-amber-700'
        }`}>
          {e.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (e) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => alert(`Viewing details for expense ${e.expenseNo}`)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            View
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ], [settings.currencySymbol]);

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <NebulaPage
      icon={Receipt}
      title="Purchasing Operational Expenses"
      badge="Procurement Ledger"
      description="Track direct operational expenses related to inbound procurement, freight, import duties, and packaging."
      workspaces={workspaces}
      activeWorkspace={activeWorkspace}
      onWorkspaceChange={setActiveWorkspace}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search expenses by Expense #, Vendor, or Reference..."
      extraToolbarActions={
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      }
    >
      <div className="flex flex-col space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses</p>
            <p className="text-xl font-black text-slate-900 mt-1">{settings.currencySymbol}{totalExpenseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Freight Costs</p>
            <p className="text-xl font-black text-blue-600 mt-1">{settings.currencySymbol}1,870.00</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Import Duties</p>
            <p className="text-xl font-black text-purple-600 mt-1">{settings.currencySymbol}3,820.00</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Packaging</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{settings.currencySymbol}890.50</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warehouse Costs</p>
            <p className="text-xl font-black text-amber-600 mt-1">{settings.currencySymbol}2,100.00</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Audit</p>
            <p className="text-xl font-black text-rose-600 mt-1">1 Expense</p>
          </div>
        </div>

        <TableCard
          title="Procurement Expense Ledger"
          subtitle={`Showing ${filteredExpenses.length} logged expenses`}
        >
          <NebulaTable
            data={filteredExpenses}
            columns={columns}
            keyExtractor={(e) => e.id}
            emptyMessage="No procurement expenses found matching search criteria."
          />
        </TableCard>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Record Procurement Expense</h3>
            <p className="text-xs text-slate-500">Log freight, shipping, duties, or packaging cost to procurement.</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor / Carrier</label>
                <input type="text" placeholder="e.g. FedEx Freight" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option>Freight & Shipping</option>
                  <option>Import Duties</option>
                  <option>Packaging & Crating</option>
                  <option>Warehouse Handling</option>
                  <option>Procurement Misc</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount ($)</label>
                <input type="number" placeholder="500.00" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
              <button onClick={() => { alert('Expense successfully recorded!'); setIsModalOpen(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm">Save Expense</button>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
