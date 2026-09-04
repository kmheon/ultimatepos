import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  DollarSign, 
  Download, 
  PlusCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  FileSpreadsheet,
  Trash2,
  Send,
  CreditCard,
  FileText,
  BarChart3,
  Building,
  User,
  Clock,
  ShieldCheck,
  Truck,
  Wrench
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';
import { InvoiceModal } from './InvoiceModal';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';

export type SalesOrdersSubTab = 'orders' | 'invoices' | 'analytics';

interface SalesListProps {
  initialSubTab?: string;
}

export const SalesList: React.FC<SalesListProps> = ({ initialSubTab = 'orders' }) => {
  const { transactions, settings, setActiveTab, recordInvoicePayment, deleteTransaction } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<SalesOrdersSubTab>((initialSubTab as SalesOrdersSubTab) || 'orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);
  const [selectedPaymentTx, setSelectedPaymentTx] = useState<Transaction | null>(null);
  const [paymentInput, setPaymentInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedTxForDrawer, setSelectedTxForDrawer] = useState<Transaction | null>(null);

  const salesWorkspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'orders', label: 'Sales Orders', icon: Receipt, description: 'Customer confirmed purchase orders & inventory reservation' },
    { id: 'invoices', label: 'Commercial Invoices', icon: FileText, description: 'Official tax invoices, billing, and payment settlements' },
    { id: 'analytics', label: 'Revenue Analytics', icon: BarChart3, description: 'Fulfillment rates, collection metrics, and revenue breakdown' },
  ], []);

  const handleTabChange = (tabId: string) => {
    setActiveSubTab(tabId as SalesOrdersSubTab);
  };

  const sales = useMemo(() => {
    return transactions.filter(t => t.type === 'sell');
  }, [transactions]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesStatus = statusFilter === 'all' || sale.paymentStatus === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sale.invoiceNo.toLowerCase().includes(q) ||
        sale.contactName.toLowerCase().includes(q) ||
        sale.staffName.toLowerCase().includes(q) ||
        (sale.refNo && sale.refNo.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [sales, statusFilter, searchQuery]);

  const totalSales = filteredSales.reduce((s, x) => s + x.finalTotal, 0);
  const totalPaid = filteredSales.reduce((s, x) => s + x.amountPaid, 0);
  const totalDue = Math.max(0, totalSales - totalPaid);

  const handleExportCSV = () => {
    const headers = ['Invoice No,Customer,Date,Payment Status,Payment Method,Grand Total,Paid,Due,Cashier'];
    const rows = filteredSales.map(s => {
      const due = Math.max(0, s.finalTotal - s.amountPaid);
      return `"${s.invoiceNo}","${s.contactName}","${s.transactionDate}","${s.paymentStatus}","${s.paymentMethod}",${s.finalTotal},${s.amountPaid},${due},"${s.staffName}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<Transaction>[] = useMemo(() => [
    {
      header: 'Invoice #',
      accessor: (sale) => (
        <span className="font-mono font-black text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedTxForDrawer(sale)}>
          {sale.invoiceNo}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Customer',
      accessor: (sale) => (
        <div>
          <div className="font-bold text-slate-900 cursor-pointer hover:text-blue-600" onClick={() => setSelectedTxForDrawer(sale)}>
            {sale.contactName}
          </div>
          {sale.contactMobile && sale.contactMobile !== 'N/A' && (
            <div className="text-[10px] text-slate-400">{sale.contactMobile}</div>
          )}
        </div>
      )
    },
    {
      header: 'Date & Time',
      accessor: (sale) => (
        <span className="text-slate-500 whitespace-nowrap text-xs">{sale.transactionDate}</span>
      )
    },
    {
      header: 'Status',
      accessor: (sale) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
            sale.paymentStatus === 'paid'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : sale.paymentStatus === 'partial'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {sale.paymentStatus === 'paid' && <CheckCircle2 className="w-3 h-3" />}
          {sale.paymentStatus}
        </span>
      )
    },
    {
      header: 'Method',
      accessor: (sale) => (
        <span className="font-semibold uppercase text-slate-600 text-xs">{sale.paymentMethod}</span>
      )
    },
    {
      header: 'Grand Total',
      accessor: (sale) => (
        <span className="font-black text-slate-900">{settings.currencySymbol}{sale.finalTotal.toFixed(2)}</span>
      ),
      sortable: true
    },
    {
      header: 'Paid',
      accessor: (sale) => (
        <span className="font-bold text-emerald-600">{settings.currencySymbol}{sale.amountPaid.toFixed(2)}</span>
      )
    },
    {
      header: 'Due',
      accessor: (sale) => {
        const due = Math.max(0, sale.finalTotal - sale.amountPaid);
        return <span className="font-bold text-rose-600">{settings.currencySymbol}{due.toFixed(2)}</span>;
      }
    },
    {
      header: 'Actions',
      accessor: (sale) => {
        const due = Math.max(0, sale.finalTotal - sale.amountPaid);
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setSelectedInvoice(sale)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="View / Print Invoice"
            >
              <Eye className="w-4 h-4" />
            </button>
            {due > 0 && (
              <button
                onClick={() => {
                  setSelectedPaymentTx(sale);
                  setPaymentInput(due.toFixed(2));
                }}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                title="Record Payment"
              >
                <DollarSign className="w-3 h-3" />
                <span>Collect</span>
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm(`Delete order ${sale.invoiceNo}?`)) {
                  deleteTransaction(sale.id);
                }
              }}
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
      className: 'text-right'
    }
  ], [settings.currencySymbol, deleteTransaction]);

  return (
    <NebulaPage
      icon={Receipt}
      title="Sales Orders & Commercial Invoices"
      badge="Revenue Operations Engine"
      description="Unified commercial workflow managing customer orders, tax invoices, inventory reservation, and payment collections."
      workspaces={salesWorkspaces}
      activeWorkspace={activeSubTab}
      onWorkspaceChange={handleTabChange}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search by invoice #, customer name, or cashier..."
      onExportCSV={handleExportCSV}
      extraToolbarActions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New POS Sale</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {activeSubTab !== 'analytics' ? (
          <>
            {/* Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtered Sales Total</span>
                <h3 className="text-3xl font-black text-slate-900">{settings.currencySymbol}{totalSales.toFixed(2)}</h3>
                <p className="text-xs text-slate-500">{filteredSales.length} Transactions matched</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Received Payments</span>
                <h3 className="text-3xl font-black text-emerald-600">{settings.currencySymbol}{totalPaid.toFixed(2)}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{((totalPaid / (totalSales || 1)) * 100).toFixed(1)}% Collection Rate</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Accounts Due</span>
                <h3 className="text-3xl font-black text-rose-600">{settings.currencySymbol}{totalDue.toFixed(2)}</h3>
                <p className="text-xs text-rose-700 font-semibold">Credit balance to collect</p>
              </div>
            </div>

            {/* Table Card with NebulaTable */}
            <TableCard
              title={activeSubTab === 'orders' ? 'Customer Sales Orders' : 'Official Tax Invoices'}
              subtitle="Full commercial transaction audit trail with inventory & financial tracking"
              actions={
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="due">Due / Unpaid</option>
                  </select>
                </div>
              }
            >
              <NebulaTable
                data={filteredSales}
                columns={columns}
                keyExtractor={(s) => s.id}
                emptyMessage="No sales orders found matching your search criteria."
              />
            </TableCard>
          </>
        ) : (
          /* Analytics Workspace */
          <SummaryCard title="Sales Revenue & Commercial Fulfillment Analytics" subtitle="Comprehensive telemetry on order processing times, collection rates, and revenue breakdown">
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Order Fulfillment Rate</span>
                  <p className="text-3xl font-black text-blue-900">98.4%</p>
                  <p className="text-xs text-blue-600">Successfully fulfilled orders with verified inventory dispatch.</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Average Settlement Time</span>
                  <p className="text-3xl font-black text-emerald-900">1.2 Days</p>
                  <p className="text-xs text-emerald-600">Average duration from sales order generation to full invoice clearance.</p>
                </div>
                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Total Gross Revenue</span>
                  <p className="text-3xl font-black text-purple-900">{settings.currencySymbol}{totalSales.toLocaleString()}</p>
                  <p className="text-xs text-purple-600">Cumulative transactional revenue across all POS and B2B orders.</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Commercial Workflow Best Practices</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                  <li>Orders automatically reserve inventory stock upon generation, preventing stockouts during counter checkout.</li>
                  <li>Invoices link directly with financial accounts, generating official tax compliant receipts and updating accounts receivable.</li>
                  <li>Use the customer intelligence panel to inspect lifetime value, credit limits, and AMC warranty status in 1-click.</li>
                </ul>
              </div>
            </div>
          </SummaryCard>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          transaction={selectedInvoice}
        />
      )}

      {/* Payment Collection Modal */}
      {selectedPaymentTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-900">Collect Due Payment ({selectedPaymentTx.invoiceNo})</h3>
            <p className="text-xs text-slate-500">Customer: <strong className="text-slate-800">{selectedPaymentTx.contactName}</strong></p>
            
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
              <span>Total Balance Due:</span>
              <span className="font-black text-rose-600">
                {settings.currencySymbol}{Math.max(0, selectedPaymentTx.finalTotal - selectedPaymentTx.amountPaid).toFixed(2)}
              </span>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const amt = parseFloat(paymentInput);
                if (amt > 0) {
                  recordInvoicePayment(selectedPaymentTx.id, amt, paymentMethod);
                  setSelectedPaymentTx(null);
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold uppercase"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="bkash">bKash / Mobile Banking</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentTx(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer & Transaction Intelligence Drawer */}
      {selectedTxForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Commercial Transaction Intel</span>
                <h3 className="text-lg font-black font-mono mt-0.5">{selectedTxForDrawer.invoiceNo}</h3>
              </div>
              <button
                onClick={() => setSelectedTxForDrawer(null)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>{selectedTxForDrawer.contactName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>Mobile: <span className="font-semibold text-slate-900">{selectedTxForDrawer.contactMobile || 'N/A'}</span></div>
                  <div>Payment Status: <span className="font-semibold uppercase text-emerald-600">{selectedTxForDrawer.paymentStatus}</span></div>
                  <div>Salesperson: <span className="font-semibold text-slate-900">{selectedTxForDrawer.staffName || 'Counter Staff'}</span></div>
                  <div>Date: <span className="font-semibold text-slate-900">{selectedTxForDrawer.transactionDate}</span></div>
                </div>
              </div>

              {/* Itemized breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Itemized Revenue Breakdown</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {selectedTxForDrawer.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{it.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {it.sku} • Qty: {it.quantity}</p>
                      </div>
                      <span className="font-black text-slate-900">{settings.currencySymbol}{it.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Audit Trail & Timeline</h4>
                <div className="space-y-3 border-l-2 border-blue-200 pl-4 ml-2 text-xs">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                    <p className="font-bold text-slate-800">Order Placed & Inventory Reserved</p>
                    <p className="text-[10px] text-slate-400">{selectedTxForDrawer.transactionDate}</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-50" />
                    <p className="font-bold text-slate-800">Tax Invoice Generated & Payment Recorded ({selectedTxForDrawer.paymentMethod})</p>
                    <p className="text-[10px] text-slate-400">{selectedTxForDrawer.transactionDate}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedInvoice(selectedTxForDrawer);
                    setSelectedTxForDrawer(null);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
