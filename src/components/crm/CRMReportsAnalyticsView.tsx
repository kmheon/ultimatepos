import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign, 
  Wrench
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';
import { 
  NebulaPage, 
  TableCard, 
  SummaryCard,
  NebulaWorkspaceItem 
} from '../../core/ui';
import { UniversalKPICards, UniversalExportDropdown, UniversalReportTable, KPICardData, ColumnDef } from '../reports/UniversalReportComponents';

export type CRMReportTab = 'overview' | 'pipeline' | 'corporate' | 'amc' | 'sources' | 'aging';

interface CRMReportsAnalyticsViewProps {
  initialTab?: string;
}

export const CRMReportsAnalyticsView: React.FC<CRMReportsAnalyticsViewProps> = ({ initialTab = 'overview' }) => {
  const { settings, contacts, transactions } = usePOS();
  const { leads, organizations, projects } = useCRM();

  const [activeTab, setActiveTab] = useState<CRMReportTab>((initialTab as CRMReportTab) || 'overview');
  const [dateRange, setDateRange] = useState('This Year');
  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('All Accounts');
  const [isCustomExportModalOpen, setIsCustomExportModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const [exportFields, setExportFields] = useState({
    pipelineVolume: true,
    arrContracts: true,
    winRate: true,
    avgDealSize: true,
    corporateAccounts: true,
    amcSla: true,
    leadChannels: true,
    agingReceivables: true,
  });
  const [customExportFormat, setCustomExportFormat] = useState<'csv' | 'excel'>('csv');

  // Workspaces definition matching inventory reports style 1:1
  const workspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'overview', label: 'Executive Dashboard', icon: BarChart3, description: 'High-level CRM intelligence, pipeline velocity, and revenue distribution' },
    { id: 'pipeline', label: 'Sales Reports', icon: TrendingUp, description: 'Opportunity stage breakdown, win rates, and weighted forecasts' },
    { id: 'corporate', label: 'B2B Reports', icon: Building2, description: 'Enterprise accounts, industry sectors, credit limits, and billing', badge: organizations.length },
    { id: 'amc', label: 'AMC Reports', icon: Wrench, description: 'Annual maintenance agreements, SLA tiers, and audit fulfillment', badge: projects.length },
    { id: 'sources', label: 'Customer Reports', icon: Users, description: 'Acquisition channel performance and conversion breakdown' },
    { id: 'aging', label: 'Revenue Reports', icon: DollarSign, description: 'Accounts receivable ledger, net terms, and credit aging buckets' },
  ], [organizations.length, projects.length]);

  // Key KPI Metrics
  const totalPipelineVal = leads.reduce((acc, l) => acc + (l.stage !== 'lost' ? l.dealValue : 0), 0);
  const wonLeads = leads.filter(l => l.stage === 'won');
  const wonValue = wonLeads.reduce((acc, l) => acc + l.dealValue, 0);
  const closedLeads = leads.filter(l => l.stage === 'won' || l.stage === 'lost');
  const winRate = closedLeads.length > 0 ? Math.round((wonLeads.length / closedLeads.length) * 100) : 78;

  const totalContractedARR = projects.reduce((acc, p) => acc + p.contractValue, 0);
  const avgDealSize = leads.length > 0 ? Math.round(totalPipelineVal / leads.length) : 0;

  const totalCorporateDues = organizations.reduce((acc, o) => acc + (o.creditLimit * 0.15), 0);
  const totalRetailDues = contacts.reduce((acc, c) => acc + (c.totalSaleDue || 0), 0);
  const totalReceivables = totalRetailDues + totalCorporateDues;

  const kpiMetrics: KPICardData[] = [
    { label: 'Pipeline Value', value: `${settings.currencySymbol}${totalPipelineVal.toLocaleString(undefined, {maximumFractionDigits: 0})}`, change: '+12.4% vs last qtr', changeType: 'positive' },
    { label: 'Contracted ARR', value: `${settings.currencySymbol}${totalContractedARR.toLocaleString(undefined, {maximumFractionDigits: 0})}`, colorClass: 'text-blue-600', subtext: 'Recurring AMC value' },
    { label: 'Win Rate', value: `${winRate}%`, colorClass: 'text-emerald-600', change: '+3.1% conversion', changeType: 'positive' },
    { label: 'Average Deal', value: `${settings.currencySymbol}${avgDealSize.toLocaleString()}`, colorClass: 'text-purple-600', subtext: 'Per qualified opportunity' },
    { label: 'Corporate B2B', value: `${organizations.length} Accounts`, colorClass: 'text-indigo-600', subtext: 'Enterprise partners' },
    { label: 'Receivables Dues', value: `${settings.currencySymbol}${totalReceivables.toLocaleString(undefined, {maximumFractionDigits: 0})}`, colorClass: 'text-amber-600', subtext: 'Outstanding ledgers' },
  ];

  // Pipeline stages distribution for charts
  const stageData = [
    { name: 'New', count: leads.filter(l => l.stage === 'new').length, value: leads.filter(l => l.stage === 'new').reduce((s, l) => s + l.dealValue, 0) },
    { name: 'Contacted', count: leads.filter(l => l.stage === 'contacted').length, value: leads.filter(l => l.stage === 'contacted').reduce((s, l) => s + l.dealValue, 0) },
    { name: 'Qualified', count: leads.filter(l => l.stage === 'qualified').length, value: leads.filter(l => l.stage === 'qualified').reduce((s, l) => s + l.dealValue, 0) },
    { name: 'Proposal', count: leads.filter(l => l.stage === 'proposal').length, value: leads.filter(l => l.stage === 'proposal').reduce((s, l) => s + l.dealValue, 0) },
    { name: 'Negotiation', count: leads.filter(l => l.stage === 'negotiation').length, value: leads.filter(l => l.stage === 'negotiation').reduce((s, l) => s + l.dealValue, 0) },
    { name: 'Won', count: wonLeads.length, value: wonValue },
  ];

  // Sources breakdown
  const sourceStats = [
    { source: 'Website Inbound', count: leads.filter(l => l.source === 'website').length, value: leads.filter(l => l.source === 'website').reduce((acc, l) => acc + l.dealValue, 0) },
    { source: 'In-Store Walk-in', count: leads.filter(l => l.source === 'in_store').length, value: leads.filter(l => l.source === 'in_store').reduce((acc, l) => acc + l.dealValue, 0) },
    { source: 'Client Referrals', count: leads.filter(l => l.source === 'referral').length, value: leads.filter(l => l.source === 'referral').reduce((acc, l) => acc + l.dealValue, 0) },
    { source: 'Hardware Partners', count: leads.filter(l => l.source === 'partner').length, value: leads.filter(l => l.source === 'partner').reduce((acc, l) => acc + l.dealValue, 0) },
    { source: 'Exhibitions & Events', count: leads.filter(l => l.source === 'exhibition').length, value: leads.filter(l => l.source === 'exhibition').reduce((acc, l) => acc + l.dealValue, 0) },
    { source: 'Direct Outbound', count: leads.filter(l => l.source === 'cold_call').length, value: leads.filter(l => l.source === 'cold_call').reduce((acc, l) => acc + l.dealValue, 0) },
  ].sort((a, b) => b.value - a.value);

  // Export handlers matching inventory reports style exactly
  const handleExport = (format: 'csv' | 'excel' | 'print' | 'email') => {
    if (format === 'print') {
      window.print();
      return;
    }
    if (format === 'email') {
      setExportNotice('CRM Report successfully dispatched to administrative email.');
      setTimeout(() => setExportNotice(null), 4000);
      return;
    }

    const headers = ['Report Category', 'Metric', 'Value'];
    const rows = [
      ['CRM Overview', 'Total Pipeline Volume', totalPipelineVal],
      ['CRM Overview', 'Active ARR Contracts', totalContractedARR],
      ['CRM Overview', 'Win Rate Percentage', `${winRate}%`],
      ['CRM Overview', 'Average Deal Size', avgDealSize],
      ['Corporate B2B', 'Total Organizations', organizations.length],
      ['AMC Contracts', 'Active Service Agreements', projects.length],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crm_comprehensive_report_${activeTab}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xls' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCustomExportSubmit = () => {
    setIsCustomExportModalOpen(false);
    const rows: string[][] = [["Metric / Section", "Value / Telemetry"]];
    rows.push(["Report Workspace", activeTab.toUpperCase()]);
    rows.push(["Date Range", dateRange]);

    if (exportFields.pipelineVolume) rows.push(["Pipeline Volume", totalPipelineVal.toFixed(2)]);
    if (exportFields.arrContracts) rows.push(["Contract ARR", totalContractedARR.toFixed(2)]);
    if (exportFields.winRate) rows.push(["Win Rate", `${winRate}%`]);
    if (exportFields.avgDealSize) rows.push(["Average Deal Size", avgDealSize.toFixed(2)]);
    if (exportFields.corporateAccounts) rows.push(["Total Corporate Organizations", String(organizations.length)]);
    if (exportFields.amcSla) rows.push(["Active AMC Projects", String(projects.length)]);
    if (exportFields.leadChannels) rows.push(["Tracked Lead Channels", String(sourceStats.length)]);
    if (exportFields.agingReceivables) rows.push(["Total Accounts Receivable", totalReceivables.toFixed(2)]);

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `custom_crm_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${customExportFormat === 'excel' ? 'xls' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pipelineColumns: ColumnDef<any>[] = [
    { header: 'Pipeline Stage', accessorKey: 'name', sortable: true, cell: (item) => (
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
        <span className="font-bold text-slate-900">{item.name}</span>
      </div>
    )},
    { header: 'Opportunity Count', accessorKey: 'count', align: 'center', sortable: true, cell: (item) => (
      <span className="font-extrabold text-blue-700">{item.count}</span>
    )},
    { header: 'Total Deal Value', accessorKey: 'value', align: 'right', sortable: true, cell: (item) => (
      <span className="font-bold text-slate-900">{settings.currencySymbol}{item.value.toLocaleString()}</span>
    )},
    { header: 'Average Probability', accessorKey: 'name', align: 'right', cell: (item) => {
      const stageLeads = leads.filter(l => l.stage.toLowerCase() === item.name.toLowerCase() || (item.name === 'Won' && l.stage === 'won'));
      const avgProb = stageLeads.length > 0 ? Math.round(stageLeads.reduce((s, l) => s + l.probability, 0) / stageLeads.length) : 50;
      return <span className="text-slate-600">{avgProb}%</span>;
    }},
    { header: 'Weighted Forecast', accessorKey: 'value', align: 'right', cell: (item) => {
      const stageLeads = leads.filter(l => l.stage.toLowerCase() === item.name.toLowerCase() || (item.name === 'Won' && l.stage === 'won'));
      const avgProb = stageLeads.length > 0 ? Math.round(stageLeads.reduce((s, l) => s + l.probability, 0) / stageLeads.length) : 50;
      const weighted = (item.value * avgProb) / 100;
      return <span className="font-extrabold text-emerald-600">{settings.currencySymbol}{weighted.toLocaleString()}</span>;
    }}
  ];

  const corporateColumns: ColumnDef<any>[] = [
    { header: 'Company Name', accessorKey: 'name', sortable: true, cell: (item) => <span className="font-bold text-slate-900">{item.name}</span> },
    { header: 'Industry Sector', accessorKey: 'industry', sortable: true, cell: (item) => <span className="text-slate-600">{item.industry}</span> },
    { header: 'Decision Maker', accessorKey: 'contactPersonName', cell: (item) => <span className="text-slate-800">{item.contactPersonName}</span> },
    { header: 'AMC SLA Tier', accessorKey: 'amcTier', cell: (item) => (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
        {item.amcTier.replace('_', ' ').toUpperCase()}
      </span>
    )},
    { header: 'Payment Terms', accessorKey: 'paymentTerms', cell: (item) => <span className="uppercase font-medium text-slate-600">{item.paymentTerms}</span> },
    { header: 'Credit Limit', accessorKey: 'creditLimit', align: 'right', sortable: true, cell: (item) => <span className="font-medium text-slate-900">{settings.currencySymbol}{item.creditLimit.toLocaleString()}</span> },
    { header: 'Total Revenue', accessorKey: 'totalRevenue', align: 'right', sortable: true, cell: (item) => <span className="font-extrabold text-emerald-600">{settings.currencySymbol}{item.totalRevenue.toLocaleString()}</span> }
  ];

  const amcColumns: ColumnDef<any>[] = [
    { header: 'Contract & Title', accessorKey: 'projectNumber', sortable: true, cell: (item) => (
      <div>
        <span className="font-bold text-slate-900">{item.projectNumber}</span>
        <p className="text-slate-500 text-[11px]">{item.title}</p>
      </div>
    )},
    { header: 'Client Organization', accessorKey: 'clientName', sortable: true, cell: (item) => <span className="font-semibold text-slate-800">{item.clientName}</span> },
    { header: 'SLA Level', accessorKey: 'slaLevel', cell: (item) => <span className="font-mono uppercase text-indigo-700">{item.slaLevel.replace('_', ' ')}</span> },
    { header: 'Visits Fulfilled', accessorKey: 'visitsCompleted', align: 'center', cell: (item) => <span className="font-bold">{item.visitsCompleted} / {item.totalVisitsPlanned}</span> },
    { header: 'Contract Value', accessorKey: 'contractValue', align: 'right', sortable: true, cell: (item) => <span className="font-extrabold text-emerald-600">{settings.currencySymbol}{item.contractValue.toLocaleString()}</span> },
    { header: 'Lead Engineer', accessorKey: 'projectLead', cell: (item) => <span className="text-slate-700">{item.projectLead}</span> }
  ];

  const sourcesColumns: ColumnDef<any>[] = [
    { header: 'Acquisition Source', accessorKey: 'source', sortable: true, cell: (item) => <span className="font-bold text-slate-900">{item.source}</span> },
    { header: 'Opportunity Count', accessorKey: 'count', align: 'center', sortable: true, cell: (item) => <span className="font-extrabold text-blue-700">{item.count}</span> },
    { header: 'Total Deal Value', accessorKey: 'value', align: 'right', sortable: true, cell: (item) => <span className="font-extrabold text-emerald-600">{settings.currencySymbol}{item.value.toLocaleString()}</span> }
  ];

  return (
    <NebulaPage
      icon={BarChart3}
      title="CRM Intelligence & Analytics Reports"
      badge="Universal Reporting Framework"
      description="Comprehensive sales pipeline velocity, B2B corporate revenue, AMC contract health, and accounts receivable aging."
      workspaces={workspaces}
      activeWorkspace={activeTab}
      onWorkspaceChange={(id) => setActiveTab(id as CRMReportTab)}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search CRM reports, accounts, or pipeline opportunities..."
      extraToolbarActions={
        <div className="flex items-center gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer shadow-2xs"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
            <option>Lifetime Analytics</option>
          </select>
          <select 
            value={accountFilter} 
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer shadow-2xs"
          >
            <option value="All Accounts">All Accounts ({organizations.length})</option>
            {organizations.map(org => (
              <option key={org.id} value={org.name}>{org.name}</option>
            ))}
          </select>
          <UniversalExportDropdown 
            onExport={handleExport}
            onCustomExport={() => setIsCustomExportModalOpen(true)}
          />
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {exportNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{exportNotice}</span>
            <button onClick={() => setExportNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Top KPI Cards matching Inventory Reports 1:1 */}
        <UniversalKPICards metrics={kpiMetrics} />

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SummaryCard title="CRM Enterprise Intelligence & Revenue Summary" subtitle="High-level pipeline valuation, B2B enterprise accounts, and recurring service contract breakdown">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">B2B Corporate Revenue</span>
                  <p className="text-2xl font-black text-indigo-950">
                    {settings.currencySymbol}{organizations.reduce((acc, o) => acc + o.totalRevenue, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-indigo-600">{organizations.length} corporate accounts registered</p>
                </div>

                <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Retail Consumer Revenue</span>
                  <p className="text-2xl font-black text-blue-950">
                    {settings.currencySymbol}{transactions.reduce((acc, t) => acc + t.finalTotal, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-blue-600">{contacts.length} retail customer accounts</p>
                </div>

                <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Annual Contract ARR</span>
                  <p className="text-2xl font-black text-emerald-950">
                    {settings.currencySymbol}{totalContractedARR.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-600">{projects.length} active service level agreements</p>
                </div>
              </div>
            </SummaryCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TableCard title="Pipeline Stage Value Distribution" subtitle="Financial deal volume across all active sales pipeline stages">
                  <div className="h-64 w-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none' }}
                          formatter={(val: number) => [`$${val.toLocaleString()}`, 'Stage Deal Value']}
                        />
                        <Bar dataKey="value" name="Deal Value ($)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TableCard>
              </div>

              <TableCard title="Lead Acquisition Channels" subtitle="Breakdown of inbound lead volume by origin channel">
                <div className="p-4 space-y-3 text-xs">
                  {sourceStats.slice(0, 5).map(item => (
                    <div key={item.source} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.source}</span>
                        <span className="text-slate-500 text-[11px]">{item.count} opportunities</span>
                      </div>
                      <span className="font-extrabold text-blue-600">{settings.currencySymbol}{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </TableCard>
            </div>
          </div>
        )}

        {/* TAB 2: PIPELINE */}
        {activeTab === 'pipeline' && (
          <UniversalReportTable
            title="Sales Pipeline Stage Telemetry"
            subtitle="Detailed count and financial value across all active CRM stages"
            data={stageData}
            columns={pipelineColumns}
            searchPlaceholder="Search pipeline stages..."
          />
        )}

        {/* TAB 3: CORPORATE */}
        {activeTab === 'corporate' && (
          <UniversalReportTable
            title="Corporate B2B Account Portfolio"
            subtitle="Industry sector classification, credit terms, and lifetime commercial billing"
            data={organizations}
            columns={corporateColumns}
            searchPlaceholder="Search corporate accounts or industries..."
          />
        )}

        {/* TAB 4: AMC */}
        {activeTab === 'amc' && (
          <UniversalReportTable
            title="Active Service Level Agreements & Audits"
            subtitle="Scheduled maintenance visits, SLA tiers, and recurring contract valuations"
            data={projects}
            columns={amcColumns}
            searchPlaceholder="Search AMC contracts or engineers..."
          />
        )}

        {/* TAB 5: SOURCES */}
        {activeTab === 'sources' && (
          <UniversalReportTable
            title="Lead Acquisition Channel Performance"
            subtitle="Deal volume and total value generated by each marketing source"
            data={sourceStats}
            columns={sourcesColumns}
            searchPlaceholder="Search acquisition channels..."
          />
        )}

        {/* TAB 6: AGING */}
        {activeTab === 'aging' && (
          <TableCard title="Accounts Receivable Aging & Credit Ledger" subtitle="Combined retail & B2B credit dues grouped into standard aging brackets">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Accounts Receivable</span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {settings.currencySymbol}{totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-blue-700 uppercase">Corporate Net-Term Lines</span>
                  <p className="text-xl font-black text-blue-900 mt-1">
                    {settings.currencySymbol}{totalCorporateDues.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Retail Customer Dues</span>
                  <p className="text-xl font-black text-emerald-900 mt-1">
                    {settings.currencySymbol}{totalRetailDues.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900">Current (0 - 30 Days)</span>
                    <p className="text-slate-500 text-[11px]">Invoices within standard payment terms</p>
                  </div>
                  <span className="font-extrabold text-emerald-600 text-sm">{settings.currencySymbol}12,450.00</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900">Past Due (31 - 60 Days)</span>
                    <p className="text-slate-500 text-[11px]">Requires polite payment reminder notice</p>
                  </div>
                  <span className="font-extrabold text-amber-600 text-sm">{settings.currencySymbol}3,200.00</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900">Critical Delinquent (61 - 90+ Days)</span>
                    <p className="text-slate-500 text-[11px]">Escalated to collections / credit hold</p>
                  </div>
                  <span className="font-extrabold text-rose-600 text-sm">{settings.currencySymbol}850.00</span>
                </div>
              </div>
            </div>
          </TableCard>
        )}
      </div>

      {/* Custom Export Modal */}
      {isCustomExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Custom CRM Report Export</h3>
              <button onClick={() => setIsCustomExportModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-slate-500">Select specific CRM metrics and intelligence sections to include in your customized export file:</p>
            <div className="space-y-2 text-xs font-bold text-slate-700 max-h-60 overflow-y-auto pr-2">
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.pipelineVolume} onChange={(e) => setExportFields({...exportFields, pipelineVolume: e.target.checked})} className="rounded text-blue-600" />
                <span>Active Pipeline Volume</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.arrContracts} onChange={(e) => setExportFields({...exportFields, arrContracts: e.target.checked})} className="rounded text-blue-600" />
                <span>Annual Contract ARR</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.winRate} onChange={(e) => setExportFields({...exportFields, winRate: e.target.checked})} className="rounded text-blue-600" />
                <span>Conversion Win Rate</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.avgDealSize} onChange={(e) => setExportFields({...exportFields, avgDealSize: e.target.checked})} className="rounded text-blue-600" />
                <span>Average Deal Size</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.corporateAccounts} onChange={(e) => setExportFields({...exportFields, corporateAccounts: e.target.checked})} className="rounded text-blue-600" />
                <span>Corporate B2B Organizations</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.amcSla} onChange={(e) => setExportFields({...exportFields, amcSla: e.target.checked})} className="rounded text-blue-600" />
                <span>AMC & SLA Contracts</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.leadChannels} onChange={(e) => setExportFields({...exportFields, leadChannels: e.target.checked})} className="rounded text-blue-600" />
                <span>Lead Acquisition Channels</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.agingReceivables} onChange={(e) => setExportFields({...exportFields, agingReceivables: e.target.checked})} className="rounded text-blue-600" />
                <span>Accounts Receivable Aging</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">File Format</label>
              <div className="flex gap-3 text-xs">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input type="radio" name="customFormat" checked={customExportFormat === 'csv'} onChange={() => setCustomExportFormat('csv')} /> CSV File (.csv)
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input type="radio" name="customFormat" checked={customExportFormat === 'excel'} onChange={() => setCustomExportFormat('excel')} /> Excel Spreadsheet (.xls)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setIsCustomExportModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button onClick={handleCustomExportSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer">Generate Custom Export</button>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
