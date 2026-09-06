import React, { useState } from 'react';
import { 
  Receipt, 
  TrendingDown, 
  Plus, 
  Search, 
  Calendar, 
  Tag, 
  FileText, 
  DollarSign, 
  Building2, 
  X,
  CheckCircle2
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { NebulaStatGrid, NebulaStatCard, TableCard } from '../../core/ui';

export const FinanceExpensesView: React.FC = () => {
  const { settings, expenses, addExpense } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [category, setCategory] = useState('Utilities');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [note, setNote] = useState('');

  const totalExpenseCost = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    addExpense({
      refNo: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      category: category,
      amount: amt,
      paymentMethod: paymentMethod,
      expenseDate: new Date().toISOString().split('T')[0],
      note: note.trim() || 'Operating expense disbursement',
    });

    setIsAddOpen(false);
    setAmount('');
    setNote('');
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = 
      exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.note && exp.note.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exp.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <NebulaStatGrid>
        <NebulaStatCard
          label="Total Operating Expenses"
          value={`${settings.currencySymbol}${totalExpenseCost.toLocaleString()}`}
          icon={TrendingDown}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
          statusText={`${expenses.length} total expense vouchers`}
          statusColor="text-rose-600"
        />
        <NebulaStatCard
          label="Utilities & Overhead"
          value={`${settings.currencySymbol}${expenses.filter(e => e.category.toLowerCase().includes('util') || e.category.toLowerCase().includes('rent')).reduce((a, b) => a + b.amount, 0).toLocaleString()}`}
          icon={Receipt}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          statusText="Facility & utility cost centers"
          statusColor="text-blue-600"
        />
        <NebulaStatCard
          label="Vendor Disbursements"
          value={`${settings.currencySymbol}${expenses.filter(e => e.category.toLowerCase().includes('vendor') || e.category.toLowerCase().includes('supp')).reduce((a, b) => a + b.amount, 0).toLocaleString()}`}
          icon={Building2}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          statusText="Supplier payouts & materials"
          statusColor="text-indigo-600"
        />
      </NebulaStatGrid>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses, notes, ref no..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Categories</option>
            <option value="Utilities">Utilities</option>
            <option value="Rent">Rent</option>
            <option value="Salary">Salary</option>
            <option value="Supplies">Supplies</option>
          </select>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Record New Expense
        </button>
      </div>

      <TableCard title="Operating Expense Vouchers" subtitle="Itemized list of business disbursements and cost center allocations">
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ref No</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Note / Details</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{exp.refNo}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-lg font-bold text-[10px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{exp.note || 'Operating expense'}</td>
                  <td className="py-3 px-4 text-slate-500">{exp.expenseDate || exp.date || 'Today'}</td>
                  <td className="py-3 px-4 text-slate-600">{exp.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-black text-rose-600">
                    {settings.currencySymbol}{exp.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>

      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Record Operating Expense</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Utilities">Utilities (Electricity, Water, Internet)</option>
                  <option value="Rent">Facility Rent</option>
                  <option value="Salary">Payroll & Salaries</option>
                  <option value="Supplies">Store Supplies & Maintenance</option>
                  <option value="Marketing">Advertising & Marketing</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Cash">Cash Drawer</option>
                  <option value="Bank Transfer">Bank Transfer (Checking)</option>
                  <option value="Corporate Card">Corporate Credit Card</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Monthly electricity bill disbursement"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
