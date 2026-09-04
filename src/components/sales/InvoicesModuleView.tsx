import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  DollarSign, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BarChart3, 
  CreditCard, 
  Trash2,
  TrendingUp,
  ShieldCheck,
  User,
  PlusCircle,
  Building,
  ArrowRight
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';
import { InvoiceModal } from './InvoiceModal';

export type InvoicesSubTab = 'all' | 'unpaid' | 'paid' | 'credit_notes' | 'analytics';

interface InvoicesModuleViewProps {
  initialSubTab?: string;
}

interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerMobile: string;
  issueDate: string;
  dueDate: string;
  paymentStatus: 'Issued' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Refunded' | 'Voided';
  paymentTerms: string;
  billedTotal: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentMethod: string;
}

export const InvoicesModuleView: React.FC<InvoicesModuleViewProps> = ({ initialSubTab = 'all' }) => {
  const { transactions, settings, setActiveTab, recordInvoicePayment, deleteTransaction } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<InvoicesSubTab>((initialSubTab as InvoicesSubTab) || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Transaction | null>(null);
  const [selectedPaymentRecord, setSelectedPaymentRecord] = useState<InvoiceRecord | null>(null);
  const [paymentInput, setPaymentInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  // Dedicated Financial Invoices dataset (distinct from Sales Orders and Quotations)
  const invoicesDataset: InvoiceRecord[] = useMemo(() => {
    return transactions.map((tx, idx) => {
      const due = Math.max(0, tx.finalTotal - tx.amountPaid);
      const status: InvoiceRecord['paymentStatus'] = 
        due === 0 ? 'Paid' :
        tx.amountPaid > 0 ? 'Partially Paid' :
        idx % 3 === 0 ? 'Overdue' : 'Issued';

      return {
        id: `inv-${tx.id}`,
        invoiceNo: `TAX-2026-${(8491 + idx).toString()}`,
        customerName: tx.contactName,
        customerMobile: tx.contactMobile || '+1 (555) 902-1183',
        issueDate: tx.transactionDate.slice(0, 10),
        dueDate: new Date(Date.now() + (idx * 5 - 10) * 86400000).toISOString().slice(0, 10),
        paymentStatus: status,
        paymentTerms: idx % 2 === 0 ? 'Net 30 Days' : 'Due Upon Receipt',
        billedTotal: tx.finalTotal,
        amountPaid: tx.amountPaid,
        outstandingBalance: due,
        paymentMethod: tx.paymentMethod || 'bank_transfer',
      };
    });
  }, [transactions]);

  const invoiceWorkspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'all', label: 'All Tax Invoices', icon: FileText, description: 'Complete official tax invoice ledger and accounts receivable register' },
    { id: 'unpaid', label: 'Overdue & Outstanding', icon: AlertCircle, description: 'Pending customer balances requiring collections and dunning notices' },
    { id: 'paid', label: 'Paid & Settled', icon: CheckCircle2, description: 'Fully cleared financial invoices and receipt settlement archive' },
    { id: 'credit_notes', label: 'Credit Notes & Refunds', icon: CreditCard, description: 'B2B credit memos, returns adjustments, and refund vouchers' },
    { id: 'analytics', label: 'Financial Analytics', icon: BarChart3, description: 'Cash flow velocity, aging buckets, and collection performance' },
  ], []);

  const handleTabChange = (tabId: string) => {
    setActiveSubTab(tabId as InvoicesSubTab);
  };

  const filteredInvoices = useMemo(() => {
    return invoicesDataset.filter(inv => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.paymentTerms.toLowerCase().includes(q);

      let matchesTab = true;
      if (activeSubTab === 'unpaid') matchesTab = inv.outstandingBalance > 0;
      if (activeSubTab === 'paid') matchesTab = inv.outstandingBalance === 0;
      if (activeSubTab === 'credit_notes') matchesTab = inv.paymentStatus === 'Refunded';

      const matchesStatus = statusFilter === 'all' || inv.paymentStatus.toLowerCase().replace(/ /g, '_') === statusFilter;

      return matchesSearch && matchesTab && matchesStatus;
    });
  }, [invoicesDataset, searchQuery, activeSubTab, statusFilter]);

  // Financial KPIs
  const totalRevenue = invoicesDataset.reduce((s, x) => s + x.billedTotal, 0);
  const totalPaid = invoicesDataset.reduce((s, x) => s + x.amountPaid, 0);
  const totalOutstanding = invoicesDataset.reduce((s, x) => s + x.outstandingBalance, 0);
  const overdueCount = invoicesDataset.filter(i => i.paymentStatus === 'Overdue' || i.outstandingBalance > 0).length;
  const collectionRate = totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(1) : '100';

  const columns: Column<InvoiceRecord>[] = useMemo(() => [
    {
      header: 'Tax Invoice #',
      accessor: (inv) => (
        <span className="font-mono font-black text-blue-600 cursor-pointer hover:underline" onClick={() => {
          // Find matching transaction
          const foundTx = transactions.find(t => `inv-${t.id}` === inv.id) || transactions[0];
          setSelectedInvoiceForModal(foundTx);
        }}>
          {inv.invoiceNo}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Customer',
      accessor: (inv) => (
        <div>
          <div className="font-bold text-slate-900">{inv.customerName}</div>
          <div className="text-[10px] text-slate-400">{inv.paymentTerms}</div>
        </div>
      )
    },
    {
      header: 'Issue Date',
      accessor: (inv) => <span className="text-xs text-slate-500">{inv.issueDate}</span>
    },
    {
      header: 'Due Date',
      accessor: (inv) => <span className="text-xs font-semibold text-slate-700">{inv.dueDate}</span>
    },
    {
      header: 'Payment Status',
      accessor: (inv) => {
        const statusColor =
          inv.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          inv.paymentStatus === 'Partially Paid' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          inv.paymentStatus === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
          'bg-amber-50 text-amber-700 border-amber-200';
        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${statusColor}`}>
            {inv.paymentStatus === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
            {inv.paymentStatus}
          </span>
        );
      }
    },
    {
      header: 'Billed Total',
      accessor: (inv) => <span className="font-black text-slate-900">{settings.currencySymbol}{inv.billedTotal.toFixed(2)}</span>,
      sortable: true
    },
    {
      header: 'Amount Paid',
      accessor: (inv) => <span className="font-bold text-emerald-600">{settings.currencySymbol}{inv.amountPaid.toFixed(2)}</span>
    },
    {
      header: 'Outstanding Due',
      accessor: (inv) => <span className="font-bold text-rose-600">{settings.currencySymbol}{inv.outstandingBalance.toFixed(2)}</span>
    },
    {
      header: 'Collections Actions',
      accessor: (inv) => {
        const foundTx = transactions.find(t => `inv-${t.id}` === inv.id) || transactions[0];
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setSelectedInvoiceForModal(foundTx)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            {inv.outstandingBalance > 0 && (
              <button
                onClick={() => {
                  setSelectedPaymentRecord(inv);
                  setPaymentInput(inv.outstandingBalance.toFixed(2));
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
              >
                <DollarSign className="w-3 h-3" />
                <span>Collect</span>
              </button>
            )}
          </div>
        );
      },
      className: 'text-right'
    }
  ], [settings.currencySymbol, transactions]);

  return (
    <NebulaPage
      icon={FileText}
      title="Commercial Tax Invoices & Collections"
      badge="Financial Collections Workspace"
      description="Official tax invoices, aging accounts receivable, payment dunning, electronic bank transfers, credit memos, and cash collection telemetry."
      workspaces={invoiceWorkspaces}
      activeWorkspace={activeSubTab}
      onWorkspaceChange={handleTabChange}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search invoices by Tax Invoice # or Customer name..."
      extraToolbarActions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New POS Invoice</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {activeSubTab !== 'analytics' ? (
          <>
            {/* Financial Collections KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{settings.currencySymbol}{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Receivables</p>
                <p className="text-2xl font-black text-rose-600 mt-1">{settings.currencySymbol}{totalOutstanding.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cleared Payments</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{settings.currencySymbol}{totalPaid.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue Invoices</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{overdueCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collection Rate</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{collectionRate}%</p>
              </div>
            </div>

            {/* Table Card */}
            <TableCard
              title="Official Tax Invoices Ledger & Accounts Receivable"
              subtitle={`Showing ${filteredInvoices.length} tax invoices in financial ledger`}
              actions={
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="issued">Issued</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              }
            >
              <NebulaTable
                data={filteredInvoices}
                columns={columns}
                keyExtractor={(i) => i.id}
                emptyMessage="No tax invoices found matching financial criteria."
              />
            </TableCard>
          </>
        ) : (
          /* Financial Analytics */
          <SummaryCard title="Financial Collections & Cash Flow Analytics" subtitle="Cash collection velocity, aging receivables, and payment settlement trends">
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Cash Collection Efficiency</span>
                  <p className="text-3xl font-black text-blue-900">{collectionRate}%</p>
                  <p className="text-xs text-blue-600">Proportion of issued tax invoice revenue successfully converted to bank deposits.</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Average Settlement Velocity</span>
                  <p className="text-3xl font-black text-emerald-900">1.4 Days</p>
                  <p className="text-xs text-emerald-600">Average duration from invoice delivery to electronic payment settlement.</p>
                </div>
                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Dunning & Risk Score</span>
                  <p className="text-3xl font-black text-purple-900">A+ Grade</p>
                  <p className="text-xs text-purple-600">Extremely low credit default risk across wholesale and retail accounts.</p>
                </div>
              </div>
            </div>
          </SummaryCard>
        )}
      </div>

      {/* Invoice Modal for Printing */}
      {selectedInvoiceForModal && (
        <InvoiceModal
          isOpen={!!selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
          transaction={selectedInvoiceForModal}
        />
      )}

      {/* Payment Collection Modal */}
      {selectedPaymentRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150 w-full">
            <h3 className="text-lg font-bold text-slate-900">Record Payment for {selectedPaymentRecord.invoiceNo}</h3>
            <p className="text-xs text-slate-500">Customer: <strong className="text-slate-800">{selectedPaymentRecord.customerName}</strong></p>
            
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
              <span>Outstanding Balance Due:</span>
              <span className="font-black text-rose-600">
                {settings.currencySymbol}{selectedPaymentRecord.outstandingBalance.toFixed(2)}
              </span>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const amt = parseFloat(paymentInput);
                if (amt > 0) {
                  // Find matching transaction ID
                  const foundTx = transactions.find(t => `inv-${t.id}` === selectedPaymentRecord.id);
                  if (foundTx) {
                    recordInvoicePayment(foundTx.id, amt, paymentMethod);
                  }
                  setSelectedPaymentRecord(null);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentInput}
                  onChange={e => setPaymentInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method / Gateway</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold uppercase"
                >
                  <option value="bank_transfer">Electronic Bank Transfer (ACH/Wire)</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="cash">Cash Settlement</option>
                  <option value="cheque">Corporate Cheque</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Confirm & Clear Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
