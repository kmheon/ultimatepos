import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  ShoppingCart, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Send, 
  BarChart3, 
  CheckCircle2, 
  DollarSign, 
  Calendar,
  Sparkles,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Quotation } from '../../types';
import { AddQuotationModal } from './AddQuotationModal';
import { QuotationPrintModal } from './QuotationPrintModal';
import { updateBrowserURL } from '../../utils/navigationRouter';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';

export type QuotationsSubTab = 'pipeline' | 'converted' | 'archive' | 'analytics';

interface QuotationsModuleViewProps {
  initialSubTab?: string;
}

export const QuotationsModuleView: React.FC<QuotationsModuleViewProps> = ({ initialSubTab = 'pipeline' }) => {
  const { quotations, deleteQuotation, convertQuotationToSale, updateQuotation, settings, setActiveTab } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quotation | null>(null);

  const quotationWorkspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'pipeline', label: 'Estimates Pipeline', icon: FileText, description: 'Active drafts, sent quotes, and customer negotiations' },
    { id: 'converted', label: 'Converted Sales', icon: ShoppingCart, description: 'Quotes successfully converted into POS cash receipts' },
    { id: 'archive', label: 'Declined / Expired', icon: Clock, description: 'Archived or declined estimates' },
    { id: 'analytics', label: 'Conversion Analytics', icon: BarChart3, description: 'Win rates, quoting volume, and pipeline metrics' },
  ], []);

  const [activeSubTab, setActiveSubTab] = useState<QuotationsSubTab>((initialSubTab as QuotationsSubTab) || 'pipeline');

  const handleTabChange = (tabId: string) => {
    setActiveSubTab(tabId as QuotationsSubTab);
    updateBrowserURL('quotations', tabId);
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = 
      q.quoteNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesTab = true;
    if (activeSubTab === 'pipeline') matchesTab = q.status === 'draft' || q.status === 'sent' || q.status === 'accepted';
    if (activeSubTab === 'converted') matchesTab = q.status === 'converted';
    if (activeSubTab === 'archive') matchesTab = q.status === 'declined';

    const matchesStatus = selectedStatus === 'all' || q.status === selectedStatus;
    return matchesSearch && matchesTab && matchesStatus;
  });

  const getStatusBadge = (status: Quotation['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
      case 'sent':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1"><Send className="w-3 h-3" /> Sent to Client</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Accepted</span>;
      case 'declined':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Declined</span>;
      case 'converted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> Converted</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const totalQuotedValue = quotations.reduce((sum, q) => sum + q.finalTotal, 0);
  const convertedValue = quotations.filter(q => q.status === 'converted').reduce((sum, q) => sum + q.finalTotal, 0);
  const conversionRate = quotations.length > 0 ? ((quotations.filter(q => q.status === 'converted').length / quotations.length) * 100).toFixed(1) : '0';

  const columns: Column<Quotation>[] = useMemo(() => [
    {
      header: 'Quote #',
      accessor: (q) => (
        <div>
          <span className="font-bold text-slate-900">{q.quoteNo}</span>
          <span className="text-[11px] text-slate-400 font-normal block">{q.locationName}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Customer',
      accessor: (q) => (
        <div>
          <p className="font-bold text-slate-800">{q.customerName}</p>
          <p className="text-xs text-slate-500">{q.customerMobile || 'No phone'}</p>
        </div>
      )
    },
    {
      header: 'Date & Validity',
      accessor: (q) => (
        <div className="text-xs">
          <p className="text-slate-800 font-medium">Created: {q.date}</p>
          <p className="text-slate-500">Valid: {q.validUntil}</p>
        </div>
      )
    },
    {
      header: 'Items',
      accessor: (q) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
          {q.items.reduce((s, i) => s + i.quantity, 0)} Units ({q.items.length})
        </span>
      )
    },
    {
      header: 'Grand Total',
      accessor: (q) => (
        <div>
          <p className="font-black text-slate-900">{settings.currencySymbol}{q.finalTotal.toFixed(2)}</p>
          {q.discountAmount > 0 && (
            <span className="text-[10px] text-emerald-600 font-bold block">
              Disc: {settings.currencySymbol}{q.discountAmount.toFixed(2)}
            </span>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: 'Status',
      accessor: (q) => getStatusBadge(q.status)
    },
    {
      header: 'Actions',
      accessor: (q) => (
        <div className="flex items-center justify-end gap-1.5">
          {q.status !== 'converted' && (
            <button
              onClick={() => {
                convertQuotationToSale(q.id);
                setActiveTab('pos');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Load into POS Cart to Checkout"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Convert</span>
            </button>
          )}
          <button
            onClick={() => setSelectedQuoteForPrint(q)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete quotation ${q.quoteNo}?`)) {
                deleteQuotation(q.id);
              }
            }}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ], [settings.currencySymbol, convertQuotationToSale, deleteQuotation, setActiveTab]);

  return (
    <NebulaPage
      icon={FileText}
      title="Quotations & Proforma Invoices"
      badge="B2B Sales Pipeline"
      description="Prepare formal tech estimates, office bulk quotes, and convert accepted quotes into POS checkout in 1-click."
      workspaces={quotationWorkspaces}
      activeWorkspace={activeSubTab}
      onWorkspaceChange={handleTabChange}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search quotes by Quote #, Customer, or Product..."
      extraToolbarActions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStatus(selectedStatus === 'draft' ? 'all' : 'draft')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border ${
              selectedStatus === 'draft'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Drafts</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {activeSubTab !== 'analytics' ? (
          <>
            {/* Quick Metrics Grid using SummaryCards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Quotes</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{quotations.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pipeline</p>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {quotations.filter(q => q.status === 'sent' || q.status === 'draft' || q.status === 'accepted').length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Converted Sales</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {quotations.filter(q => q.status === 'converted').length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pipeline Value</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {settings.currencySymbol}{totalQuotedValue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Centralized TableCard & NebulaTable */}
            <TableCard
              title="Estimates & Quotations Directory"
              subtitle={`Showing ${filteredQuotations.length} quotations in current view`}
              actions={
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="converted">Converted to Sale</option>
                  <option value="declined">Declined</option>
                </select>
              }
            >
              <NebulaTable
                data={filteredQuotations}
                columns={columns}
                keyExtractor={(q) => q.id}
                emptyMessage="No quotations found matching your criteria."
              />
            </TableCard>
          </>
        ) : (
          /* Analytics Workspace */
          <SummaryCard title="Quotation Performance & Conversion Analytics" subtitle="Win rates, quoting volume, and pipeline realization metrics">
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Overall Win Conversion Rate</span>
                  <p className="text-3xl font-black text-blue-900">{conversionRate}%</p>
                  <p className="text-xs text-blue-600">Percentage of quotes successfully converted to POS checkout receipts.</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Converted Revenue</span>
                  <p className="text-3xl font-black text-emerald-900">{settings.currencySymbol}{convertedValue.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600">Total cash volume realized from accepted and converted estimates.</p>
                </div>
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Active Pipeline Volume</span>
                  <p className="text-3xl font-black text-amber-900">{quotations.filter(q => q.status === 'sent' || q.status === 'draft').length} Open</p>
                  <p className="text-xs text-amber-600">Estimates currently awaiting client sign-off or negotiation.</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Best Practices for B2B Quotations</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                  <li>Convert accepted estimates directly to POS in 1-click to instantly deduct inventory stock and generate tax receipts.</li>
                  <li>Set clear validity dates to ensure pricing accuracy against wholesale supply chain cost fluctuations.</li>
                  <li>Print formal proforma invoices with company tax IDs and authorized signatures for enterprise clients.</li>
                </ul>
              </div>
            </div>
          </SummaryCard>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddQuotationModal onClose={() => setIsAddModalOpen(false)} />
      )}

      {selectedQuoteForPrint && (
        <QuotationPrintModal
          quotation={selectedQuoteForPrint}
          onClose={() => setSelectedQuoteForPrint(null)}
        />
      )}
    </NebulaPage>
  );
};
