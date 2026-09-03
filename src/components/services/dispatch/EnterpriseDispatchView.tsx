import React, { useState, useMemo } from 'react';
import {
  Clock,
  MapPin,
  Truck,
  ShieldCheck,
  Shield,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Navigation,
  FileCheck,
  UserCheck,
  CheckCircle2,
  Play,
  Pause,
  AlertTriangle,
  Building2,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  SlidersHorizontal,
  X,
  Radio,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { ServiceScheduleSlot, ServiceTechnician, EnterpriseServiceType, DispatchStatusType } from '../../../types';
import { RouteTelemetryModal } from './RouteTelemetryModal';
import { ServiceReportModal } from './ServiceReportModal';
import { ReassignDispatchModal } from './ReassignDispatchModal';
import { CompleteVisitModal } from './CompleteVisitModal';

interface EnterpriseDispatchViewProps {
  scheduleSlots: ServiceScheduleSlot[];
  technicians: ServiceTechnician[];
  onAddSchedule: () => void;
  onUpdateSlot: (id: string, updates: Partial<ServiceScheduleSlot>) => void;
  onDeleteSlot: (id: string) => void;
}

export const EnterpriseDispatchView: React.FC<EnterpriseDispatchViewProps> = ({
  scheduleSlots,
  technicians,
  onAddSchedule,
  onUpdateSlot,
  onDeleteSlot,
}) => {
  // Feedback toast
  const [feedback, setFeedback] = useState<string | null>(null);

  // Active Modals
  const [telemetrySlot, setTelemetrySlot] = useState<ServiceScheduleSlot | null>(null);
  const [reportSlot, setReportSlot] = useState<ServiceScheduleSlot | null>(null);
  const [reassignSlot, setReassignSlot] = useState<ServiceScheduleSlot | null>(null);
  const [completeSlot, setCompleteSlot] = useState<ServiceScheduleSlot | null>(null);

  // View Mode: 'cards' | 'board' | 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'board' | 'table'>('cards');

  // Copied WO state
  const [copiedWo, setCopiedWo] = useState<string | null>(null);

  // Filters State
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterEngineer, setFilterEngineer] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [filterServiceType, setFilterServiceType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const showToast = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWo(text);
    setTimeout(() => setCopiedWo(null), 2000);
  };

  // Distinct Filter Options
  const distinctBranches = useMemo(() => {
    const set = new Set<string>();
    scheduleSlots.forEach(s => {
      if (s.branch) set.add(s.branch);
    });
    return Array.from(set);
  }, [scheduleSlots]);

  const distinctEngineers = useMemo(() => {
    const map = new Map<string, string>();
    scheduleSlots.forEach(s => {
      if (s.technicianId && s.technicianName) {
        map.set(s.technicianId, s.technicianName);
      }
    });
    return Array.from(map.entries());
  }, [scheduleSlots]);

  const distinctDepartments = useMemo(() => {
    const set = new Set<string>();
    scheduleSlots.forEach(s => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set);
  }, [scheduleSlots]);

  const distinctVehicles = useMemo(() => {
    const set = new Set<string>();
    scheduleSlots.forEach(s => {
      if (s.vehicle) set.add(s.vehicle);
    });
    return Array.from(set);
  }, [scheduleSlots]);

  const allServiceTypes: EnterpriseServiceType[] = [
    'Installation',
    'Preventive Maintenance',
    'AMC Visit',
    'Emergency Breakdown',
    'Inspection',
    'Site Survey',
    'Commissioning',
    'Network Deployment',
    'Customer Training',
    'Warranty Visit',
  ];

  // Filtering Logic
  const filteredSlots = useMemo(() => {
    return scheduleSlots.filter(slot => {
      // Search
      if (filterSearch) {
        const query = filterSearch.toLowerCase();
        const matchesSearch =
          slot.workOrderNumber?.toLowerCase().includes(query) ||
          slot.customerName?.toLowerCase().includes(query) ||
          slot.siteName?.toLowerCase().includes(query) ||
          slot.siteAddress?.toLowerCase().includes(query) ||
          slot.title?.toLowerCase().includes(query) ||
          slot.technicianName?.toLowerCase().includes(query) ||
          slot.deviceInfo?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Date
      if (filterDate === 'today') {
        const today = new Date().toISOString().split('T')[0];
        if (slot.date !== today) return false;
      } else if (filterDate === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const tomorrow = d.toISOString().split('T')[0];
        if (slot.date !== tomorrow) return false;
      } else if (filterDate === 'custom' && customDate) {
        if (slot.date !== customDate) return false;
      }

      // Branch
      if (filterBranch !== 'all' && slot.branch !== filterBranch) {
        return false;
      }

      // Engineer
      if (filterEngineer !== 'all' && slot.technicianId !== filterEngineer && slot.technicianName !== filterEngineer) {
        return false;
      }

      // Department
      if (filterDepartment !== 'all' && slot.department !== filterDepartment) {
        return false;
      }

      // Vehicle
      if (filterVehicle !== 'all' && slot.vehicle !== filterVehicle) {
        return false;
      }

      // Service Type
      if (filterServiceType !== 'all') {
        const slotType = slot.serviceType || slot.dispatchType;
        if (slotType !== filterServiceType) return false;
      }

      // Priority
      if (filterPriority !== 'all' && slot.priority !== filterPriority) {
        return false;
      }

      // Status
      if (filterStatus !== 'all') {
        const currentDispatchStatus = slot.dispatchStatus || (slot.status === 'in_progress' ? 'On Site' : slot.status === 'completed' ? 'Completed' : 'Scheduled');
        if (currentDispatchStatus !== filterStatus) return false;
      }

      return true;
    });
  }, [
    scheduleSlots,
    filterSearch,
    filterDate,
    customDate,
    filterBranch,
    filterEngineer,
    filterDepartment,
    filterVehicle,
    filterServiceType,
    filterPriority,
    filterStatus,
  ]);

  // Operational KPI Metrics
  const metrics = useMemo(() => {
    const total = scheduleSlots.length;
    const enRoute = scheduleSlots.filter(s => s.dispatchStatus === 'En Route').length;
    const onSite = scheduleSlots.filter(s => s.dispatchStatus === 'On Site' || s.status === 'in_progress').length;
    const completed = scheduleSlots.filter(s => s.dispatchStatus === 'Completed' || s.status === 'completed').length;
    const scheduled = scheduleSlots.filter(s => !s.dispatchStatus || s.dispatchStatus === 'Scheduled' || s.dispatchStatus === 'Confirmed').length;
    const critical = scheduleSlots.filter(s => s.priority === 'Critical' && s.dispatchStatus !== 'Completed').length;

    return { total, enRoute, onSite, completed, scheduled, critical };
  }, [scheduleSlots]);

  const resetFilters = () => {
    setFilterSearch('');
    setFilterDate('all');
    setCustomDate('');
    setFilterBranch('all');
    setFilterEngineer('all');
    setFilterDepartment('all');
    setFilterVehicle('all');
    setFilterServiceType('all');
    setFilterPriority('all');
    setFilterStatus('all');
  };

  const hasActiveFilters =
    filterSearch ||
    filterDate !== 'all' ||
    filterBranch !== 'all' ||
    filterEngineer !== 'all' ||
    filterDepartment !== 'all' ||
    filterVehicle !== 'all' ||
    filterServiceType !== 'all' ||
    filterPriority !== 'all' ||
    filterStatus !== 'all';

  // Action Button Handlers
  const handleDispatchTeam = (slot: ServiceScheduleSlot) => {
    onUpdateSlot(slot.id, {
      dispatchStatus: 'En Route',
      jobStatus: `Team Dispatched in ${slot.vehicle || 'Fleet Van'} • En Route to Site`,
      progressPercent: Math.max(slot.progressPercent || 0, 25),
    });
    showToast(`Team dispatched for ${slot.workOrderNumber || slot.title}. Status set to En Route.`);
  };

  const handleStartVisit = (slot: ServiceScheduleSlot) => {
    onUpdateSlot(slot.id, {
      dispatchStatus: 'On Site',
      status: 'in_progress',
      jobStatus: 'Active On-Site Diagnostic & Engineering Work Underway',
      progressPercent: Math.max(slot.progressPercent || 0, 50),
    });
    showToast(`Site visit started for ${slot.workOrderNumber || slot.title}. Engineer on-site.`);
  };

  const handlePauseVisit = (slot: ServiceScheduleSlot) => {
    onUpdateSlot(slot.id, {
      dispatchStatus: 'Paused',
      jobStatus: 'Visit Paused Pending Client Clearance / Shift Handover',
    });
    showToast(`Visit paused for ${slot.workOrderNumber || slot.title}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Primary Dispatch Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900">
              Enterprise Field Dispatch & Workforce Scheduling
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              CamneX Dispatch Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time field engineer dispatch, enterprise service operations, fleet routing, and client SLA enforcement
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Dispatch Cards
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'board' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Dispatch Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Roster Table
            </button>
          </div>

          <button
            onClick={onAddSchedule}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Field Dispatch
          </button>
        </div>
      </div>

      {/* Operational KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Dispatches</span>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{metrics.total}</p>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-purple-600 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> En Route
          </span>
          <p className="text-xl font-bold text-purple-700 mt-0.5">{metrics.enRoute}</p>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" /> On Site
          </span>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">{metrics.onSite}</p>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Scheduled
          </span>
          <p className="text-xl font-bold text-blue-700 mt-0.5">{metrics.scheduled}</p>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
          </span>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{metrics.completed}</p>
        </div>
        <div className="p-3.5 bg-white border border-rose-200 rounded-2xl shadow-xs bg-rose-50/30">
          <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Critical / SLA Risk
          </span>
          <p className="text-xl font-bold text-rose-700 mt-0.5">{metrics.critical}</p>
        </div>
      </div>

      {/* Enterprise Multi-Filter Dispatch Console */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Dispatch Filter Console
            </span>
            {hasActiveFilters && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Filtered ({filteredSlots.length} of {scheduleSlots.length})
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          {/* 1. Date */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Date</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="custom">Custom Date...</option>
            </select>
            {filterDate === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full mt-1 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            )}
          </div>

          {/* 2. Branch */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Branch</label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Branches</option>
              {distinctBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          {/* 3. Engineer */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Engineer</label>
            <select
              value={filterEngineer}
              onChange={(e) => setFilterEngineer(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Engineers</option>
              {distinctEngineers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          {/* 4. Department */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {distinctDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* 5. Vehicle */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Vehicle</label>
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Vehicles</option>
              {distinctVehicles.map(veh => (
                <option key={veh} value={veh}>{veh}</option>
              ))}
            </select>
          </div>

          {/* 6. Service Type */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Service Type</label>
            <select
              value={filterServiceType}
              onChange={(e) => setFilterServiceType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Operations</option>
              {allServiceTypes.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 7. Priority */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Work Order #, Client Enterprise, Site Location, Lead Engineer, or Asset..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredSlots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No scheduled dispatches match your filter criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your branch, vehicle, or service type filters, or schedule a new dispatch slot.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ========================================================================= */
        /* VIEW 1: ENTERPRISE SCHEDULE CARDS GRID                                    */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSlots.map((slot) => {
            const currentDispatchStatus: DispatchStatusType =
              slot.dispatchStatus ||
              (slot.status === 'in_progress' ? 'On Site' : slot.status === 'completed' ? 'Completed' : 'Scheduled');

            const isEnRoute = currentDispatchStatus === 'En Route';
            const isOnSite = currentDispatchStatus === 'On Site';
            const isCompleted = currentDispatchStatus === 'Completed';

            return (
              <div
                key={slot.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                {/* Card Top: Work Order, Status, & Service Type */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                        {slot.workOrderNumber || 'WO-2026'}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(slot.workOrderNumber || slot.id)}
                          className="hover:text-blue-900 p-0.5"
                          title="Copy Work Order Number"
                        >
                          {copiedWo === (slot.workOrderNumber || slot.id) ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </span>
                      {slot.priority && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            slot.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : slot.priority === 'High'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {slot.priority}
                        </span>
                      )}
                    </div>

                    {/* Dispatch Status Pill */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          currentDispatchStatus === 'En Route'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : currentDispatchStatus === 'On Site'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : currentDispatchStatus === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : currentDispatchStatus === 'Paused'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : currentDispatchStatus === 'Completed'
                            ? 'bg-slate-100 text-slate-700 border border-slate-300'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {isEnRoute && <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />}
                        {isOnSite && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />}
                        {currentDispatchStatus}
                      </span>
                    </div>
                  </div>

                  {/* Operation Tag & Title */}
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-indigo-200">
                        {slot.serviceType || slot.dispatchType || 'Field Operation'}
                      </span>
                      {slot.contract && (
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-slate-200 truncate max-w-[180px]">
                          {slot.contract}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {slot.title}
                    </h3>
                  </div>

                  {/* Customer & Site Block */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Customer:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[210px]">{slot.customerName}</span>
                    </div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">Site:</span>
                      <span className="font-medium text-slate-800 text-right truncate text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0 inline" />
                        {slot.siteName || slot.siteAddress || 'Main Campus'}
                      </span>
                    </div>
                  </div>

                  {/* Field Team, Engineer & Vehicle Info */}
                  <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100/70 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Assigned Team:</span>
                      <span className="font-semibold text-blue-900 truncate text-[11px]">{slot.assignedTeam || 'Enterprise ELV Team'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-blue-100/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={slot.technicianAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={slot.technicianName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 text-[11px] leading-tight truncate">{slot.technicianName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{slot.technicianRole || 'Field Engineer'}</p>
                        </div>
                      </div>

                      {slot.vehicle && (
                        <span className="text-[10px] font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 shrink-0">
                          <Truck className="w-3 h-3 text-slate-500" />
                          {slot.vehicle.split('(')[0].trim()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Window, Duration & SLA */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-600" /> Scheduled Date
                      </span>
                      <p className="font-semibold text-slate-900 text-[11px] mt-0.5">
                        {slot.date}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {slot.startTime} - {slot.endTime} ({slot.estimatedDuration || '3.0 hrs'})
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-600" /> SLA Deadline
                      </span>
                      <p className="font-semibold text-indigo-900 text-[11px] mt-0.5 truncate">
                        {slot.slaDeadline || 'End of Day'}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium">
                        On Schedule
                      </p>
                    </div>
                  </div>

                  {/* Operational Progress & Job Status */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 truncate max-w-[200px]">
                        {slot.jobStatus || 'Scheduled for execution'}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {slot.progressPercent ?? slot.progress ?? (isCompleted ? 100 : isOnSite ? 60 : isEnRoute ? 25 : 0)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isOnSite
                            ? 'bg-blue-600'
                            : isEnRoute
                            ? 'bg-purple-600'
                            : 'bg-slate-400'
                        }`}
                        style={{
                          width: `${slot.progressPercent ?? slot.progress ?? (isCompleted ? 100 : isOnSite ? 60 : isEnRoute ? 25 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Bottom: The 6 Action Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {/* Primary Flow Actions Row */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* 1. Dispatch Team */}
                    <button
                      type="button"
                      onClick={() => handleDispatchTeam(slot)}
                      disabled={isEnRoute || isOnSite || isCompleted}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isEnRoute
                          ? 'bg-purple-50 text-purple-700 border border-purple-200 cursor-default'
                          : isOnSite || isCompleted
                          ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {isEnRoute ? 'Dispatched' : 'Dispatch Team'}
                    </button>

                    {/* 3. Start Visit / Pause Visit */}
                    {isOnSite ? (
                      <button
                        type="button"
                        onClick={() => handlePauseVisit(slot)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        Pause Visit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartVisit(slot)}
                        disabled={isCompleted}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isCompleted
                            ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        Start Visit
                      </button>
                    )}
                  </div>

                  {/* Secondary Actions: 2. Reassign, 4. Complete Visit */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReassignSlot(slot)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                      Reassign
                    </button>

                    <button
                      type="button"
                      onClick={() => setCompleteSlot(slot)}
                      disabled={isCompleted}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      {isCompleted ? 'Completed' : 'Complete Visit'}
                    </button>
                  </div>

                  {/* Reporting & Telemetry: 5. Generate Service Report, 6. View Route */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReportSlot(slot)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                      Service Report
                    </button>

                    <button
                      type="button"
                      onClick={() => setTelemetrySlot(slot)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                      View Route
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'board' ? (
        /* ========================================================================= */
        /* VIEW 2: OPERATIONAL DISPATCH KANBAN BOARD                                 */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Scheduled', 'En Route', 'On Site', 'Completed'] as DispatchStatusType[]).map((colStatus) => {
            const items = filteredSlots.filter(s => {
              const st = s.dispatchStatus || (s.status === 'in_progress' ? 'On Site' : s.status === 'completed' ? 'Completed' : 'Scheduled');
              if (colStatus === 'Scheduled') return st === 'Scheduled' || st === 'Confirmed' || st === 'Paused';
              return st === colStatus;
            });

            return (
              <div key={colStatus} className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        colStatus === 'En Route'
                          ? 'bg-purple-600'
                          : colStatus === 'On Site'
                          ? 'bg-emerald-600'
                          : colStatus === 'Completed'
                          ? 'bg-slate-700'
                          : 'bg-blue-600'
                      }`}
                    />
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{colStatus}</h4>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((slot) => (
                    <div key={slot.id} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {slot.workOrderNumber}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {slot.priority}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-indigo-700 uppercase">{slot.serviceType}</span>
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{slot.title}</h5>
                        <p className="text-[11px] text-slate-500 truncate">{slot.customerName}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate">{slot.technicianName}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setTelemetrySlot(slot)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600"
                            title="View Route"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setReportSlot(slot)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600"
                            title="Service Report"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 3: DISPATCH ROSTER TABLE                                             */
        /* ========================================================================= */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Work Order</th>
                  <th className="p-3.5">Operation Type</th>
                  <th className="p-3.5">Client Enterprise & Site</th>
                  <th className="p-3.5">Lead Engineer & Squad</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Schedule Window</th>
                  <th className="p-3.5">SLA Deadline</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSlots.map((slot) => {
                  const currentDispatchStatus =
                    slot.dispatchStatus ||
                    (slot.status === 'in_progress' ? 'On Site' : slot.status === 'completed' ? 'Completed' : 'Scheduled');

                  return (
                    <tr key={slot.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {slot.workOrderNumber}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                          {slot.serviceType || slot.dispatchType}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 truncate max-w-[180px]">{slot.customerName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{slot.siteName}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 truncate max-w-[160px]">{slot.technicianName}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[160px]">{slot.assignedTeam}</p>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-700">
                        {slot.vehicle ? slot.vehicle.split('(')[0].trim() : '—'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <p className="font-semibold text-slate-900">{slot.date}</p>
                        <p className="text-[10px] text-slate-500">{slot.startTime} - {slot.endTime}</p>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-medium text-indigo-700">
                        {slot.slaDeadline || 'Normal'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            currentDispatchStatus === 'En Route'
                              ? 'bg-purple-100 text-purple-800'
                              : currentDispatchStatus === 'On Site'
                              ? 'bg-emerald-100 text-emerald-800'
                              : currentDispatchStatus === 'Completed'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {currentDispatchStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setTelemetrySlot(slot)}
                            className="p-1.5 hover:bg-slate-100 text-indigo-600 rounded-lg"
                            title="View Route"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setReportSlot(slot)}
                            className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg"
                            title="Service Report"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setReassignSlot(slot)}
                            className="p-1.5 hover:bg-slate-100 text-amber-600 rounded-lg"
                            title="Reassign"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Route & Fleet Telemetry Modal */}
      {telemetrySlot && (
        <RouteTelemetryModal
          slot={telemetrySlot}
          onClose={() => setTelemetrySlot(null)}
          onUpdateStatus={(newStatus) => {
            onUpdateSlot(telemetrySlot.id, {
              dispatchStatus: newStatus,
              jobStatus: newStatus === 'On Site' ? 'Technician Arrived On-Site • Work in Progress' : 'In Transit',
            });
            showToast(`Status updated to ${newStatus} for ${telemetrySlot.workOrderNumber}`);
          }}
        />
      )}

      {/* MODAL 2: Official CamneX Service Report Modal */}
      {reportSlot && (
        <ServiceReportModal
          slot={reportSlot}
          onClose={() => setReportSlot(null)}
        />
      )}

      {/* MODAL 3: Reassign Dispatch Modal */}
      {reassignSlot && (
        <ReassignDispatchModal
          slot={reassignSlot}
          technicians={technicians}
          onClose={() => setReassignSlot(null)}
          onSave={(updates) => {
            onUpdateSlot(reassignSlot.id, updates);
            showToast(`Reassigned ${reassignSlot.workOrderNumber} to ${updates.technicianName}`);
          }}
        />
      )}

      {/* MODAL 4: Complete Visit Sign-off Modal */}
      {completeSlot && (
        <CompleteVisitModal
          slot={completeSlot}
          onClose={() => setCompleteSlot(null)}
          onComplete={(updates) => {
            onUpdateSlot(completeSlot.id, updates);
            showToast(`Work order ${completeSlot.workOrderNumber} completed and client sign-off saved!`);
          }}
        />
      )}
    </div>
  );
};
