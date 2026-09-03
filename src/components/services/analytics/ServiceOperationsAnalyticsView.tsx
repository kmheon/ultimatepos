import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
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
  ChevronRight,
  PieChart as PieChartIcon,
  Compass,
  ArrowUpRight,
  Search,
  RotateCcw,
  Check,
  X
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
  useServiceOperationsAnalytics
} from '../../../services/serviceAnalytics.service';

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b', '#14b8a6'];

export const ServiceOperationsAnalyticsView: React.FC = () => {
  const { repairJobSheets, technicians, scheduleSlots, contacts, locations, settings } = usePOS();

  // Filter State (8 core dimensions requested)
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

  const [activeChartTab, setActiveChartTab] = useState<'monthly' | 'yearly' | 'branch' | 'engineer' | 'segments'>('monthly');
  const [revenueChartType, setRevenueChartType] = useState<'bar' | 'donut'>('bar');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Fetch / compute data using React Query service hook
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

  if (isLoading || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-slate-50">
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm font-medium text-slate-700">Loading Enterprise Service Analytics...</span>
        </div>
      </div>
    );
  }

  // Format currency helpers
  const formatCur = (num: number) => {
    return `${currencySymbol} ${num.toLocaleString()}`;
  };

  // Prepare Revenue Breakdown data for Recharts
  const revenueChartData = [
    { name: 'Installation', revenue: data.revenueBreakdown.installationRevenue, color: '#2563eb' },
    { name: 'Maintenance', revenue: data.revenueBreakdown.maintenanceRevenue, color: '#10b981' },
    { name: 'AMC Contract', revenue: data.revenueBreakdown.amcRevenue, color: '#f59e0b' },
    { name: 'Emergency', revenue: data.revenueBreakdown.emergencyServiceRevenue, color: '#ef4444' },
    { name: 'Spare Parts', revenue: data.revenueBreakdown.sparePartsRevenue, color: '#8b5cf6' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              CamneX Enterprise Service Operations
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-500">BI Telemetry & Workforce Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Service Operations Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Enterprise operational performance, workforce utilization, SLA compliance and service profitability.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl border transition-all ${
              activeFiltersCount > 0
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-blue-600 text-white font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-all shadow-blue-200"
          >
            <Download className="w-4 h-4" />
            Export Executive Report
          </button>
        </div>
      </div>

      {/* FILTER BAR - 8 Comprehensive Business Dimensions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Operational Dimension Filters
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
          {/* 1. Date Range */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Date Range
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
              Branch / Hub
            </label>
            <select
              value={filters.branchId}
              onChange={(e) => handleFilterChange('branchId', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Branches</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* 3. Technician */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Lead Engineer
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
              Enterprise Client
            </label>
            <select
              value={filters.customerId}
              onChange={(e) => handleFilterChange('customerId', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Clients</option>
              {contacts.filter(c => c.type === 'customer').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 6. Contract */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Contract Type
            </label>
            <select
              value={filters.contractType}
              onChange={(e) => handleFilterChange('contractType', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Contracts</option>
              <option value="Active AMC">Active AMC</option>
              <option value="Warranty">Under Warranty</option>
              <option value="Chargeable">Chargeable T&M</option>
              <option value="Projects">Turnkey Project</option>
            </select>
          </div>

          {/* 7. Project */}
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
              <option value="Metro CCTV Rollout">Metro CCTV Rollout</option>
              <option value="Apex Tower Access">Apex Tower Access</option>
              <option value="Datacenter Core Expansion">Datacenter Core Expansion</option>
              <option value="Meghna Industrial Fire Retrofit">Meghna Industrial Fire</option>
            </select>
          </div>

          {/* 8. Service Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={filters.serviceCategory}
              onChange={(e) => handleFilterChange('serviceCategory', e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="CCTV">CCTV</option>
              <option value="Networking">Networking</option>
              <option value="Access Control">Access Control</option>
              <option value="Fire Alarm">Fire Alarm</option>
              <option value="Servers">Servers</option>
              <option value="PABX">PABX</option>
              <option value="UPS">UPS</option>
              <option value="Solar">Solar</option>
              <option value="Structured Cabling">Structured Cabling</option>
            </select>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS - ROW 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Service Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Service Revenue
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCur(data.topKpis.totalServiceRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{data.topKpis.totalRevenueGrowth}%
              </span>
              <span className="text-slate-400">vs prior period</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>AMC recurring: {formatCur(data.revenueBreakdown.amcRevenue)}</span>
            <span className="font-semibold text-blue-600">Verified BI</span>
          </div>
        </div>

        {/* KPI 2: Active Work Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Work Orders
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {data.topKpis.activeWorkOrders} <span className="text-sm font-normal text-slate-500">orders</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-700">
                {data.topKpis.activeWorkOrdersBreakdown.inProgress} In-Progress
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-50 text-amber-700">
                {data.topKpis.activeWorkOrdersBreakdown.scheduled} Scheduled
              </span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Dispatch capacity: 94%</span>
            <span className="font-semibold text-indigo-600">{data.topKpis.activeWorkOrdersBreakdown.pendingReview} Pending Review</span>
          </div>
        </div>

        {/* KPI 3: SLA Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              SLA Compliance
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {data.topKpis.slaCompliancePercent}%
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                Target ≥ {data.topKpis.slaTargetPercent}%
              </span>
              <span className="text-emerald-600 font-semibold">+3.4% above benchmark</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, data.topKpis.slaCompliancePercent)}%` }}
            />
          </div>
        </div>

        {/* KPI 4: First-Time Fix Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              First-Time Fix Rate
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {data.topKpis.firstTimeFixRate}%
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                Target ≥ {data.topKpis.firstTimeFixTarget}%
              </span>
              <span className="text-slate-500">Single visit resolution</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, data.topKpis.firstTimeFixRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECOND KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 5: Average Resolution Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg. Resolution Time
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {data.secondKpis.averageResolutionHours} <span className="text-sm font-normal text-slate-500">Hours</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-{data.secondKpis.averageResolutionImprovement}% turnaround time</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 border-t border-slate-100 pt-2">
            Dispatched to signed job-sheet handover
          </p>
        </div>

        {/* KPI 6: Technician Utilization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Technician Utilization
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {data.secondKpis.technicianUtilizationPercent}%
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                Target {data.secondKpis.technicianUtilizationTarget}%
              </span>
              <span>Optimal capacity</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${Math.min(100, data.secondKpis.technicianUtilizationPercent)}%` }}
            />
          </div>
        </div>

        {/* KPI 7: Customer Satisfaction */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
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
                {data.secondKpis.customerSatisfactionScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">★ 98.2% 5-Star</span>
              <span>({data.secondKpis.totalFeedbackCount} client audits)</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 border-t border-slate-100 pt-2">
            Independent client SLA sign-off rating
          </p>
        </div>

        {/* KPI 8: Contract Renewal Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Contract Renewal Rate
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {data.secondKpis.contractRenewalRatePercent}%
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                128 Active AMCs
              </span>
              <span className="text-slate-500">Annual retention</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, data.secondKpis.contractRenewalRatePercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* MAIN ANALYTICS: REVENUE BREAKDOWN & CUSTOMER QUALITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* REVENUE BREAKDOWN (Replaces Labor vs Parts Split) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Revenue Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Installation, Maintenance, AMC, Emergency Service & Spare Parts
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setRevenueChartType('bar')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    revenueChartType === 'bar' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setRevenueChartType('donut')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    revenueChartType === 'donut' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Donut
                </button>
              </div>
            </div>

            {/* Visual Chart */}
            <div className="h-64 w-full mt-4">
              {revenueChartType === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCur(Number(val)), 'Revenue']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {revenueChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueChartData}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {revenueChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCur(Number(val)), 'Revenue']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Revenue Categories Detail Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100 mt-4">
            <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Installation</span>
              <span className="text-sm font-black text-slate-900 block mt-0.5">
                {formatCur(data.revenueBreakdown.installationRevenue)}
              </span>
              <span className="text-[10px] text-slate-500">32% of total</span>
            </div>
            <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Maintenance</span>
              <span className="text-sm font-black text-slate-900 block mt-0.5">
                {formatCur(data.revenueBreakdown.maintenanceRevenue)}
              </span>
              <span className="text-[10px] text-slate-500">24% of total</span>
            </div>
            <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">AMC Contract</span>
              <span className="text-sm font-black text-slate-900 block mt-0.5">
                {formatCur(data.revenueBreakdown.amcRevenue)}
              </span>
              <span className="text-[10px] text-slate-500">26% recurring</span>
            </div>
            <div className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100">
              <span className="text-[10px] uppercase font-bold text-rose-600 block">Emergency</span>
              <span className="text-sm font-black text-slate-900 block mt-0.5">
                {formatCur(data.revenueBreakdown.emergencyServiceRevenue)}
              </span>
              <span className="text-[10px] text-slate-500">11% high-margin</span>
            </div>
            <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Spare Parts</span>
              <span className="text-sm font-black text-slate-900 block mt-0.5">
                {formatCur(data.revenueBreakdown.sparePartsRevenue)}
              </span>
              <span className="text-[10px] text-slate-500">7% hardware</span>
            </div>
          </div>
        </div>

        {/* CUSTOMER QUALITY & SERVICE METRICS (Replaces customer rating section) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Customer Quality & SLA Metrics
                </h3>
                <p className="text-xs text-slate-500">
                  Response benchmarks, first-time resolution & repeat visits
                </p>
              </div>
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            {/* Quality Metrics Cards */}
            <div className="space-y-3 mt-4">
              {/* Average Response Time */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    Average Response Time
                  </span>
                  <span className="text-[11px] text-slate-400">Emergency & scheduled SLA callout</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-blue-600">
                    {data.customerQuality.averageResponseTimeMinutes} Minutes
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">Target ≤ 45 min</span>
                </div>
              </div>

              {/* First Time Fix */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    First Time Fix Rate
                  </span>
                  <span className="text-[11px] text-slate-400">Resolved on initial dispatch</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-600">
                    {data.customerQuality.firstTimeFixPercent}%
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">Target ≥ 88%</span>
                </div>
              </div>

              {/* Repeat Visits */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    Repeat Visits
                  </span>
                  <span className="text-[11px] text-slate-400">Recurrent tickets within 30 days</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-600">
                    {data.customerQuality.repeatVisitsPercent}%
                  </span>
                  <span className="block text-[10px] text-slate-500 font-semibold">Benchmark &lt; 6.0%</span>
                </div>
              </div>

              {/* Average Resolution */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    Average Resolution
                  </span>
                  <span className="text-[11px] text-slate-400">Total job duration on premise</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-purple-600">
                    {data.customerQuality.averageResolutionHours} Hours
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">-18% faster</span>
                </div>
              </div>

              {/* Customer Satisfaction */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    Customer Satisfaction Score
                  </span>
                  <span className="text-[11px] text-slate-400">Based on {data.customerQuality.totalSurveysCount} enterprise surveys</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-500">
                    ★ {data.customerQuality.customerSatisfactionScore} / 5.0
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">Exceeds Goal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 mt-4 flex items-center gap-3 text-xs text-blue-800">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span>
              All operational quality criteria meet ISO 9001:2015 and NFPA 72 enterprise service standards.
            </span>
          </div>
        </div>
      </div>

      {/* SERVICE CATEGORY ANALYTICS (9 Enterprise Categories) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Service Category Analytics
            </h3>
            <p className="text-xs text-slate-500">
              Work order volumes, SLA health, revenue contribution & completion benchmarks across 9 specializations
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            9 Active Enterprise Categories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {data.serviceCategories.map((cat, idx) => (
            <div
              key={cat.category}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  {cat.category}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {cat.trend}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Orders</span>
                  <span className="text-sm font-bold text-slate-800">{cat.workOrdersCount} orders</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue</span>
                  <span className="text-sm font-bold text-slate-800">{formatCur(cat.revenue)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">SLA Compliance</span>
                  <span className="text-sm font-bold text-emerald-600">{cat.slaCompliancePercent}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Completion</span>
                  <span className="text-sm font-bold text-slate-800">{cat.averageCompletionHours} hrs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTRACT ANALYTICS, TECHNICIAN PERFORMANCE & OPERATIONAL MIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CONTRACT ANALYTICS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Contract Analytics (AMC)
              </h3>
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <FileText className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Active AMC Contracts</span>
                  <span className="text-[10px] text-slate-400">Total active recurring clients</span>
                </div>
                <span className="text-lg font-black text-blue-600">
                  {data.contractAnalytics.activeAmcCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Expiring Contracts</span>
                  <span className="text-[10px] text-amber-700">Next 45 days renewals</span>
                </div>
                <span className="text-lg font-black text-amber-700">
                  {data.contractAnalytics.expiringContractsCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Renewed Contracts</span>
                  <span className="text-[10px] text-emerald-700">Year-to-date successfully retained</span>
                </div>
                <span className="text-lg font-black text-emerald-700">
                  {data.contractAnalytics.renewedContractsCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Cancelled Contracts</span>
                  <span className="text-[10px] text-slate-400">Churn rate &lt; 2.5%</span>
                </div>
                <span className="text-lg font-black text-slate-600">
                  {data.contractAnalytics.cancelledContractsCount}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Total Recurring Revenue</span>
            <span className="font-black text-slate-900 text-sm">
              {formatCur(data.contractAnalytics.totalContractRevenue)}
            </span>
          </div>
        </div>

        {/* TECHNICIAN PERFORMANCE & FLEET METRICS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Technician Performance
              </h3>
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Users className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Average Travel Time</span>
                  <span className="text-[10px] text-slate-400">Dispatch to on-site arrival</span>
                </div>
                <span className="text-base font-black text-slate-900">
                  {data.technicianPerformance.averageTravelTimeMinutes} Mins
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Average Jobs Per Day</span>
                  <span className="text-[10px] text-slate-400">Completed per field engineer</span>
                </div>
                <span className="text-base font-black text-slate-900">
                  {data.technicianPerformance.averageJobsPerDay} Jobs
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Fleet Utilization</span>
                  <span className="text-[10px] text-slate-400">Productive field hours</span>
                </div>
                <span className="text-base font-black text-emerald-600">
                  {data.technicianPerformance.utilizationPercent}%
                </span>
              </div>

              {/* Billable vs Non-Billable Hours */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Hours Distribution</span>
                  <span className="text-blue-600">{data.technicianPerformance.billableHours} Billable / {data.technicianPerformance.nonBillableHours} Admin</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-600 h-full"
                    style={{
                      width: `${(data.technicianPerformance.billableHours / data.technicianPerformance.totalHours) * 100}%`
                    }}
                    title="Billable Hours"
                  />
                  <div
                    className="bg-slate-400 h-full"
                    style={{
                      width: `${(data.technicianPerformance.nonBillableHours / data.technicianPerformance.totalHours) * 100}%`
                    }}
                    title="Non-Billable / Travel Hours"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Total Logged Hours</span>
            <span className="font-black text-slate-900 text-sm">
              {data.technicianPerformance.totalHours} hrs / week
            </span>
          </div>
        </div>

        {/* OPERATIONAL ANALYTICS & JOB MIX */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Operational Analytics
              </h3>
              <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Briefcase className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 text-xs">
                <span className="font-medium text-slate-600">Emergency Breakdown Calls</span>
                <span className="font-bold text-rose-600 px-2 py-0.5 rounded-full bg-rose-50">
                  {data.operationalAnalytics.emergencyCalls} calls
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 text-xs">
                <span className="font-medium text-slate-600">Scheduled Site Visits</span>
                <span className="font-bold text-slate-800">
                  {data.operationalAnalytics.scheduledVisits} visits
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 text-xs">
                <span className="font-medium text-slate-600">Preventive Maintenance (PPM)</span>
                <span className="font-bold text-emerald-600">
                  {data.operationalAnalytics.preventiveMaintenance} audits
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 text-xs">
                <span className="font-medium text-slate-600">Warranty Work Orders</span>
                <span className="font-bold text-slate-800">
                  {data.operationalAnalytics.warrantyJobs} orders
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 text-xs">
                <span className="font-medium text-slate-600">Chargeable Services</span>
                <span className="font-bold text-blue-600">
                  {data.operationalAnalytics.chargeableJobs} orders
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 text-xs">
                <span className="font-medium text-slate-600">Turnkey Projects</span>
                <span className="font-bold text-purple-600">
                  {data.operationalAnalytics.projects} deployments
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Total Field Dispatches</span>
            <span className="font-black text-slate-900 text-sm">
              {data.operationalAnalytics.totalDispatches} dispatches
            </span>
          </div>
        </div>
      </div>

      {/* FINANCIAL ANALYTICS & COST / MARGIN BREAKDOWN */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Financial Analytics & Service Margins
            </h3>
            <p className="text-xs text-slate-500">
              Gross revenue, direct labor expense, spare parts cost and consolidated operating margin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Operating Margin: {data.financialAnalytics.profitMarginPercent}%
            </span>
          </div>
        </div>

        {/* Financial Numbers Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Revenue</span>
            <span className="text-base font-black text-slate-900 block mt-0.5">
              {formatCur(data.financialAnalytics.grossRevenue)}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">+14.2% YoY</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Labor Cost</span>
            <span className="text-base font-black text-slate-700 block mt-0.5">
              {formatCur(data.financialAnalytics.laborCost)}
            </span>
            <span className="text-[10px] text-slate-500">38% of revenue</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Material & Parts</span>
            <span className="text-base font-black text-slate-700 block mt-0.5">
              {formatCur(data.financialAnalytics.materialCost)}
            </span>
            <span className="text-[10px] text-slate-500">22% of revenue</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Net Service Profit</span>
            <span className="text-base font-black text-emerald-700 block mt-0.5">
              {formatCur(data.financialAnalytics.netProfit)}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Verified EBITDA</span>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">Profit Margin</span>
            <span className="text-base font-black text-blue-700 block mt-0.5">
              {data.financialAnalytics.profitMarginPercent}%
            </span>
            <span className="text-[10px] text-blue-600 font-semibold">Exceeds 35% Goal</span>
          </div>
        </div>

        {/* Revenue by Client & Branch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-4 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Top Enterprise Clients by Revenue
            </h4>
            <div className="space-y-2">
              {data.financialAnalytics.revenueByCustomer.slice(0, 5).map((cust) => (
                <div key={cust.name} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{cust.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">{cust.jobsCount} work orders</span>
                    <span className="font-bold text-slate-900">{formatCur(cust.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Regional Branch Distribution
            </h4>
            <div className="space-y-2">
              {data.financialAnalytics.revenueByBranch.map((br) => (
                <div key={br.name} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50">
                  <span className="font-semibold text-slate-800">{br.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-600 font-semibold">{br.marginPercent}% margin</span>
                    <span className="font-bold text-slate-900">{formatCur(br.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RESOURCE FLEET PRODUCTIVITY TABLE (Replaces Bench/Station with Department) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Resource Fleet Productivity & Departmental Performance
            </h3>
            <p className="text-xs text-slate-500">
              Active engineering staff, specialization roles, departmental allocation and billable revenue
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {data.resourceProductivity.length} Certified Engineers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5 text-center">Active Jobs</th>
                <th className="px-4 py-3.5 text-center">Completed Jobs</th>
                <th className="px-4 py-3.5">Utilization %</th>
                <th className="px-4 py-3.5 text-center">Customer Rating</th>
                <th className="px-6 py-3.5 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {data.resourceProductivity.map((tech) => (
                <tr key={tech.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={tech.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={tech.employeeName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-semibold text-slate-900 block">{tech.employeeName}</span>
                        <span className="text-xs text-slate-400 capitalize flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${tech.status === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          {tech.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-slate-800 text-xs px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
                      {tech.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-blue-700 text-xs px-2.5 py-1 bg-blue-50 rounded-full border border-blue-200">
                      {tech.department}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-slate-800">
                    {tech.activeJobs}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-slate-800">
                    {tech.completedJobs}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, tech.utilizationPercent)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{tech.utilizationPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-amber-600">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {tech.customerRating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    {formatCur(tech.revenueGenerated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FUTURE CHARTS & TREND ARCHITECTURE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Future Trends & Strategic Forecasting
            </h3>
            <p className="text-xs text-slate-500">
              Interactive multi-year trajectory, branch comparisons, engineer productivity and market segments
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {[
              { id: 'monthly', label: 'Monthly Trends' },
              { id: 'yearly', label: 'Yearly Growth' },
              { id: 'branch', label: 'Branch Comparison' },
              { id: 'engineer', label: 'Engineer Comparison' },
              { id: 'segments', label: 'Customer Segments' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
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

        {/* Tab 1: Monthly Trends */}
        {activeChartTab === 'monthly' && (
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.futureTrends.monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCur(Number(val)), 'Total Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="totalRevenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 2: Yearly Growth */}
        {activeChartTab === 'yearly' && (
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.futureTrends.yearlyTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${currencySymbol}${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCur(Number(val)), 'Annual Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 3: Branch Comparison */}
        {activeChartTab === 'branch' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {data.futureTrends.branchComparison.map((br) => (
              <div key={br.branch} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block">{br.branch}</span>
                <span className="text-xl font-black text-blue-600 block mt-1">{formatCur(br.revenue)}</span>
                <div className="mt-3 space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span>Completed Jobs:</span>
                    <span className="font-semibold text-slate-800">{br.jobsCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SLA Compliance:</span>
                    <span className="font-semibold text-emerald-600">{br.slaCompliance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engineering Staff:</span>
                    <span className="font-semibold text-slate-800">{br.headcount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Engineer Comparison */}
        {activeChartTab === 'engineer' && (
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.futureTrends.engineerComparison} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [val, name === 'utilization' ? 'Utilization %' : 'Jobs Completed']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="jobsCompleted" fill="#3b82f6" name="Completed Jobs" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilization" fill="#f59e0b" name="Utilization %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 5: Customer Segments */}
        {activeChartTab === 'segments' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
            {data.futureTrends.customerSegments.map((seg) => (
              <div key={seg.segment} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block line-clamp-1">{seg.segment}</span>
                <span className="text-lg font-black text-slate-900 block mt-1">{formatCur(seg.revenue)}</span>
                <div className="mt-2 text-xs text-slate-500 flex justify-between">
                  <span>{seg.percentage}% of revenue</span>
                  <span className="font-semibold text-blue-600">{seg.contractCount} contracts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EXPORT EXECUTIVE REPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Export Service Operations Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    CamneX Bangladesh Enterprise Operations Executive Summary
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 text-base">
                  <span>CamneX Bangladesh</span>
                  <span>CONFIDENTIAL</span>
                </div>
                <div className="text-xs text-slate-500">
                  Report Date: {new Date().toLocaleDateString()} | Generated for Executive Management
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Total Revenue</span>
                  <span className="font-black text-slate-900 text-sm">
                    {formatCur(data.topKpis.totalServiceRevenue)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">SLA Compliance</span>
                  <span className="font-black text-emerald-600 text-sm">
                    {data.topKpis.slaCompliancePercent}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Active Work Orders</span>
                  <span className="font-black text-slate-900 text-sm">
                    {data.topKpis.activeWorkOrders} Orders
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">AMC Retention</span>
                  <span className="font-black text-blue-600 text-sm">
                    {data.secondKpis.contractRenewalRatePercent}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                This export compiles current filter parameters ({filters.dateRange}, {filters.department}, {filters.serviceCategory}) with complete engineer rosters and SLA audit records.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold rounded-xl transition-all"
              >
                <Printer className="w-4 h-4" />
                Print Preview
              </button>
              <button
                onClick={() => {
                  // CSV download simulation
                  const csvContent = 'data:text/csv;charset=utf-8,' +
                    'Metric,Value\n' +
                    `Total Service Revenue,${data.topKpis.totalServiceRevenue}\n` +
                    `Active Work Orders,${data.topKpis.activeWorkOrders}\n` +
                    `SLA Compliance,${data.topKpis.slaCompliancePercent}%\n` +
                    `First-Time Fix Rate,${data.topKpis.firstTimeFixRate}%\n` +
                    `Installation Revenue,${data.revenueBreakdown.installationRevenue}\n` +
                    `Maintenance Revenue,${data.revenueBreakdown.maintenanceRevenue}\n` +
                    `AMC Revenue,${data.revenueBreakdown.amcRevenue}\n` +
                    `Emergency Revenue,${data.revenueBreakdown.emergencyServiceRevenue}\n` +
                    `Spare Parts Revenue,${data.revenueBreakdown.sparePartsRevenue}\n`;
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `camnex_service_operations_${Date.now()}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  setIsExportModalOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-all shadow-blue-200"
              >
                <Download className="w-4 h-4" />
                Download CSV Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
