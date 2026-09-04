import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  LayoutDashboard, 
  Landmark, 
  Receipt, 
  CreditCard, 
  BookOpen, 
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ModuleHeader } from '../layout/ModuleHeader';
import { WorkspaceNav, WorkspaceItem } from '../layout/WorkspaceNav';
import { PaymentAccountsView } from '../accounts/PaymentAccountsView';
import { ExpensesList } from '../expenses/ExpensesList';
import { ReportsView } from '../reports/ReportsView';
import { updateBrowserURL } from '../../utils/navigationRouter';

export type FinanceSubTab = 
  | 'dashboard' 
  | 'banking' 
  | 'expenses' 
  | 'registers' 
  | 'accounting' 
  | 'reports';

interface PaymentAccount {
  id: string;
  name: string;
  accountNumber: string;
  type: 'bank' | 'cash' | 'card_pos' | 'mobile_money';
  balance: number;
  note?: string;
}

const DEFAULT_ACCOUNTS: PaymentAccount[] = [
  { id: '1', name: 'Main Cash Drawer Float', accountNumber: 'CASH-001', type: 'cash', balance: 4850.00, note: 'Front-desk register cash vault' },
  { id: '2', name: 'Corporate Checking (Chase Bank)', accountNumber: 'CHASE-7782', type: 'bank', balance: 84200.00, note: 'Operating expense and clearing account' },
  { id: '3', name: 'Merchant Card POS Settlement', accountNumber: 'STRIPE-091', type: 'card_pos', balance: 19450.00, note: 'Card terminal batch settlements' },
  { id: '4', name: 'Reserve Treasury Account', accountNumber: 'WELLS-4421', type: 'bank', balance: 150000.00, note: 'High yield interest treasury fund' },
];

interface FinanceModuleViewProps {
  initialSubTab?: string;
}

export const FinanceModuleView: React.FC<FinanceModuleViewProps> = ({ initialSubTab = 'banking' }) => {
  const { expenses, settings, setActiveTab } = usePOS();
  const [accounts] = useState<PaymentAccount[]>(DEFAULT_ACCOUNTS);
  const [activeWorkspace, setActiveWorkspace] = useState('executive');

  const financeWorkspaces: WorkspaceItem[] = useMemo(() => [
    { id: 'executive', label: 'Executive', icon: BarChart3, description: 'Financial KPI summary & treasury overview', priority: 1 },
    { id: 'accounts', label: 'Accounts', icon: Landmark, description: 'Banking & liquid asset balances', priority: 2 },
    { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp, description: 'Inflows, outflows & liquidity forecasting', priority: 3 },
    { id: 'expenses', label: 'Expenses', icon: Receipt, description: 'Operating expense vouchers & cost centers', priority: 4 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, description: 'Sales turnover & income streams', priority: 5 },
    { id: 'profitLoss', label: 'Profit & Loss', icon: BookOpen, description: 'Income statement & net operating margin', priority: 6 },
    { id: 'balanceSheet', label: 'Balance Sheet', icon: CreditCard, description: 'Assets, liabilities & equity statements', priority: 7 },
  ], []);

  const normalizedSubTab: FinanceSubTab = useMemo(() => {
    if (!initialSubTab) return 'banking';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
    if (['banking', 'accounts', 'bank'].includes(clean)) return 'banking';
    if (['expenses', 'expense', 'costs'].includes(clean)) return 'expenses';
    if (['registers', 'shifts', 'drawer'].includes(clean)) return 'registers';
    if (['accounting', 'ledger', 'chart-of-accounts'].includes(clean)) return 'accounting';
    if (['reports', 'analytics'].includes(clean)) return 'reports';
    return 'banking';
  }, [initialSubTab]);

  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>(normalizedSubTab);

  useEffect(() => {
    setActiveSubTab(normalizedSubTab);
  }, [normalizedSubTab]);

  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as FinanceSubTab;
    setActiveSubTab(nextTab);
    updateBrowserURL('finance', nextTab);
  };

  const totalBankBalance = accounts.reduce((acc: number, a: PaymentAccount) => acc + (a.balance || 0), 0);
  const totalExpenseCost = expenses.reduce((acc: number, e) => acc + (e.amount || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Standardized Module Header */}
      <ModuleHeader
        icon={DollarSign}
        title="Finance & Accounts Management"
        badge="Treasury & Ledger"
        subtitle="Chart of accounts, liquid bank balances, cash register auditing, operating expenses, and financial telemetry"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleTabChange('expenses')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeSubTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Liquid Bank Balances</span>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {settings.currencySymbol}{totalBankBalance.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-1">{accounts.length} Active accounts verified</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operating Expenses (OPEX)</span>
                <div className="text-2xl font-black text-rose-600 mt-2">
                  {settings.currencySymbol}{totalExpenseCost.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400 mt-1">{expenses.length} Expense vouchers recorded</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Cash Position</span>
                <div className="text-2xl font-black text-emerald-600 mt-2">
                  {settings.currencySymbol}{(totalBankBalance - totalExpenseCost).toFixed(2)}
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-1">Healthy working capital</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Payment & Settlement Accounts</h3>
                  <p className="text-xs text-slate-500">Commercial banks, merchant POS, and cash vaults</p>
                </div>
                <button
                  onClick={() => handleTabChange('banking')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Manage Accounts →
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {accounts.map(acc => (
                  <div key={acc.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{acc.name}</span>
                      <p className="text-slate-400 text-[11px]">Acc No: {acc.accountNumber} • {acc.type.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900">{settings.currencySymbol}{(acc.balance || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'banking' && (
          <div className="p-6">
            <PaymentAccountsView />
          </div>
        )}

        {activeSubTab === 'expenses' && (
          <div className="p-6">
            <ExpensesList />
          </div>
        )}

        {activeSubTab === 'registers' && (
          <div className="p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Cash Register Drawer Balances</h3>
              <p className="text-xs text-slate-500">Live cashier station float balances, cash-in/cash-out audits, and shift closures</p>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900">Register 01 — Terminal Lane 1</span>
                  <p className="text-emerald-700 text-[11px]">Shift started: 09:00 AM • Opening balance: {settings.currencySymbol}500.00</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]">
                  Active Shift
                </span>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'accounting' && (
          <div className="p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Chart of Accounts & General Ledger</h3>
              <p className="text-xs text-slate-500">Double-entry accounting journal, trial balance, and balance sheet</p>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-xs">General Ledger Synchronized</h4>
                <p className="text-slate-500 text-[11px] max-w-md mx-auto">
                  All store sales, purchase receipts, and expense vouchers automatically post debit/credit entries to the ledger accounts.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'reports' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <WorkspaceNav
              workspaces={financeWorkspaces}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={setActiveWorkspace}
            />
            <div className="flex-1 overflow-y-auto p-6">
              <ReportsView initialReportTab="finance" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
