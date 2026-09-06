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
import { FinanceDashboardView } from './FinanceDashboardView';
import { FinanceBankingView } from './FinanceBankingView';
import { FinanceExpensesView } from './FinanceExpensesView';
import { FinanceRegistersView } from './FinanceRegistersView';
import { FinanceAccountingView } from './FinanceAccountingView';
import { FinanceReportsView } from './FinanceReportsView';
import { updateBrowserURL } from '../../utils/navigationRouter';

export type FinanceSubTab = 
  | 'dashboard' 
  | 'banking' 
  | 'expenses' 
  | 'registers' 
  | 'accounting' 
  | 'reports';

interface FinanceModuleViewProps {
  initialSubTab?: string;
}

export const FinanceModuleView: React.FC<FinanceModuleViewProps> = ({ initialSubTab = 'dashboard' }) => {
  const { expenses, settings } = usePOS();

  const normalizedSubTab: FinanceSubTab = useMemo(() => {
    if (!initialSubTab) return 'dashboard';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
    if (['banking', 'accounts', 'bank'].includes(clean)) return 'banking';
    if (['expenses', 'expense', 'costs'].includes(clean)) return 'expenses';
    if (['registers', 'shifts', 'drawer'].includes(clean)) return 'registers';
    if (['accounting', 'ledger', 'chart-of-accounts'].includes(clean)) return 'accounting';
    if (['reports', 'analytics'].includes(clean)) return 'reports';
    return 'dashboard';
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
          <div className="flex-1 overflow-y-auto p-6">
            <FinanceDashboardView
              onNavigateTab={handleTabChange}
              onOpenAddExpense={() => handleTabChange('expenses')}
            />
          </div>
        )}

        {activeSubTab === 'banking' && (
          <div className="flex-1 overflow-y-auto p-6">
            <FinanceBankingView />
          </div>
        )}

        {activeSubTab === 'expenses' && (
          <div className="flex-1 overflow-y-auto p-6">
            <FinanceExpensesView />
          </div>
        )}

        {activeSubTab === 'registers' && (
          <div className="flex-1 overflow-y-auto p-6">
            <FinanceRegistersView />
          </div>
        )}

        {activeSubTab === 'accounting' && (
          <div className="flex-1 overflow-y-auto p-6">
            <FinanceAccountingView />
          </div>
        )}

        {activeSubTab === 'reports' && (
          <FinanceReportsView />
        )}
      </div>
    </div>
  );
};
