import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  Clock,
  Car,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Star,
  Eye,
  MessageSquare,
  Power,
  TrendingUp,
  Building2,
  Activity,
  Layers,
  Percent,
  CheckSquare,
  Shield,
  Send,
  X,
  Radio
} from 'lucide-react';
import { ServiceTechnician, TechnicianStatus } from '../../../types';
import { EmployeeProfileModal } from './EmployeeProfileModal';

interface EnterpriseWorkforceViewProps {
  technicians: ServiceTechnician[];
  onUpdateTechnician: (id: string, updates: Partial<ServiceTechnician>) => void;
  onDeleteTechnician: (id: string) => void;
  onAddTechnician: () => void;
  onAssignWorkOrder: (tech: ServiceTechnician) => void;
  onScheduleVisit: (tech: ServiceTechnician) => void;
  onViewCalendar: (tech: ServiceTechnician) => void;
}

export const EnterpriseWorkforceView: React.FC<EnterpriseWorkforceViewProps> = ({
  technicians,
  onUpdateTechnician,
  onDeleteTechnician,
  onAddTechnician,
  onAssignWorkOrder,
  onScheduleVisit,
  onViewCalendar,
}) => {
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Selected technician for profile modal
  const [selectedTechForProfile, setSelectedTechForProfile] = useState<ServiceTechnician | null>(null);

  // Message prompt modal state
  const [messagingTech, setMessagingTech] = useState<ServiceTechnician | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageSentFeedback, setMessageSentFeedback] = useState(false);

  // Unique departments & branches
  const departments = useMemo(() => {
    const set = new Set<string>();
    technicians.forEach(t => {
      if (t.department) set.add(t.department);
    });
    return Array.from(set);
  }, [technicians]);

  const branches = useMemo(() => {
    const set = new Set<string>();
    technicians.forEach(t => {
      if (t.currentBranch) set.add(t.currentBranch);
    });
    return Array.from(set);
  }, [technicians]);

  // Filtered technicians
  const filteredTechnicians = useMemo(() => {
    return technicians.filter(tech => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tech.name.toLowerCase().includes(q) ||
        (tech.employeeId && tech.employeeId.toLowerCase().includes(q)) ||
        tech.specialization.toLowerCase().includes(q) ||
        (tech.role && tech.role.toLowerCase().includes(q)) ||
        (tech.department && tech.department.toLowerCase().includes(q)) ||
        (tech.currentBranch && tech.currentBranch.toLowerCase().includes(q)) ||
        (tech.phone && tech.phone.includes(q)) ||
        (tech.primarySkills && tech.primarySkills.some(s => s.toLowerCase().includes(q)));

      const matchesDept = selectedDepartment === 'all' || tech.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || tech.status === selectedStatus;
      const matchesBranch = selectedBranch === 'all' || tech.currentBranch === selectedBranch;

      return matchesSearch && matchesDept && matchesStatus && matchesBranch;
    });
  }, [technicians, searchQuery, selectedDepartment, selectedStatus, selectedBranch]);

  // Overall Workforce Analytics
  const stats = useMemo(() => {
    const total = technicians.length;
    const available = technicians.filter(t => t.status === 'available').length;
    const busy = technicians.filter(t => t.status === 'busy').length;
    const onSite = technicians.filter(t => t.status === 'on_site').length;
    const travelling = technicians.filter(t => t.status === 'travelling').length;
    const onLeave = technicians.filter(t => t.status === 'on_leave').length;
    const offline = technicians.filter(t => t.status === 'offline').length;
    const avgSLA = (technicians.reduce((acc, t) => acc + (t.slaSuccessRate || 95), 0) / (total || 1)).toFixed(1);
    const avgFirstFix = (technicians.reduce((acc, t) => acc + (t.firstTimeFixRate || 90), 0) / (total || 1)).toFixed(1);
    const avgWorkload = Math.round(technicians.reduce((acc, t) => acc + (t.workloadPercent || t.utilizationPercent || 80), 0) / (total || 1));

    return { total, available, busy, onSite, travelling, onLeave, offline, avgSLA, avgFirstFix, avgWorkload };
  }, [technicians]);

  const getStatusBadge = (status: TechnicianStatus) => {
    switch (status) {
      case 'available':
        return { label: 'Available', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'busy':
        return { label: 'Busy', dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'on_site':
        return { label: 'On Site', dot: 'bg-blue-500', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'travelling':
        return { label: 'Travelling', dot: 'bg-purple-500', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'on_leave':
        return { label: 'On Leave', dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
      case 'offline':
        return { label: 'Offline', dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: status, dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  const handleStatusChange = (techId: string, newStatus: TechnicianStatus) => {
    onUpdateTechnician(techId, { status: newStatus });
    if (selectedTechForProfile && selectedTechForProfile.id === techId) {
      setSelectedTechForProfile({ ...selectedTechForProfile, status: newStatus });
    }
  };

  const handleToggleDeactivate = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    if (!tech) return;
    const newActiveState = tech.isActive === false ? true : false;
    const newStatus = newActiveState ? 'available' : 'offline';
    onUpdateTechnician(techId, { isActive: newActiveState, status: newStatus });
    if (selectedTechForProfile && selectedTechForProfile.id === techId) {
      setSelectedTechForProfile({ ...selectedTechForProfile, isActive: newActiveState, status: newStatus });
    }
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingTech || !messageText.trim()) return;
    setMessageSentFeedback(true);
    setTimeout(() => {
      setMessageSentFeedback(false);
      setMessagingTech(null);
      setMessageText('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Enterprise Workforce & Field Resource Management</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              CamneX Bangladesh
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time deployment, field telemetry, enterprise certifications, SLA compliance & multi-site dispatching
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cards View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={onAddTechnician}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Enterprise Resource
          </button>
        </div>
      </div>

      {/* Workforce Metric Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Workforce</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active field engineers</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Available / Standby</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600">{stats.available}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for immediate dispatch</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Active On Site</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-600">{stats.onSite + stats.busy}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{stats.onSite} on site • {stats.busy} busy</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>En Route / Travel</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
          <div className="text-xl font-bold text-purple-600">{stats.travelling}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">In transit to client premises</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Avg SLA Success</span>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600">{stats.avgSLA}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target: 95.0%</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Workload Util</span>
            <Percent className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{stats.avgWorkload}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">FTFR: {stats.avgFirstFix}%</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by engineer name, ID (e.g. CNX-CCTV-0101), skills, department, role, phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments ({technicians.length})</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available ({stats.available})</option>
              <option value="on_site">On Site ({stats.onSite})</option>
              <option value="busy">Busy ({stats.busy})</option>
              <option value="travelling">Travelling ({stats.travelling})</option>
              <option value="on_leave">On Leave ({stats.onLeave})</option>
              <option value="offline">Offline ({stats.offline})</option>
            </select>

            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Branches</option>
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick status pill filter bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] mr-1 uppercase">Quick Filter:</span>
          {[
            { id: 'all', label: 'All Engineers', count: technicians.length },
            { id: 'available', label: 'Available', count: stats.available, dot: 'bg-emerald-500' },
            { id: 'on_site', label: 'On Site', count: stats.onSite, dot: 'bg-blue-500' },
            { id: 'busy', label: 'Busy', count: stats.busy, dot: 'bg-amber-500' },
            { id: 'travelling', label: 'En Route', count: stats.travelling, dot: 'bg-purple-500' },
            { id: 'on_leave', label: 'On Leave', count: stats.onLeave, dot: 'bg-slate-400' },
            { id: 'offline', label: 'Offline', count: stats.offline, dot: 'bg-rose-500' },
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setSelectedStatus(pill.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === pill.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.dot && <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />}
              {pill.label}
              <span className={`text-[10px] px-1 rounded font-bold ${
                selectedStatus === pill.id ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Technicians Grid / List */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTechnicians.map(tech => {
            const statusInfo = getStatusBadge(tech.status);
            const isInactive = tech.isActive === false;

            return (
              <div
                key={tech.id}
                className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isInactive ? 'opacity-70 grayscale-20 bg-slate-50/70' : ''
                }`}
              >
                <div>
                  {/* Card Header: Avatar, Status & ID */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="relative">
                      <img
                        src={tech.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={tech.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 cursor-pointer shadow-xs hover:scale-105 transition-transform"
                        onClick={() => setSelectedTechForProfile(tech)}
                      />
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${statusInfo.dot}`} />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {tech.employeeId || 'CNX-FE-01'}
                      </span>
                    </div>
                  </div>

                  {/* Name & Designation */}
                  <div className="cursor-pointer" onClick={() => setSelectedTechForProfile(tech)}>
                    <h3 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors flex items-center justify-between">
                      <span>{tech.name}</span>
                      {isInactive && (
                        <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-1.5 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap my-1">
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {tech.designation || tech.role || 'Field Engineer'}
                      </span>
                      {tech.department && (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {tech.department}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Current Branch & Employment Type */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1 truncate max-w-[140px]" title={tech.currentBranch || 'Dhaka Central Hub'}>
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      {tech.currentBranch || 'Dhaka Central Hub'}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {tech.employmentType || 'Permanent'}
                    </span>
                  </div>

                  {/* Specialization & Primary Skills */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 space-y-1.5">
                    <div>
                      <span className="font-semibold block text-[10px] uppercase text-slate-400">Enterprise Domain</span>
                      <span className="font-medium text-slate-800 text-[11px]">{tech.specialization}</span>
                    </div>
                    {tech.primarySkills && tech.primarySkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/60">
                        {tech.primarySkills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                            {skill}
                          </span>
                        ))}
                        {tech.primarySkills.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-semibold self-center">
                            +{tech.primarySkills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Current Live Assignment */}
                  <div className="text-xs text-slate-700 bg-blue-50/60 p-2 rounded-xl border border-blue-100/70 mb-3">
                    <span className="font-bold block text-[10px] uppercase text-blue-700 flex items-center justify-between">
                      <span>Active Assignment</span>
                      <span className="font-mono">{tech.currentAssignment?.workOrderNumber || 'WO-2026-0041'}</span>
                    </span>
                    <div className="text-[11px] font-semibold text-slate-900 truncate">
                      {tech.currentAssignment?.clientName || 'Grameen CyberNet Ltd.'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {tech.currentAssignment?.siteLocation || 'Gulshan 2 Data Center, Dhaka'}
                    </div>
                  </div>

                  {/* Vehicle & GPS Status */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-3">
                    <div className="flex items-center gap-1.5 truncate" title={tech.vehicleAssigned || 'Service Van'}>
                      <Car className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{tech.vehicleAssigned?.split('(')[0] || 'Service Van'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate text-right justify-end" title={tech.currentGpsStatus?.lastLocationName || 'Gulshan 2'}>
                      <Navigation className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="text-slate-700 font-semibold truncate">{tech.currentGpsStatus?.lastLocationName?.split(',')[0] || 'Gulshan 2'}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-slate-500 mb-3 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px]">{tech.mobileNumber || tech.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate text-[11px]">{tech.email}</span>
                    </div>
                  </div>

                  {/* Enterprise Workload Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                      <span>Workload Allocation</span>
                      <span className={`${
                        (tech.workloadPercent || 80) > 90 ? 'text-rose-600' :
                        (tech.workloadPercent || 80) > 75 ? 'text-blue-600' : 'text-emerald-600'
                      }`}>
                        {tech.workloadPercent || tech.utilizationPercent || 80}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (tech.workloadPercent || 80) > 90 ? 'bg-rose-500' :
                          (tech.workloadPercent || 80) > 75 ? 'bg-blue-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, tech.workloadPercent || tech.utilizationPercent || 80)}%` }}
                      />
                    </div>
                  </div>

                  {/* Certifications & Experience Pill */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 mb-3">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
                      <Award className="w-3 h-3 text-amber-500 shrink-0" />
                      {tech.certificationList ? tech.certificationList[0] : 'HCSP Specialist'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {tech.yearsOfExperience || 6}y Exp
                    </span>
                  </div>
                </div>

                {/* Card Lower Section: Job Stats, SLA, & Action Buttons */}
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  {/* Job Metrics: Today, Weekly, Open, SLA, First Fix */}
                  <div className="grid grid-cols-5 text-center text-xs py-1 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-slate-400 text-[9px] uppercase font-bold">Today</div>
                      <div className="font-bold text-slate-900 text-xs">{tech.todaysJobsCount ?? Math.min(3, tech.activeJobsCount)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[9px] uppercase font-bold">Week</div>
                      <div className="font-bold text-slate-900 text-xs">{tech.weeklyJobsCount ?? (tech.activeJobsCount * 3 + 4)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[9px] uppercase font-bold">Open</div>
                      <div className="font-bold text-blue-600 text-xs">{tech.openWorkOrdersCount ?? tech.activeJobsCount}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[9px] uppercase font-bold">SLA</div>
                      <div className="font-bold text-emerald-600 text-xs">{tech.slaSuccessRate || 98}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[9px] uppercase font-bold">Rating</div>
                      <div className="font-bold text-amber-600 text-xs">★ {tech.rating.toFixed(1)}</div>
                    </div>
                  </div>

                  {/* Primary Direct Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedTechForProfile(tech)}
                      className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1 border border-blue-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Profile
                    </button>
                    <button
                      onClick={() => onAssignWorkOrder(tech)}
                      className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Assign Work Order
                    </button>
                  </div>

                  {/* Secondary Quick Action Row: Schedule, Call, Message, Calendar, Deactivate */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <button
                      onClick={() => onScheduleVisit(tech)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all title='Schedule Visit'"
                      title="Schedule Visit"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    </button>

                    <button
                      onClick={() => window.location.href = `tel:${tech.mobileNumber || tech.phone}`}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all"
                      title="Call Engineer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    </button>

                    <button
                      onClick={() => setMessagingTech(tech)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all"
                      title="Send Dispatch Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    </button>

                    <button
                      onClick={() => onViewCalendar(tech)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all"
                      title="View Schedule Calendar"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    </button>

                    {/* Direct Status Switcher Menu */}
                    <select
                      value={tech.status}
                      onChange={e => handleStatusChange(tech.id, e.target.value as TechnicianStatus)}
                      className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2 py-1 text-slate-700 cursor-pointer focus:outline-none"
                      title="Update Availability Status"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="on_site">On Site</option>
                      <option value="travelling">Travelling</option>
                      <option value="on_leave">On Leave</option>
                      <option value="offline">Offline</option>
                    </select>

                    <button
                      onClick={() => handleToggleDeactivate(tech.id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isInactive
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={isInactive ? 'Activate Engineer' : 'Deactivate Resource'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Resource & ID</th>
                  <th className="p-3">Designation & Department</th>
                  <th className="p-3">Availability Status</th>
                  <th className="p-3">Branch & Vehicle</th>
                  <th className="p-3">Active Assignment</th>
                  <th className="p-3 text-center">Workload</th>
                  <th className="p-3 text-center">Jobs (D/W/O)</th>
                  <th className="p-3 text-center">SLA Rate</th>
                  <th className="p-3 text-center">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTechnicians.map(tech => {
                  const statusInfo = getStatusBadge(tech.status);
                  return (
                    <tr key={tech.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={tech.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={tech.name}
                            className="w-9 h-9 rounded-xl object-cover cursor-pointer border border-slate-200"
                            onClick={() => setSelectedTechForProfile(tech)}
                          />
                          <div>
                            <span
                              onClick={() => setSelectedTechForProfile(tech)}
                              className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer block leading-tight"
                            >
                              {tech.name}
                            </span>
                            <span className="font-mono text-[10px] text-blue-600 font-semibold">
                              {tech.employeeId || 'CNX-FE-01'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 block">{tech.designation || tech.role}</span>
                        <span className="text-[11px] text-slate-400">{tech.department}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-800 font-medium block">{tech.currentBranch || 'Dhaka Central Hub'}</span>
                        <span className="text-[10px] text-slate-400">{tech.vehicleAssigned?.split('(')[0] || 'Service Van'}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800 block truncate max-w-[150px]">
                          {tech.currentAssignment?.clientName || 'Grameen CyberNet Ltd.'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tech.currentAssignment?.workOrderNumber || 'WO-2026-0041'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-slate-900">{tech.workloadPercent || tech.utilizationPercent || 80}%</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-semibold text-slate-800">
                          {tech.todaysJobsCount ?? 2} / {tech.weeklyJobsCount ?? 12} / {tech.openWorkOrdersCount ?? 4}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-600">
                        {tech.slaSuccessRate || 98}%
                      </td>
                      <td className="p-3 text-center font-bold text-amber-600">
                        ★ {tech.rating.toFixed(1)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedTechForProfile(tech)}
                            className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onAssignWorkOrder(tech)}
                            className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg"
                            title="Assign Work Order"
                          >
                            <Briefcase className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onScheduleVisit(tech)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg"
                            title="Schedule Visit"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleDeactivate(tech.id)}
                            className="p-1.5 hover:bg-slate-100 text-rose-500 rounded-lg"
                            title="Toggle Active/Deactivate"
                          >
                            <Power className="w-4 h-4" />
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

      {/* Profile Modal */}
      <EmployeeProfileModal
        technician={selectedTechForProfile}
        isOpen={Boolean(selectedTechForProfile)}
        onClose={() => setSelectedTechForProfile(null)}
        onAssignWorkOrder={tech => {
          setSelectedTechForProfile(null);
          onAssignWorkOrder(tech);
        }}
        onScheduleVisit={tech => {
          setSelectedTechForProfile(null);
          onScheduleVisit(tech);
        }}
        onMessage={tech => {
          setMessagingTech(tech);
        }}
        onToggleStatus={handleStatusChange}
        onToggleDeactivate={handleToggleDeactivate}
      />

      {/* Message Dispatch Modal */}
      {messagingTech && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Send Field Alert to {messagingTech.name}
                </h3>
              </div>
              <button onClick={() => setMessagingTech(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {messageSentFeedback ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <p className="font-bold text-xs">Dispatch Alert Sent Successfully!</p>
                <p className="text-[11px] text-emerald-600">Delivered via CamneX Field Companion App & SMS.</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessageSubmit} className="space-y-3">
                <div className="text-xs text-slate-500">
                  <span>To: </span>
                  <strong className="text-slate-800">{messagingTech.name}</strong> ({messagingTech.mobileNumber || messagingTech.phone})
                </div>

                <textarea
                  required
                  rows={4}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Enter dispatch notice, client gate access code, or urgent work order update..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMessagingTech(null)}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Transmit Alert
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
