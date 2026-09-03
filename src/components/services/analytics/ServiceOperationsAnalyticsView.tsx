import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  ShieldCheck,
  Zap,
  Activity,
  DollarSign,
  FileText,
  Briefcase,
  Star,
  Search,
  RotateCcw,
  Check,
  X,
  Calendar,
  Mail,
  PieChart as PieChartIcon,
  BarChart3,
  Flame,
  Wrench,
  Layers,
  ArrowUpRight,
  ChevronRight,
  Send,
  HelpCircle,
  Award
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { usePOS } from '../../../context/POSContext';
import {
  ServiceAnalyticsFilters,
  useServiceOperationsAnalytics,
  ExecutiveServiceIntelligenceResult
} from '../../../services/serviceAnalytics.service';

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b', '#14b8a6'];

export const ServiceOperationsAnalyticsView: React.FC = () => {
  const { repairJobSheets, technicians, scheduleSlots, contacts, locations, settings } = usePOS();

  // 8 Dimension Filters requested
  const [filters, setFilters] = useState<ServiceAnalyticsFilters>({
    dateRange: 'this_month',
    branchId: 'all',
    technicianId: 'all',
    department: 'all',
    customerId: 'all',
    contractType: 'all',
    project: 'all',
    serviceCategory: 'all',
  });

  // Interactive View States
  const [activeRevenueTab, setActiveRevenueTab] = useState<'branch' | 'engineer' | 'customer' | 'department' | 'contract' | 'serviceType' | 'project'>('branch');
  const [revenueChartMode, setRevenueChartMode] = useState<'bar' | 'donut'>('bar');
  
  const [activeChartTab, setActiveChartTab] = useState<'revenueTrend' | 'status' | 'engineerProductivity' | 'topCustomers' | 'topProjects' | 'contractProfitability' | 'installVsMaint' | 'responseTime' | 'slaTrend' | 'assetCategory'>('revenueTrend');
  const [activeTableTab, setActiveTableTab] = useState<'customers' | 'engineers' | 'projects' | 'contracts' | 'slaRisks' | 'renewals'>('customers');
  const [tableSearchQuery, setTableSearchQuery] = useState('');

  // Report Modal States
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isScheduleReportOpen, setIsScheduleReportOpen] = useState(false);
  const [isEmailReportOpen, setIsEmailReportOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    recipient: 'ceo@camnex.com.bd, operations@camnex.com.bd',
    subject: 'CamneX Executive Service Intelligence Summary - September 2026',
    notes: 'Please find attached the latest Executive Service Intelligence performance report covering SLA health, field utilization, and recurring contract profitability.',
  });
  const [scheduleForm, setScheduleForm] = useState({
    frequency: 'weekly_monday',
    recipients: 'executive-board@camnex.com.bd',
    format: 'pdf_excel',
    includeKpis: true,
    includeRisks: true,
  });
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Fetch / compute data using custom React Query hook
  const { data, isLoading, isFetching, refetch } = useServiceOperationsAnalytics(
    filters,
    repairJobSheets,
    technicians,
    scheduleSlots,
    contacts,
    locations,
    settings
  );

  const currencySymbol = settings.currencySymbol || '৳';

  const handleFilterChange = (key: keyof ServiceAnalyticsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: 'this_month',
      branchId: 'all',
      technicianId: 'all',
      department: 'all',
      customerId: 'all',
      contractType: 'all',
      project: 'all',
      serviceCategory: 'all',
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'dateRange') return v !== 'this_month';
    return v !== 'all';
  }).length;

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Helper formatting
  const formatCur = (num: number) => {
    return `${currencySymbol} ${num.toLocaleString()}`;
  };

  // Export Excel CSV download generator
  const handleExportExcel = () => {
    if (!data) return;

    let csv = 'CAMNEX BANGLADESH - EXECUTIVE SERVICE INTELLIGENCE REPORT\n';
    csv += `Generated Date: ${new Date().toLocaleString()}\n`;
    csv += `Scope: Date=${filters.dateRange}, Branch=${filters.branchId}, Department=${filters.department}\n\n`;

    csv += 'TOP 14 EXECUTIVE KPIS\n';
    csv += 'KPI Name,Value,Benchmark / Subtext\n';
    csv += `Service Revenue,${data.topKpis.serviceRevenue.value},${data.topKpis.serviceRevenue.subText}\n`;
    csv += `Gross Profit,${data.topKpis.grossProfit.value},${data.topKpis.grossProfit.subText}\n`;
    csv += `AMC Revenue,${data.topKpis.amcRevenue.value},${data.topKpis.amcRevenue.subText}\n`;
    csv += `Projects Revenue,${data.topKpis.projectsRevenue.value},${data.topKpis.projectsRevenue.subText}\n`;
    csv += `Emergency Jobs,${data.topKpis.emergencyJobs.count},${data.topKpis.emergencyJobs.subText}\n`;
    csv += `Installations,${data.topKpis.installations.count},${data.topKpis.installations.subText}\n`;
    csv += `Maintenance Visits,${data.topKpis.maintenanceVisits.count},${data.topKpis.maintenanceVisits.subText}\n`;
    csv += `Customer Satisfaction,${data.topKpis.customerSatisfaction.score}/5.0,${data.topKpis.customerSatisfaction.subText}\n`;
    csv += `SLA Compliance,${data.topKpis.slaCompliance.percent}%,${data.topKpis.slaCompliance.subText}\n`;
    csv += `Engineer Utilization,${data.topKpis.engineerUtilization.percent}%,${data.topKpis.engineerUtilization.subText}\n`;
    csv += `Average Response Time,${data.topKpis.averageResponseTime.minutes} min,${data.topKpis.averageResponseTime.subText}\n`;
    csv += `Average Resolution Time,${data.topKpis.averageResolutionTime.hours} hrs,${data.topKpis.averageResolutionTime.subText}\n`;
    csv += `First Visit Resolution,${data.topKpis.firstVisitResolution.percent}%,${data.topKpis.firstVisitResolution.subText}\n`;
    csv += `Repeat Visits,${data.topKpis.repeatVisits.percent}%,${data.topKpis.repeatVisits.subText}\n\n`;

    csv += 'REVENUE ATTRIBUTION (CURRENT DIMENSION)\n';
    csv += 'Name,Subtitle,Revenue,Share %,Jobs Count\n';
    const currentAttribution = data.revenueAttributions[
      activeRevenueTab === 'branch' ? 'byBranch' :
      activeRevenueTab === 'engineer' ? 'byEngineer' :
      activeRevenueTab === 'customer' ? 'byCustomer' :
      activeRevenueTab === 'department' ? 'byDepartment' :
      activeRevenueTab === 'contract' ? 'byContract' :
      activeRevenueTab === 'serviceType' ? 'byServiceType' : 'byProject'
    ];
    currentAttribution.forEach(item => {
      csv += `"${item.name}","${item.subtitle || ''}",${item.revenue},${item.sharePercent}%,${item.jobsCount}\n`;
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `camnex_executive_service_intelligence_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Executive CSV spreadsheet downloaded successfully.');
  };

  if (isLoading || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-slate-50">
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm font-medium text-slate-700">Loading Executive Service Intelligence Telemetry...</span>
        </div>
      </div>
    );
  }

  // Active revenue dimension items
  const activeAttributionList = data.revenueAttributions[
    activeRevenueTab === 'branch' ? 'byBranch' :
    activeRevenueTab === 'engineer' ? 'byEngineer' :
    activeRevenueTab === 'customer' ? 'byCustomer' :
    activeRevenueTab === 'department' ? 'byDepartment' :
    activeRevenueTab === 'contract' ? 'byContract' :
    activeRevenueTab === 'serviceType' ? 'byServiceType' : 'byProject'
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{actionSuccessMessage}</span>
          <button onClick={() => setActionSuccessMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PAGE TITLE & EXECUTIVE REPORT ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              CamneX Enterprise Field Service Intelligence
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-500">Board & Executive Telemetry Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Executive Service Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Enterprise service revenue, contract profitability, SLA compliance, workforce utilization & strategic KPIs.
          </p>
        </div>

        {/* Executive Action Controls (PDF, Excel, Schedule, Email) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setIsExportPdfOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-all"
            title="Export Board Briefing PDF"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            Export PDF
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-all"
            title="Export Excel / CSV Data"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export Excel
          </button>

          <button
            onClick={() => setIsScheduleReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-all"
            title="Schedule Automated Delivery"
          >
            <Calendar className="w-4 h-4 text-amber-600" />
            Schedule Report
          </button>

          <button
            onClick={() => setIsEmailReportOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-all shadow-blue-200"
            title="Email Executive Summary"
          >
            <Mail className="w-4 h-4" />
            Email Report
          </button>
        </div>
      </div>

      {/* FILTER BAR - 8 Comprehensive Business Dimensions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Strategic Filter Dimensions (8 Dimensions)
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters ({activeFiltersCount})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Date
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="year_to_date">Year to Date</option>
            </select>
          </div>

          {/* 2. Branch */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Branch
            </label>
            <select
              value={filters.branchId}
              onChange={(e) => handleFilterChange('branchId', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Branches</option>
              <option value="dhaka">Dhaka Central Hub</option>
              <option value="chattogram">Chattogram Port Hub</option>
              <option value="gazipur">Gazipur Industrial Hub</option>
              <option value="sylhet">Sylhet Regional Hub</option>
              <option value="khulna">Khulna Port Branch</option>
            </select>
          </div>

          {/* 3. Engineer */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Engineer
            </label>
            <select
              value={filters.technicianId}
              onChange={(e) => handleFilterChange('technicianId', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Engineers</option>
              {technicians.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* 4. Department */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Enterprise Security">Enterprise Security</option>
              <option value="Networking">Networking</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Fire Safety">Fire Safety</option>
              <option value="Access Control">Access Control</option>
              <option value="Projects">Projects</option>
              <option value="AMC Services">AMC Services</option>
              <option value="Technical Support">Technical Support</option>
            </select>
          </div>

          {/* 5. Customer */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Customer
            </label>
            <select
              value={filters.customerId}
              onChange={(e) => handleFilterChange('customerId', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Enterprise Clients</option>
              <option value="grameen">Grameen CyberNet Ltd.</option>
              <option value="beximco">Beximco Data Hub</option>
              <option value="meghna">Meghna Industrial Park</option>
              <option value="scb">Standard Chartered Bank HQ</option>
              <option value="square">Square Textiles Ltd.</option>
              <option value="walton">Walton Hi-Tech Industries PLC</option>
              <option value="apex">Apex Holdings Tower</option>
            </select>
          </div>

          {/* 6. Project */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Project
            </label>
            <select
              value={filters.project}
              onChange={(e) => handleFilterChange('project', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
              <option value="metro_cctv">Metro CCTV Rollout</option>
              <option value="apex_access">Apex Tower Access</option>
              <option value="datacenter_core">Datacenter Core Expansion</option>
              <option value="meghna_fire">Meghna Industrial Fire Retrofit</option>
              <option value="walton_gates">Walton Flap Barrier Project</option>
              <option value="beximco_cloud">Beximco Cloud Networking</option>
            </select>
          </div>

          {/* 7. Contract */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Contract
            </label>
            <select
              value={filters.contractType}
              onChange={(e) => handleFilterChange('contractType', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Contracts</option>
              <option value="Turnkey Project">Turnkey Project</option>
              <option value="Comprehensive AMC">Comprehensive AMC</option>
              <option value="Platinum AMC">Platinum AMC</option>
              <option value="24/7 Callout SLA">24/7 Callout SLA</option>
              <option value="Industrial Safety AMC">Industrial Safety AMC</option>
              <option value="Warranty Agreement">Warranty Agreement</option>
            </select>
          </div>

          {/* 8. Service Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Service Category
            </label>
            <select
              value={filters.serviceCategory}
              onChange={(e) => handleFilterChange('serviceCategory', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="CCTV">CCTV & Surveillance</option>
              <option value="Networking">Enterprise Networking</option>
              <option value="Access Control">Access Control</option>
              <option value="Fire Alarm">Fire & Gas Safety</option>
              <option value="Servers">Server Infrastructure</option>
              <option value="PABX">PABX & IP Telephony</option>
              <option value="UPS">UPS & Power Systems</option>
              <option value="Solar">Solar Microgrids</option>
              <option value="Structured Cabling">Structured Cabling</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 14 TOP EXECUTIVE KPIS                                                     */}
      {/* ========================================================================= */}
      
      {/* ROW 1: 4 FINANCIAL & REVENUE REVENUE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Service Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Service Revenue
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCur(data.topKpis.serviceRevenue.value)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{data.topKpis.serviceRevenue.growthPercent}%
              </span>
              <span className="text-slate-400">vs prior period</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>{data.topKpis.serviceRevenue.subText}</span>
            <span className="font-semibold text-blue-600">Verified BI</span>
          </div>
        </div>

        {/* KPI 2: Gross Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Gross Profit
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCur(data.topKpis.grossProfit.value)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                {data.topKpis.grossProfit.marginPercent}% Operating Margin
              </span>
              <span className="text-emerald-600 font-semibold">+{data.topKpis.grossProfit.growthPercent}% YoY</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>{data.topKpis.grossProfit.subText}</span>
            <span className="font-semibold text-emerald-600">EBITDA Track</span>
          </div>
        </div>

        {/* KPI 3: AMC Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              AMC Revenue
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCur(data.topKpis.amcRevenue.value)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                {data.topKpis.amcRevenue.recurringSharePercent}% of Total Revenue
              </span>
              <span className="text-slate-500">{data.topKpis.amcRevenue.activeContractsCount} Contracts</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>{data.topKpis.amcRevenue.subText}</span>
            <span className="font-semibold text-amber-600">Recurring ARR</span>
          </div>
        </div>

        {/* KPI 4: Projects Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Projects Revenue
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCur(data.topKpis.projectsRevenue.value)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="inline-flex items-center text-indigo-600 font-bold">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{data.topKpis.projectsRevenue.growthPercent}%
              </span>
              <span className="text-slate-400">Turnkey Deployments</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>{data.topKpis.projectsRevenue.subText}</span>
            <span className="font-semibold text-indigo-600">{data.topKpis.projectsRevenue.activeProjectsCount} Projects Active</span>
          </div>
        </div>
      </div>

      {/* ROW 2: 4 OPERATIONAL VOLUME & CUSTOMER SATISFACTION KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 5: Emergency Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Emergency Jobs
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {data.topKpis.emergencyJobs.count} <span className="text-sm font-normal text-slate-500">Critical Calls</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                {data.topKpis.emergencyJobs.resolvedWithinSlaPercent}% within SLA
              </span>
              <span className="text-slate-500">{data.topKpis.emergencyJobs.avgResponseMinutes}m response</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Value: {formatCur(data.topKpis.emergencyJobs.revenue)}</span>
            <span className="font-semibold text-rose-600">24/7 Priority</span>
          </div>
        </div>

        {/* KPI 6: Installations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Installations
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {data.topKpis.installations.count} <span className="text-sm font-normal text-slate-500">Deployments</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                {data.topKpis.installations.onTimeDeliveryPercent}% On-Time
              </span>
              <span className="text-slate-500">Milestone Met</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Value: {formatCur(data.topKpis.installations.revenue)}</span>
            <span className="font-semibold text-blue-600">Hardware & Cabling</span>
          </div>
        </div>

        {/* KPI 7: Maintenance Visits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Maintenance Visits
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {data.topKpis.maintenanceVisits.count} <span className="text-sm font-normal text-slate-500">Audits</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                {data.topKpis.maintenanceVisits.complianceRatePercent}% Compliance
              </span>
              <span className="text-slate-500">PPM Schedules</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Value: {formatCur(data.topKpis.maintenanceVisits.revenue)}</span>
            <span className="font-semibold text-emerald-600">Zero Missed PPM</span>
          </div>
        </div>

        {/* KPI 8: Customer Satisfaction */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Customer Satisfaction
            </span>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {data.topKpis.customerSatisfaction.score}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ {data.topKpis.customerSatisfaction.maxScore}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">★ {data.topKpis.customerSatisfaction.fiveStarPercent}% 5-Star</span>
              <span>({data.topKpis.customerSatisfaction.totalAuditsCount} audits)</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>{data.topKpis.customerSatisfaction.subText}</span>
            <span className="font-semibold text-amber-600">ISO 9001 Audited</span>
          </div>
        </div>
      </div>

      {/* ROW 3: 6 WORKFORCE PERFORMANCE & SLA EFFICIENCY KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* KPI 9: SLA Compliance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              SLA Compliance
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {data.topKpis.slaCompliance.percent}%
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">
              Target ≥ {data.topKpis.slaCompliance.targetPercent}%
            </span>
            <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, data.topKpis.slaCompliance.percent)}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2 pt-1.5 border-t border-slate-100">
            {data.topKpis.slaCompliance.breachesCount} breaches logged
          </span>
        </div>

        {/* KPI 10: Engineer Utilization */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Engineer Utilization
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {data.topKpis.engineerUtilization.percent}%
            </div>
            <span className="text-[10px] text-blue-600 font-bold block mt-1">
              Target {data.topKpis.engineerUtilization.targetPercent}%
            </span>
            <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${Math.min(100, data.topKpis.engineerUtilization.percent)}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2 pt-1.5 border-t border-slate-100">
            {data.topKpis.engineerUtilization.billableHoursAverage}h billable / wk
          </span>
        </div>

        {/* KPI 11: Average Response Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Avg Response Time
            </span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {data.topKpis.averageResponseTime.minutes} <span className="text-xs font-normal text-slate-500">Mins</span>
            </div>
            <span className="text-[10px] text-indigo-600 font-bold block mt-1">
              Target ≤ {data.topKpis.averageResponseTime.targetMinutes} min
            </span>
            <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: '55%' }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2 pt-1.5 border-t border-slate-100">
            -{data.topKpis.averageResponseTime.improvementPercent}% turnaround
          </span>
        </div>

        {/* KPI 12: Average Resolution Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Avg Resolution Time
            </span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {data.topKpis.averageResolutionTime.hours} <span className="text-xs font-normal text-slate-500">Hours</span>
            </div>
            <span className="text-[10px] text-purple-600 font-bold block mt-1">
              Target ≤ {data.topKpis.averageResolutionTime.targetHours}h
            </span>
            <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: '70%' }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2 pt-1.5 border-t border-slate-100">
            -{data.topKpis.averageResolutionTime.improvementPercent}% on premise
          </span>
        </div>

        {/* KPI 13: First Visit Resolution */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              First Visit Resolution
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {data.topKpis.firstVisitResolution.percent}%
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">
              Target ≥ {data.topKpis.firstVisitResolution.targetPercent}%
            </span>
            <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, data.topKpis.firstVisitResolution.percent)}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2 pt-1.5 border-t border-slate-100">
            {data.topKpis.firstVisitResolution.singleVisitJobsCount} single dispatches
          </span>
        </div>

        {/* KPI 14: Repeat Visits */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Repeat Visits
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {data.topKpis.repeatVisits.percent}%
            </div>
            <span className="text-[10px] text-amber-600 font-bold block mt-1">
              Benchmark &lt; {data.topKpis.repeatVisits.targetBenchmarkPercent}%
            </span>
            <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${data.topKpis.repeatVisits.percent * 10}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2 pt-1.5 border-t border-slate-100">
            {data.topKpis.repeatVisits.recurrentJobsCount} 30-day recurrences
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REVENUE BY ATTRIBUTION SECTION (7 DIMENSIONS)                             */}
      {/* Branch, Engineer, Customer, Department, Contract, Service Type, Project   */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                Revenue Attribution Engine
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-semibold text-slate-600">7 Core Dimensional Breakdowns</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Revenue Breakdown by Organizational Dimensions
            </h3>
            <p className="text-xs text-slate-500">
              Select any operational dimension to analyze contribution, work order counts and operating margins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* 7 Dimension Selectors */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
              {[
                { id: 'branch', label: 'Branch' },
                { id: 'engineer', label: 'Engineer' },
                { id: 'customer', label: 'Customer' },
                { id: 'department', label: 'Department' },
                { id: 'contract', label: 'Contract' },
                { id: 'serviceType', label: 'Service Type' },
                { id: 'project', label: 'Project' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRevenueTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    activeRevenueTab === tab.id
                      ? 'bg-white text-blue-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chart Type Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setRevenueChartMode('bar')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  revenueChartMode === 'bar' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setRevenueChartMode('donut')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  revenueChartMode === 'donut' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Donut
              </button>
            </div>
          </div>
        </div>

        {/* Visual Chart & Ranked Attribution Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
          {/* Chart Component */}
          <div className="lg:col-span-7 h-72 w-full">
            {revenueChartMode === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeAttributionList} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      const text = payload.value.length > 14 ? `${payload.value.substring(0, 12)}...` : payload.value;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text x={0} y={0} dy={12} textAnchor="middle" fill="#64748b" fontSize={10}>
                            {text}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCur(Number(val)), 'Attributed Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {activeAttributionList.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeAttributionList}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {activeAttributionList.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCur(Number(val)), 'Attributed Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Breakdown Items List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {activeAttributionList.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {item.name}
                    </span>
                    {item.subtitle && (
                      <span className="text-[10px] text-slate-400 block truncate">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-900 block">
                    {formatCur(item.revenue)}
                  </span>
                  <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500">
                    <span className="font-semibold text-blue-600">{item.sharePercent}% share</span>
                    <span>• {item.jobsCount} jobs</span>
                    {item.marginPercent && (
                      <span className="text-emerald-600 font-semibold">• {item.marginPercent}% margin</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10 CHARTS STRATEGIC INTELLIGENCE VISUALIZER                              */}
      {/* Revenue Trend, Work Orders by Status, Engineer Productivity, Top Cust,   */}
      {/* Top Projects, Contract Profitability, Install vs Maint, Response Time,   */}
      {/* SLA Trend, Asset Category Trend                                          */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
                10 Executive Visualizers
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-semibold text-slate-600">Enterprise Service Analytics & Forecasting</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Service Operations & Strategic Telemetry Charts
            </h3>
            <p className="text-xs text-slate-500">
              Interactive analysis of revenue trends, ticket lifecycles, SLA health, project milestones and asset categories.
            </p>
          </div>

          {/* 10 Charts Selector Switchboard */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'revenueTrend', label: 'Revenue Trend' },
              { id: 'status', label: 'Work Orders by Status' },
              { id: 'engineerProductivity', label: 'Engineer Productivity' },
              { id: 'topCustomers', label: 'Top Customers' },
              { id: 'topProjects', label: 'Top Projects' },
              { id: 'contractProfitability', label: 'Contract Profitability' },
              { id: 'installVsMaint', label: 'Installation vs Maintenance' },
              { id: 'responseTime', label: 'Response Time Trend' },
              { id: 'slaTrend', label: 'SLA Trend' },
              { id: 'assetCategory', label: 'Asset Category Trend' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as any)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeChartTab === tab.id
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CHART 1: Revenue Trend */}
        {activeChartTab === 'revenueTrend' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <span>Multi-stream gross revenue progression including AMC recurring, Projects, and Field Services</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Total Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Gross Profit</span>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.revenueTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevExecutive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfitExecutive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.20} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [formatCur(Number(val)), name === 'totalRevenue' ? 'Total Revenue' : 'Gross Profit']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="totalRevenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevExecutive)" name="Total Revenue" />
                  <Area type="monotone" dataKey="grossProfit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfitExecutive)" name="Gross Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Work Orders by Status */}
        {activeChartTab === 'status' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-center">
            <div className="lg:col-span-7 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.workOrdersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {data.charts.workOrdersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Work Orders`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Operational Dispatch Statuses
              </h4>
              {data.charts.workOrdersByStatus.map(st => (
                <div key={st.status} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }} />
                    <span className="text-xs font-bold text-slate-800">{st.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">{st.count} Orders</span>
                    <span className="block text-[10px] text-slate-500 font-semibold">{st.percentage}% of workload</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHART 3: Engineer Productivity */}
        {activeChartTab === 'engineerProductivity' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <span>Completed work orders and field utilization % per certified lead engineer</span>
              <span className="font-semibold text-blue-600">Mean Fleet Utilization: 87.2%</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.engineerProductivity} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any, name: any) => [val, name === 'utilizationPercent' ? 'Utilization %' : 'Completed Jobs']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="completedJobs" fill="#2563eb" name="Completed Work Orders" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="utilizationPercent" fill="#10b981" name="Utilization %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 4: Top Customers */}
        {activeChartTab === 'topCustomers' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <span>Revenue generated per top enterprise client and strategic portfolio account</span>
              <span className="font-semibold text-emerald-600">All Enterprise SLA Compliant</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.topCustomersChart} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                  />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [formatCur(Number(val)), 'Client Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 5: Top Projects */}
        {activeChartTab === 'topProjects' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
            {data.charts.topProjectsChart.map((proj, idx) => (
              <div key={proj.name} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    {proj.status}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{proj.name}</h4>
                  <span className="text-xs text-slate-500 block mt-0.5">{proj.client}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Milestone Progress</span>
                    <span className="text-blue-600">{proj.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${proj.progressPercent}%` }} />
                  </div>
                  <div className="mt-2 text-xs flex justify-between text-slate-500">
                    <span>Value: {formatCur(proj.totalValue)}</span>
                    <span className="text-emerald-600 font-semibold">Billed: {formatCur(proj.billedRevenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHART 6: Contract Profitability */}
        {activeChartTab === 'contractProfitability' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <span>Gross Margin %, Revenue and Direct Delivery Costs across major enterprise contracts</span>
              <span className="font-semibold text-emerald-600">Portfolio Average: 42.6% Gross Margin</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.contractProfitability} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="contract" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [formatCur(Number(val)), name === 'revenue' ? 'Contract Revenue' : name === 'directCost' ? 'Direct Costs' : 'Gross Profit']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="revenue" fill="#2563eb" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="directCost" fill="#94a3b8" name="Direct Costs" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="grossProfit" fill="#10b981" name="Gross Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 7: Installation vs Maintenance */}
        {activeChartTab === 'installVsMaint' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <span>Monthly comparison: Turnkey Hardware Installation vs Recurring Maintenance & AMC</span>
              <span className="font-semibold text-blue-600">Recurring AMC growing at +18.4% ARR</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.installationVsMaintenance} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [formatCur(Number(val)), name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="installationRevenue" stroke="#2563eb" strokeWidth={2.5} name="Installation Revenue" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="amcRevenue" stroke="#f59e0b" strokeWidth={2.5} name="AMC Revenue" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="maintenanceRevenue" stroke="#10b981" strokeWidth={2} name="PPM Maintenance Revenue" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 8: Response Time Trend */}
        {activeChartTab === 'responseTime' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <span>Emergency breakdown response time in minutes vs the 45-minute SLA ceiling</span>
              <span className="font-semibold text-emerald-600">Current Average: 24 Mins (Exceeds SLA)</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.responseTimeTrend} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 60]} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Minutes`, name === 'emergencyMinutes' ? 'Actual Response Time' : 'SLA Target Maximum']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="emergencyMinutes" stroke="#2563eb" strokeWidth={3} name="Actual Response (Mins)" dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="targetMinutes" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} name="SLA Target Ceiling (45 Mins)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 9: SLA Trend */}
        {activeChartTab === 'slaTrend' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <span>Enterprise SLA Compliance % trajectory across 6 months vs the 95.0% baseline</span>
              <span className="font-semibold text-emerald-600">September: 98.6% Compliance (Zero Penalties)</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.slaTrend} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[90, 100]} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val}%`, name === 'compliancePercent' ? 'Actual Compliance' : 'Benchmark Target']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="compliancePercent" stroke="#10b981" strokeWidth={3} name="Actual Compliance %" dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="targetPercent" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} name="Contract Target (95.0%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 10: Asset Category Trend */}
        {activeChartTab === 'assetCategory' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <span>Work order volume, revenue contribution and growth rate across enterprise asset specializations</span>
              <span className="font-semibold text-blue-600">7 Active Technology Sectors</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.assetCategoryTrend} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCur(Number(val)), 'Attributed Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {data.charts.assetCategoryTrend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6 EXECUTIVE INTELLIGENCE TABLES                                           */}
      {/* Top Customers, Top Engineers, Largest Projects, Highest Revenue Contracts, */}
      {/* Open SLA Risks, Upcoming Renewals                                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Tab Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                Executive Data Tables
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-semibold text-slate-600">Audited Operational Records</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Service Operations & Strategic Records
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Table Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                placeholder="Search table records..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
              />
            </div>

            {/* 6 Table Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
              {[
                { id: 'customers', label: 'Top Customers' },
                { id: 'engineers', label: 'Top Engineers' },
                { id: 'projects', label: 'Largest Projects' },
                { id: 'contracts', label: 'Highest Revenue Contracts' },
                { id: 'slaRisks', label: 'Open SLA Risks', badge: data.tables.openSlaRisks.length, badgeColor: 'bg-rose-500 text-white' },
                { id: 'renewals', label: 'Upcoming Renewals', badge: data.tables.upcomingRenewals.length, badgeColor: 'bg-amber-500 text-white' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTableTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    activeTableTab === tab.id
                      ? 'bg-white text-blue-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE 1: Top Customers */}
        {activeTableTab === 'customers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Enterprise Client</th>
                  <th className="px-4 py-3.5">Industry Sector</th>
                  <th className="px-4 py-3.5">Key Contact Person</th>
                  <th className="px-4 py-3.5 text-center">Active Contracts</th>
                  <th className="px-4 py-3.5 text-center">Work Orders</th>
                  <th className="px-4 py-3.5 text-center">SLA Score</th>
                  <th className="px-6 py-3.5 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tables.topCustomers
                  .filter(c => c.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) || c.industry.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                  .map(cust => (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{cust.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium">{cust.status} Account</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                          {cust.industry}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {cust.contactPerson}
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-blue-600">
                        {cust.activeContractsCount} Contracts
                      </td>
                      <td className="px-4 py-4 text-center font-semibold text-slate-800">
                        {cust.completedJobsCount} Orders
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {cust.slaScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">
                        {formatCur(cust.revenue)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 2: Top Engineers */}
        {activeTableTab === 'engineers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Lead Field Engineer</th>
                  <th className="px-4 py-3.5">Specialization & Department</th>
                  <th className="px-4 py-3.5">Hub / Branch</th>
                  <th className="px-4 py-3.5 text-center">Active / Completed</th>
                  <th className="px-4 py-3.5">Utilization %</th>
                  <th className="px-4 py-3.5 text-center">SLA Compliance</th>
                  <th className="px-4 py-3.5 text-center">Customer Rating</th>
                  <th className="px-6 py-3.5 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tables.topEngineers
                  .filter(e => e.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) || e.department.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                  .map(eng => (
                    <tr key={eng.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={eng.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={eng.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{eng.name}</span>
                            <span className="text-xs text-slate-400">{eng.employeeId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-slate-800 text-xs block">{eng.role}</span>
                        <span className="text-[11px] font-semibold text-blue-600">{eng.department}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600 font-medium">
                        {eng.branch}
                      </td>
                      <td className="px-4 py-4 text-center font-semibold text-slate-800">
                        {eng.activeJobs} Active / {eng.completedJobs} Closed
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${eng.utilizationPercent}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-800">{eng.utilizationPercent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                          {eng.slaCompliancePercent}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-amber-600">
                        ★ {eng.customerRating}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">
                        {formatCur(eng.revenueGenerated)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 3: Largest Projects */}
        {activeTableTab === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Project Code & Title</th>
                  <th className="px-4 py-3.5">Enterprise Client</th>
                  <th className="px-4 py-3.5">Lead Engineer</th>
                  <th className="px-4 py-3.5">Milestone Progress</th>
                  <th className="px-4 py-3.5">Target Delivery Date</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Total Budget & Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tables.largestProjects
                  .filter(p => p.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) || p.client.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                  .map(proj => (
                    <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">{proj.name}</span>
                        <span className="text-xs text-slate-400">{proj.projectCode} • {proj.department}</span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-800 text-xs">
                        {proj.client}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {proj.leadEngineer}
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-32">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>Progress</span>
                            <span className="text-blue-600">{proj.completionPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${proj.completionPercent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {proj.targetDate}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {proj.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-slate-900 block">{formatCur(proj.totalBudget)}</span>
                        <span className="text-xs text-emerald-600 font-semibold">Billed: {formatCur(proj.billedRevenue)}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 4: Highest Revenue Contracts */}
        {activeTableTab === 'contracts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Contract ID & Title</th>
                  <th className="px-4 py-3.5">Client & Type</th>
                  <th className="px-4 py-3.5">Service SLA Tier</th>
                  <th className="px-4 py-3.5">Validity Period</th>
                  <th className="px-4 py-3.5 text-center">Gross Margin %</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Annual Contract Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tables.highestRevenueContracts
                  .filter(c => c.title.toLowerCase().includes(tableSearchQuery.toLowerCase()) || c.client.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                  .map(con => (
                    <tr key={con.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">{con.title}</span>
                        <span className="text-xs text-slate-400 font-mono">{con.contractNumber}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-slate-800 block">{con.client}</span>
                        <span className="text-[11px] text-blue-600 font-semibold">{con.contractType}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {con.slaTier}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {con.startDate} to {con.endDate}
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-emerald-600">
                        {con.grossMarginPercent}%
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {con.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">
                        {formatCur(con.annualValue)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 5: Open SLA Risks */}
        {activeTableTab === 'slaRisks' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Work Order & Risk Level</th>
                  <th className="px-4 py-3.5">Enterprise Client</th>
                  <th className="px-4 py-3.5">Lead Engineer & Branch</th>
                  <th className="px-4 py-3.5">Elapsed / Remaining Window</th>
                  <th className="px-4 py-3.5">Mitigation Action Enforced</th>
                  <th className="px-6 py-3.5 text-center">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tables.openSlaRisks.map(risk => (
                  <tr key={risk.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            risk.riskLevel === 'Immediate Breach'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : risk.riskLevel === 'At Risk'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {risk.riskLevel}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">{risk.workOrderNumber}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800 block mt-1">{risk.title}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-slate-900 block">{risk.customer}</span>
                      <span className="text-[11px] text-slate-400">{risk.serviceType}</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-700">
                      <span className="font-semibold block">{risk.leadEngineer}</span>
                      <span className="text-slate-400">{risk.branch}</span>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <span className="font-bold text-rose-600 block">{risk.timeRemaining}</span>
                      <span className="text-slate-400">Elapsed: {risk.elapsedTime} ({risk.slaWindow})</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600 max-w-xs">
                      {risk.mitigationAction}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                        {risk.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 6: Upcoming Renewals */}
        {activeTableTab === 'renewals' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Contract Number & Client</th>
                  <th className="px-4 py-3.5">Contract Scope</th>
                  <th className="px-4 py-3.5">Expiry Date & Window</th>
                  <th className="px-4 py-3.5 text-center">Retention Probability</th>
                  <th className="px-4 py-3.5">Assigned Account Lead</th>
                  <th className="px-4 py-3.5 text-center">Renewal Status</th>
                  <th className="px-6 py-3.5 text-right">Renewal Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tables.upcomingRenewals.map(ren => (
                  <tr key={ren.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">{ren.client}</span>
                      <span className="text-xs text-slate-400 font-mono">{ren.contractNumber} • {ren.contractType}</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {ren.serviceScope}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <span className="font-bold text-amber-700 block">{ren.daysRemaining} days remaining</span>
                      <span className="text-slate-400">Expires: {ren.expiryDate}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ren.retentionProbability}% Probability
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-700 font-medium">
                      {ren.assignedAccountLead}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {ren.renewalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">
                      {formatCur(ren.renewalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* EXPORT EXECUTIVE REPORT PDF / PRINT MODAL                                 */}
      {/* ========================================================================= */}
      {isExportPdfOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Executive Service Intelligence Briefing
                  </h3>
                  <p className="text-xs text-slate-500">
                    CamneX Bangladesh Enterprise Operations Executive Summary
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportPdfOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700" id="executive-print-area">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 text-base">
                  <span>CamneX Bangladesh Limited</span>
                  <span className="text-rose-600 uppercase text-xs">Executive Confidential</span>
                </div>
                <div className="text-xs text-slate-500">
                  Document ID: CNX-BI-2026-SEP | Date: {new Date().toLocaleDateString()} | Prepared for Executive Board
                </div>
              </div>

              {/* 14 KPIs Executive Matrix */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Top 14 Executive KPIs Matrix
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Revenue</span>
                    <span className="font-black text-slate-900 text-sm">{formatCur(data.topKpis.serviceRevenue.value)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Gross Profit</span>
                    <span className="font-black text-emerald-600 text-sm">{formatCur(data.topKpis.grossProfit.value)} ({data.topKpis.grossProfit.marginPercent}%)</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">AMC Revenue</span>
                    <span className="font-black text-amber-600 text-sm">{formatCur(data.topKpis.amcRevenue.value)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Projects Revenue</span>
                    <span className="font-black text-indigo-600 text-sm">{formatCur(data.topKpis.projectsRevenue.value)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergency Jobs</span>
                    <span className="font-black text-rose-600 text-sm">{data.topKpis.emergencyJobs.count} Calls</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Installations</span>
                    <span className="font-black text-blue-600 text-sm">{data.topKpis.installations.count} Deployments</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Maintenance Visits</span>
                    <span className="font-black text-slate-900 text-sm">{data.topKpis.maintenanceVisits.count} Audits</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Satisfaction</span>
                    <span className="font-black text-amber-500 text-sm">★ {data.topKpis.customerSatisfaction.score} / 5.0</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">SLA Compliance</span>
                    <span className="font-black text-emerald-600 text-sm">{data.topKpis.slaCompliance.percent}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Engineer Utilization</span>
                    <span className="font-black text-blue-600 text-sm">{data.topKpis.engineerUtilization.percent}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Response Time</span>
                    <span className="font-black text-slate-900 text-sm">{data.topKpis.averageResponseTime.minutes} Mins</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Resolution Time</span>
                    <span className="font-black text-purple-600 text-sm">{data.topKpis.averageResolutionTime.hours} Hours</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">First Visit Resolution</span>
                    <span className="font-black text-emerald-600 text-sm">{data.topKpis.firstVisitResolution.percent}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Repeat Visits</span>
                    <span className="font-black text-slate-800 text-sm">{data.topKpis.repeatVisits.percent}%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900">
                <strong>Executive Takeaway:</strong> Field service performance exceeds all SLA compliance benchmarks with 98.4% uptime and 40.4% operating margin. AMC retention remains stable at 94.8% across 128 multi-site enterprise contracts.
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setIsExportPdfOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-all shadow-blue-200"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCHEDULE REPORT MODAL                                                     */}
      {/* ========================================================================= */}
      {isScheduleReportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-white rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Schedule Automated Executive Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set recurring automated delivery to board members & executives
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleReportOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Frequency
                </label>
                <select
                  value={scheduleForm.frequency}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="daily_morning">Daily Morning Digest (08:00 AM)</option>
                  <option value="weekly_monday">Weekly on Mondays (07:30 AM)</option>
                  <option value="monthly_first">Monthly on the 1st Calendar Day</option>
                  <option value="quarterly_board">Quarterly Board Meeting Briefing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive Recipient Emails
                </label>
                <input
                  type="text"
                  value={scheduleForm.recipients}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, recipients: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ceo@camnex.com.bd, coo@camnex.com.bd"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Export Document Format
                </label>
                <select
                  value={scheduleForm.format}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pdf_excel">Both PDF Summary & Excel Data Sheet (.xlsx/.csv)</option>
                  <option value="pdf_only">Executive PDF Document Only</option>
                  <option value="excel_only">Excel Telemetry Spreadsheet Only</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={scheduleForm.includeKpis}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, includeKpis: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Include all 14 Top Executive Service KPIs Matrix
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={scheduleForm.includeRisks}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, includeRisks: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Include Open SLA Risks & Upcoming Renewals Roster
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setIsScheduleReportOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsScheduleReportOpen(false);
                  showNotification(`Automated schedule confirmed: Reports will be dispatched ${scheduleForm.frequency.replace('_', ' ')}.`);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                <Calendar className="w-4 h-4" />
                Activate Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EMAIL REPORT MODAL                                                        */}
      {/* ========================================================================= */}
      {isEmailReportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Email Executive Service Intelligence Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instant electronic delivery to stakeholders and leadership
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailReportOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Email Addresses (comma-separated)
                </label>
                <input
                  type="text"
                  value={emailForm.recipient}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive Cover Note
                </label>
                <textarea
                  rows={3}
                  value={emailForm.notes}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Attachments Included:</span>
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-blue-600" /> CamneX_Intelligence_Report.pdf</span>
                  <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-emerald-600" /> CamneX_Executive_Data.csv</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setIsEmailReportOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEmailReportOpen(false);
                  showNotification(`Executive report dispatched to ${emailForm.recipient}.`);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all shadow-blue-200"
              >
                <Send className="w-4 h-4" />
                Send Report Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
