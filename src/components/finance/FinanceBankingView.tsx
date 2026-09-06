import React, { useState } from 'react';
import { 
  Landmark, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Plus, 
  Search, 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Building2,
  X
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { NebulaStatGrid, NebulaStatCard, TableCard } from '../../core/ui';

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  type: 'bank' | 'cash' | 'card_pos' | 'mobile_money';
  balance: number;
  note: string;
  status: 'active' | 'suspended';
}

interface FundTransfer {
  id: string;
  fromAccountName: string;
  toAccountName: string;
  amount: number;
  refNo: string;
  date: string;
  note: string;
}

export const FinanceBankingView: React.FC = () => {
  const { settings } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // State for accounts
  const [accounts, setAccounts] = useState<BankAccount[]>([
    { id: '1', name: 'Chase Operating Checking', accountNumber: 'CHK-8492', type: 'bank', balance: 142500.75, note: 'Primary corporate operating account', status: 'active' },
    { id: '2', name: 'Wells Fargo Treasury Yield', accountNumber: 'RES-4421', type: 'bank', balance: 84000.50, note: 'High yield interest reserve fund', status: 'active' },
    { id: '3', name: 'Front Desk Cash Drawer Vault', accountNumber: 'CASH-001', type: 'cash', balance: 4850.00, note: 'Main register cash float', status: 'active' },
    { id: '4', name: 'Stripe Merchant POS Settlement', accountNumber: 'STRP-01', type: 'card_pos', balance: 12890.50, note: 'Daily card terminal batch payouts', status: 'active' },
  ]);

  const [transfers, setTransfers] = useState<FundTransfer[]>([
    { id: 't1', fromAccountName: 'Chase Operating Checking', toAccountName: 'Front Desk Cash Drawer Vault', amount: 3500.00, refNo: 'TRF-9921', date: '2026-09-05', note: 'Weekly cash float replenishment' },
    { id: 't2', fromAccountName: 'Stripe Merchant POS Settlement', toAccountName: 'Chase Operating Checking', amount: 14200.00, refNo: 'TRF-9922', date: '2026-09-04', note: 'Batch settlement payout transfer' },
  ]);

  // Form state for new account
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newType, setNewType] = useState<'bank' | 'cash' | 'card_pos' | 'mobile_money'>('bank');
  const [newBalance, setNewBalance] = useState('');
  const [newNote, setNewNote] = useState('');

  // Form state for transfer
  const [transferFrom, setTransferFrom] = useState(accounts[0]?.name || '');
  const [transferTo, setTransferTo] = useState(accounts[1]?.name || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const totalLiquidity = accounts.reduce((acc, a) => acc + a.balance, 0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newAcc: BankAccount = {
      id: Date.now().toString(),
      name: newName.trim(),
      accountNumber: newNumber.trim() || `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newType,
      balance: parseFloat(newBalance) || 0,
      note: newNote.trim() || 'Custom account',
      status: 'active',
    };
    setAccounts([...accounts, newAcc]);
    setIsAddAccountOpen(false);
    setNewName('');
    setNewNumber('');
    setNewBalance('');
    setNewNote('');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0 || transferFrom === transferTo) return;

    const newTrf: FundTransfer = {
      id: Date.now().toString(),
      fromAccountName: transferFrom,
      toAccountName: transferTo,
      amount: amt,
      refNo: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      note: transferNote.trim() || 'Internal liquidity transfer',
    };

    setTransfers([newTrf, ...transfers]);
    setAccounts(accounts.map(acc => {
      if (acc.name === transferFrom) return { ...acc, balance: acc.balance - amt };
      if (acc.name === transferTo) return { ...acc, balance: acc.balance + amt };
      return acc;
    }));

    setIsTransferOpen(false);
    setTransferAmount('');
    setTransferNote('');
  };

  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <NebulaStatGrid>
        <NebulaStatCard
          label="Total Liquid Balances"
          value={`${settings.currencySymbol}${totalLiquidity.toLocaleString()}`}
          icon={Landmark}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          statusText={`${accounts.length} active treasury accounts`}
          statusColor="text-blue-600"
        />
        <NebulaStatCard
          label="Commercial Checking"
          value={`${settings.currencySymbol}${accounts.find(a => a.type === 'bank')?.balance.toLocaleString() || '0'}`}
          icon={Building2}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          statusText="Primary operating liquidity"
          statusColor="text-indigo-600"
        />
        <NebulaStatCard
          label="Cash Vault Floats"
          value={`${settings.currencySymbol}${accounts.find(a => a.type === 'cash')?.balance.toLocaleString() || '0'}`}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          statusText="Register drawer cash reserves"
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
            placeholder="Search bank accounts, numbers, types..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Transfer Funds
          </button>
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableCard title="Payment Accounts & Bank Vaults" subtitle="Manage corporate bank accounts, merchant POS gateways, and cash floats">
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Account Name</th>
                    <th className="py-3 px-4">Account No</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{acc.name}</span>
                        <span className="text-[11px] text-slate-400">{acc.note}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">{acc.accountNumber}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {acc.type.replace('_', ' ')}
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
        </div>

        <div>
          <TableCard title="Recent Fund Transfers" subtitle="Internal ledger liquidity movements">
            <div className="p-5 space-y-3">
              {transfers.map(trf => (
                <div key={trf.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-600">{trf.refNo}</span>
                    <span className="text-[10px] text-slate-400">{trf.date}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">{trf.fromAccountName}</span>
                    <span className="text-slate-400 text-[11px]">→ {trf.toAccountName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-500">{trf.note}</span>
                    <span className="font-black text-slate-900">{settings.currencySymbol}{trf.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </TableCard>
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Payment Account</h3>
              <button onClick={() => setIsAddAccountOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Bank of America Operating"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Number / IBAN</label>
                <input
                  type="text"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="e.g. BOA-9982"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash Drawer Vault</option>
                  <option value="card_pos">Merchant Card POS</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Opening Balance</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Optional account purpose"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
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

      {/* Transfer Funds Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Execute Fund Transfer</h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">From Account (Source)</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.name}>{acc.name} ({settings.currencySymbol}{acc.balance.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">To Account (Destination)</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.name}>{acc.name} ({settings.currencySymbol}{acc.balance.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Note / Reference</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Reason for transfer"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Complete Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
