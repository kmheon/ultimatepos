import React, { useState } from 'react';
import { BookOpen, Scale, ShieldCheck, Search, Plus, X } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { NebulaStatGrid, NebulaStatCard, TableCard } from '../../core/ui';

interface LedgerAccount {
  code: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
}

export const FinanceAccountingView: React.FC = () => {
  const { settings } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [accounts, setAccounts] = useState<LedgerAccount[]>([
    { code: '1010', name: 'Chase Operating Checking', category: 'Asset', balance: 142500.75 },
    { code: '1020', name: 'Petty Cash & Store Register Float', category: 'Asset', balance: 6050.00 },
    { code: '1050', name: 'Accounts Receivable (Trade Debtors)', category: 'Asset', balance: 42800.00 },
    { code: '2010', name: 'Accounts Payable (Trade Creditors)', category: 'Liability', balance: 18900.00 },
    { code: '2050', name: 'Sales Tax Payable (VAT / GST)', category: 'Liability', balance: 6420.50 },
    { code: '3010', name: 'Paid-in Capital & Retained Earnings', category: 'Equity', balance: 120000.00 },
    { code: '4010', name: 'Retail Sales Revenue', category: 'Revenue', balance: 345200.00 },
    { code: '5010', name: 'Cost of Goods Sold (COGS)', category: 'Expense', balance: 184500.00 },
    { code: '5110', name: 'Salaries & Wages Expense', category: 'Expense', balance: 64000.00 },
    { code: '5210', name: 'Rent & Facility Utilities', category: 'Expense', balance: 18500.00 },
  ]);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'>('Asset');
  const [balance, setBalance] = useState('');

  const totalAssets = accounts.filter(a => a.category === 'Asset').reduce((acc, a) => acc + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.category === 'Liability').reduce((acc, a) => acc + a.balance, 0);
  const totalEquity = accounts.filter(a => a.category === 'Equity').reduce((acc, a) => acc + a.balance, 0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const newAcc: LedgerAccount = {
      code: code.trim(),
      name: name.trim(),
      category: category,
      balance: parseFloat(balance) || 0,
    };

    setAccounts([...accounts, newAcc]);
    setIsAddOpen(false);
    setCode('');
    setName('');
    setBalance('');
  };

  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.code.includes(searchTerm) || 
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <NebulaStatGrid>
        <NebulaStatCard
          label="Total Ledger Assets"
          value={`${settings.currencySymbol}${totalAssets.toLocaleString()}`}
          icon={BookOpen}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          statusText="Balanced trial ledger"
          statusColor="text-blue-600"
        />
        <NebulaStatCard
          label="Total Ledger Liabilities"
          value={`${settings.currencySymbol}${totalLiabilities.toLocaleString()}`}
          icon={Scale}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
          statusText="Current short-term obligations"
          statusColor="text-rose-600"
        />
        <NebulaStatCard
          label="Retained Earnings & Equity"
          value={`${settings.currencySymbol}${totalEquity.toLocaleString()}`}
          icon={ShieldCheck}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          statusText="Net owner equity verified"
          statusColor="text-emerald-600"
        />
      </NebulaStatGrid>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search account code, name, category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Ledger Account
        </button>
      </div>

      <TableCard title="Chart of Accounts & General Ledger" subtitle="Double-entry bookkeeping accounts, debit/credit balances, and trial balance synchronization">
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Account Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Current Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map(acc => (
                <tr key={acc.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{acc.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{acc.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      acc.category === 'Asset' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      acc.category === 'Liability' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      acc.category === 'Equity' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      acc.category === 'Revenue' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {acc.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {settings.currencySymbol}{acc.balance.toLocaleString()}
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
              <h3 className="text-base font-bold text-slate-900">Add New General Ledger Account</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 1060"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Short Term Investments"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Opening Balance</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
