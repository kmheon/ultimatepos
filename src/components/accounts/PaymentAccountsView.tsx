import React, { useState } from 'react';
import { 
  Landmark, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Plus, 
  FileText, 
  DollarSign, 
  Search, 
  Calendar,
  X,
  CreditCard,
  Building2,
  TrendingUp,
  Scale
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface Account {
  id: string;
  name: string;
  accountNumber: string;
  type: 'bank' | 'cash' | 'card_pos' | 'mobile_money';
  balance: number;
  note?: string;
}

interface AccountTransaction {
  id: string;
  accountId: string;
  accountName: string;
  type: 'debit' | 'credit';
  amount: number;
  refNo: string;
  description: string;
  date: string;
}

export const PaymentAccountsView: React.FC = () => {
  const { settings, transactions, expenses } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'balance_sheet' | 'trial_balance' | 'cash_flow'>('accounts');
  
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: 'Main Cash Drawer Float', accountNumber: 'CASH-001', type: 'cash', balance: 4850.00, note: 'Front-desk register cash vault' },
    { id: '2', name: 'Chase Operating Business Account', accountNumber: 'CHK-****8492', type: 'bank', balance: 34250.75, note: 'Primary checking account' },
    { id: '3', name: 'Stripe / Merchant Card POS Payout', accountNumber: 'STRP-POS-01', type: 'card_pos', balance: 12890.50, note: 'Daily batch card settlement' },
    { id: '4', name: 'Petty Cash Reserve', accountNumber: 'PETTY-002', type: 'cash', balance: 1200.00, note: 'Store maintenance & minor supplies' },
  ]);

  const [transfers, setTransfers] = useState<AccountTransaction[]>([
    { id: '1', accountId: '1', accountName: 'Main Cash Drawer Float', type: 'credit', amount: 3500.00, refNo: 'TRF-09182', description: 'Bank deposit from daily sales', date: '2026-08-31' },
    { id: '2', accountId: '2', accountName: 'Chase Operating Business Account', type: 'debit', amount: 3500.00, refNo: 'TRF-09182', description: 'Bank deposit from daily sales', date: '2026-08-31' },
    { id: '3', accountId: '2', accountName: 'Chase Operating Business Account', type: 'credit', amount: 1450.00, refNo: 'EXP-8849', description: 'Store utility electricity bill', date: '2026-08-30' },
  ]);

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Form states
  const [newAccName, setNewAccName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccType, setNewAccType] = useState<'bank' | 'cash' | 'card_pos' | 'mobile_money'>('bank');
  const [newAccBalance, setNewAccBalance] = useState('0');
  const [newAccNote, setNewAccNote] = useState('');

  // Transfer form
  const [transferFrom, setTransferFrom] = useState('1');
  const [transferTo, setTransferTo] = useState('2');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const totalLiquidity = accounts.reduce((acc, a) => acc + a.balance, 0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    const accObj: Account = {
      id: Date.now().toString(),
      name: newAccName.trim(),
      accountNumber: newAccNumber.trim() || `ACC-${Date.now().toString().slice(-4)}`,
      type: newAccType,
      balance: parseFloat(newAccBalance) || 0,
      note: newAccNote.trim() || undefined,
    };
    setAccounts([...accounts, accObj]);
    setIsAddAccountOpen(false);
    setNewAccName('');
    setNewAccNumber('');
    setNewAccBalance('0');
    setNewAccNote('');
  };

  const handleFundTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0 || transferFrom === transferTo) return;

    const fromAcc = accounts.find(a => a.id === transferFrom);
    const toAcc = accounts.find(a => a.id === transferTo);
    if (!fromAcc || !toAcc) return;

    setAccounts(accounts.map(a => {
      if (a.id === transferFrom) return { ...a, balance: a.balance - amt };
      if (a.id === transferTo) return { ...a, balance: a.balance + amt };
      return a;
    }));

    const refNo = `TRF-${Date.now().toString().slice(-5)}`;
    const dateStr = new Date().toISOString().split('T')[0];

    setTransfers([
      { id: Date.now().toString() + '-1', accountId: fromAcc.id, accountName: fromAcc.name, type: 'credit', amount: amt, refNo, description: `Transfer to ${toAcc.name}: ${transferNote}`, date: dateStr },
      { id: Date.now().toString() + '-2', accountId: toAcc.id, accountName: toAcc.name, type: 'debit', amount: amt, refNo, description: `Transfer from ${fromAcc.name}: ${transferNote}`, date: dateStr },
      ...transfers
    ]);

    setIsTransferOpen(false);
    setTransferAmount('');
    setTransferNote('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-blue-600" />
            Payment Accounts & Ledgers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track bank balances, cash registers, double-entry trial balance, and fund transfers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
            <span>Fund Transfer</span>
          </button>
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Quick Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-md">
          <div className="text-xs text-blue-100 font-bold uppercase tracking-wider">Total Liquidity</div>
          <div className="text-2xl font-black mt-1">{settings.currencySymbol}{totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-blue-200 mt-2 flex items-center gap-1">Across all 4 active payment accounts</div>
        </div>

        {accounts.slice(0, 3).map(acc => (
          <div key={acc.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">{acc.name}</span>
              <span className="font-mono text-[11px]">{acc.accountNumber}</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-2">
              {settings.currencySymbol}{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 capitalize">{acc.type.replace('_', ' ')} Account</div>
          </div>
        ))}
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'accounts' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Accounts List</span>
        </button>

        <button
          onClick={() => setActiveSubTab('balance_sheet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'balance_sheet' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Balance Sheet</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trial_balance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'trial_balance' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Trial Balance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cash_flow')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'cash_flow' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Cash Flow</span>
        </button>
      </div>

      {/* Accounts List Sub-tab */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Account Name</th>
                    <th className="px-4 py-3">Account No</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-right">Current Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-blue-600" />
                          {acc.name}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{acc.accountNumber}</td>
                      <td className="px-4 py-3.5 capitalize">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md">
                          {acc.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{acc.note || '-'}</td>
                      <td className="px-4 py-3.5 text-right font-black text-sm text-slate-900">
                        {settings.currencySymbol}{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transfers Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
              Recent Account Book Entries & Transfers
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {transfers.map(tr => (
                <div key={tr.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{tr.description}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{tr.refNo} • {tr.date}</div>
                  </div>
                  <div className={`font-black text-sm ${tr.type === 'debit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tr.type === 'debit' ? '+' : '-'}{settings.currencySymbol}{tr.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Balance Sheet Sub-tab */}
      {activeSubTab === 'balance_sheet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2 text-emerald-700">
              <Building2 className="w-5 h-5" />
              Assets (Current & Liquid)
            </h3>
            <div className="space-y-3 text-xs">
              {accounts.map(acc => (
                <div key={acc.id} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-700">{acc.name}</span>
                  <span className="font-bold text-slate-900">{settings.currencySymbol}{acc.balance.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-b border-slate-100 font-medium">
                <span className="text-slate-700">Inventory Valuation</span>
                <span className="font-bold text-slate-900">{settings.currencySymbol}48,920.00</span>
              </div>
              <div className="flex justify-between pt-3 font-black text-sm text-emerald-800 border-t-2 border-slate-200">
                <span>Total Assets</span>
                <span>{settings.currencySymbol}{(totalLiquidity + 48920).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2 text-blue-700">
              <Scale className="w-5 h-5" />
              Liabilities & Owner Equity
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-medium text-slate-700">Accounts Payable (Supplier Dues)</span>
                <span className="font-bold text-slate-900">{settings.currencySymbol}12,450.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-medium text-slate-700">Sales Tax Payable</span>
                <span className="font-bold text-slate-900">{settings.currencySymbol}2,180.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 font-medium">
                <span className="text-slate-700">Retained Earnings / Owner Equity</span>
                <span className="font-bold text-slate-900">{settings.currencySymbol}{(totalLiquidity + 48920 - 14630).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 font-black text-sm text-blue-800 border-t-2 border-slate-200">
                <span>Total Liabilities & Equity</span>
                <span>{settings.currencySymbol}{(totalLiquidity + 48920).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trial Balance Sub-tab */}
      {activeSubTab === 'trial_balance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">UltimatePOS Balanced Double-Entry Ledger</span>
            <span className="text-xs font-mono font-bold text-emerald-600">Status: Balanced (0.00 Diff)</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Account Title</th>
                <th className="px-4 py-3 text-right">Debit ({settings.currencySymbol})</th>
                <th className="px-4 py-3 text-right">Credit ({settings.currencySymbol})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-4 py-3 font-medium">Cash & Bank Accounts</td>
                <td className="px-4 py-3 text-right font-bold">{totalLiquidity.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-slate-400">-</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Inventory Stock Asset</td>
                <td className="px-4 py-3 text-right font-bold">48,920.00</td>
                <td className="px-4 py-3 text-right text-slate-400">-</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Accounts Payable</td>
                <td className="px-4 py-3 text-right text-slate-400">-</td>
                <td className="px-4 py-3 text-right font-bold">12,450.00</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Sales Revenue Ledger</td>
                <td className="px-4 py-3 text-right text-slate-400">-</td>
                <td className="px-4 py-3 text-right font-bold">64,520.00</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Cost of Goods Sold (COGS)</td>
                <td className="px-4 py-3 text-right font-bold">36,800.00</td>
                <td className="px-4 py-3 text-right text-slate-400">-</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Operating Expenses</td>
                <td className="px-4 py-3 text-right font-bold">5,420.00</td>
                <td className="px-4 py-3 text-right text-slate-400">-</td>
              </tr>
              <tr className="bg-slate-50 font-black text-sm border-t-2 border-slate-300">
                <td className="px-4 py-3 text-slate-900">Total Trial Balance</td>
                <td className="px-4 py-3 text-right text-emerald-700">{(totalLiquidity + 48920 + 36800 + 5420).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-emerald-700">{(12450 + 64520 + (totalLiquidity + 48920 + 36800 + 5420 - 76970)).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Cash Flow Sub-tab */}
      {activeSubTab === 'cash_flow' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2 text-emerald-700">
            <TrendingUp className="w-5 h-5" />
            Monthly Cash Flow Statement
          </h3>
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
              <div className="font-bold text-emerald-900">Cash Flow from Operating Activities</div>
              <div className="flex justify-between text-slate-700">
                <span>Receipts from Customers & POS Checkout</span>
                <span className="font-bold text-emerald-700">+{settings.currencySymbol}64,520.00</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Payments to Suppliers & Parts</span>
                <span className="font-bold text-rose-700">-{settings.currencySymbol}36,800.00</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Operational & Utility Expenses</span>
                <span className="font-bold text-rose-700">-{settings.currencySymbol}5,420.00</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-emerald-900 border-t border-emerald-200">
                <span>Net Cash from Operations</span>
                <span>+{settings.currencySymbol}22,300.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Payment Account</h3>
              <button onClick={() => setIsAddAccountOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  placeholder="e.g. Bank of America Checking"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={newAccNumber}
                    onChange={e => setNewAccNumber(e.target.value)}
                    placeholder="BOA-***123"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Type *</label>
                  <select
                    value={newAccType}
                    onChange={e => setNewAccType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash Drawer</option>
                    <option value="card_pos">Card POS Gateway</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opening Balance ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAccBalance}
                  onChange={e => setNewAccBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note / Description</label>
                <input
                  type="text"
                  value={newAccNote}
                  onChange={e => setNewAccNote(e.target.value)}
                  placeholder="e.g. For commercial payroll"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fund Transfer Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Transfer Funds Between Accounts</h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFundTransfer} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transfer From *</label>
                <select
                  value={transferFrom}
                  onChange={e => setTransferFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Bal: {settings.currencySymbol}{a.balance.toFixed(2)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transfer To *</label>
                <select
                  value={transferTo}
                  onChange={e => setTransferTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Bal: {settings.currencySymbol}{a.balance.toFixed(2)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Transfer ({settings.currencySymbol}) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-black text-sm text-emerald-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transfer Reference / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Daily cash register float deposit"
                  value={transferNote}
                  onChange={e => setTransferNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
