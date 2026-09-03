import React, { useState, useMemo } from 'react';
import { CreditCard, Plus, Search, Trash2, Calendar, Tag, DollarSign } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Expense } from '../../types';
import { AddExpenseModal } from './AddExpenseModal';

export const ExpensesList: React.FC = () => {
  const { expenses, deleteExpense, settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const categories = Array.from(new Set(expenses.map(e => e.category)));

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.category.toLowerCase().includes(q) ||
        (e.refNo && e.refNo.toLowerCase().includes(q)) ||
        (e.note && e.note.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [expenses, categoryFilter, searchQuery]);

  const totalExpenseAmount = filteredExpenses.reduce((s, x) => s + x.amount, 0);
  const cashExpenses = filteredExpenses.filter(e => e.paymentMethod === 'cash').reduce((s, x) => s + x.amount, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operating Expenses</h1>
          <p className="text-xs text-slate-500">Record and audit business operating expenses, utilities, payroll, and petty cash disbursements</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenses</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{settings.currencySymbol}{totalExpenseAmount.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredExpenses.length} Expense Transactions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Petty Cash Payouts</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{settings.currencySymbol}{cashExpenses.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Deducted from register drawer</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Electronic / Card / Wire</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{settings.currencySymbol}{(totalExpenseAmount - cashExpenses).toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Bank & card ledger</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by category, ref, or note..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:outline-hidden w-full sm:w-auto"
        >
          <option value="all">All Expense Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Ref #</th>
                <th className="py-3.5 px-4">Expense Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Notes / Details</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm">No expenses recorded</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {e.refNo || '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {e.category}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {e.date}
                    </td>
                    <td className="py-3 px-4 uppercase font-medium text-slate-600">
                      {e.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {e.note || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                      {settings.currencySymbol}{e.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${e.category}" (${settings.currencySymbol}${e.amount})?`)) {
                            deleteExpense(e.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddExpenseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  );
};
