import React from 'react';
import { 
  Landmark, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  ShieldCheck, 
  BarChart3,
  Plus,
  ArrowRight,
  Wallet,
  Activity,
  ArrowLeftRight
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { NebulaStatGrid, NebulaStatCard, TableCard } from '../../core/ui';

interface FinanceDashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddExpense: () => void;
}

export const FinanceDashboardView: React.FC<FinanceDashboardViewProps> = ({
  onNavigateTab,
  onOpenAddExpense
}) => {
  const { settings, transactions, expenses } = usePOS();

  // Dynamic calculations from context
  const totalSalesRevenue = transactions.reduce((acc, t) => acc + (t.finalTotal || 0), 0);
  const totalExpenseCost = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netOperatingIncome = totalSalesRevenue - totalExpenseCost;

  const totalBankBalance = 236401.25;
  const totalCashDrawer = 4850.00;
  const totalLiquidAssets = totalBankBalance + totalCashDrawer;

  return (
    <div className="space-y-6">
      {/* Executive Financial KPI Grid */}
      <NebulaStatGrid>
        <NebulaStatCard
          label="Total Liquid Treasury"
          value={`${settings.currencySymbol}${totalLiquidAssets.toLocaleString()}`}
          icon={Landmark}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          statusText="Across 4 verified bank & cash vaults"
          statusColor="text-blue-600"
        />
        <NebulaStatCard
          label="Gross Revenue Inflow"
          value={`${settings.currencySymbol}${totalSalesRevenue.toLocaleString()}`}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          statusText={`${transactions.length} verified POS transactions`}
          statusColor="text-emerald-600"
        />
        <NebulaStatCard
          label="Operating Expenses (OPEX)"
          value={`${settings.currencySymbol}${totalExpenseCost.toLocaleString()}`}
          icon={TrendingDown}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
          statusText={`${expenses.length} recorded expense vouchers`}
          statusColor="text-rose-600"
        />
        <NebulaStatCard
          label="Net Operating EBITDA"
          value={`${settings.currencySymbol}${netOperatingIncome.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          statusText="Healthy net operating margin"
          statusColor="text-indigo-600"
        />
      </NebulaStatGrid>

      {/* Quick Financial Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Financial Management Actions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Record Expense
          </button>
          <button
            onClick={() => onNavigateTab('banking')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            <Landmark className="w-3.5 h-3.5" /> Banking & Accounts
          </button>
          <button
            onClick={() => onNavigateTab('registers')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" /> Cash Registers
          </button>
          <button
            onClick={() => onNavigateTab('accounting')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
          >
            <BarChart3 className="w-3.5 h-3.5" /> General Ledger
          </button>
        </div>
      </div>

      {/* Two Column Layout: Cash Flow Velocity & Treasury Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableCard title="Cash Flow Velocity & Liquidity" subtitle="Real-time inflows from sales versus vendor outflows and operating expenditures">
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">Total Cash Inflows</span>
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    {settings.currencySymbol}{(totalSalesRevenue + 45000).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium">POS sales receipts, B2B invoices & bank clearing</p>
                </div>

                <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900">Total Cash Outflows</span>
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-rose-700">
                    {settings.currencySymbol}{(totalExpenseCost + 28000).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-rose-600 font-medium">Inventory purchases, payroll & operating overhead</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Working Capital Runway Buffer</h4>
                    <p className="text-[11px] text-slate-500">Estimated liquidity reserve based on trailing 30-day burn rate</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-blue-600">3.8 Months</span>
                  <span className="block text-[10px] text-emerald-600 font-bold">Stable & Secure</span>
                </div>
              </div>
            </div>
          </TableCard>
        </div>

        <div>
          <TableCard title="Primary Treasury Accounts" subtitle="Verified balances across banking and cash vaults">
            <div className="p-5 space-y-3">
              {[
                { name: 'Chase Operating Account', number: 'CHK-8492', type: 'Bank Checking', balance: 142500.75, color: 'text-blue-600' },
                { name: 'Wells Fargo Reserve', number: 'RES-4421', type: 'Treasury Yield', balance: 84000.50, color: 'text-indigo-600' },
                { name: 'Front Desk Cash Vault', number: 'CASH-001', type: 'Register Float', balance: 4850.00, color: 'text-emerald-600' },
                { name: 'Stripe Merchant POS', number: 'STRP-01', type: 'Card Gateway', balance: 12890.50, color: 'text-purple-600' },
              ].map((acc, i) => (
                <div key={i} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-2">
                    <span className="text-xs font-bold text-slate-900 block truncate">{acc.name}</span>
                    <span className="text-[10px] text-slate-500">{acc.type} • {acc.number}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-black ${acc.color}`}>
                      {settings.currencySymbol}{acc.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TableCard>
        </div>
      </div>
    </div>
  );
};
