import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Plus, 
  Calendar, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  RotateCw, 
  Eye, 
  FileText 
} from 'lucide-react';
import { CRMProject, CRMProjectRenewalStatus, CRMSLALevel } from '../../types';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';
import { LogMaintenanceModal } from './LogMaintenanceModal';

interface CRMProjectsAMCViewProps {
  onOpenNewProject: () => void;
  onEditProject: (project: CRMProject) => void;
}

export const CRMProjectsAMCView: React.FC<CRMProjectsAMCViewProps> = ({
  onOpenNewProject,
  onEditProject
}) => {
  const { settings } = usePOS();
  const { projects, deleteProject, updateProject } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CRMProjectRenewalStatus>('all');
  const [slaFilter, setSlaFilter] = useState<'all' | CRMSLALevel>('all');
  const [loggingProject, setLoggingProject] = useState<CRMProject | null>(null);

  // Metrics
  const activeContracts = projects.filter(p => p.renewalStatus === 'active' || p.renewalStatus === 'expiring_soon');
  const expiringSoonContracts = projects.filter(p => p.renewalStatus === 'expiring_soon');
  const totalContractValue = projects.reduce((acc, p) => acc + p.contractValue, 0);

  const totalPlannedVisits = projects.reduce((acc, p) => acc + (p.totalVisitsPlanned || 0), 0);
  const totalCompletedVisits = projects.reduce((acc, p) => acc + (p.visitsCompleted || 0), 0);
  const auditFulfillmentRate = totalPlannedVisits > 0 ? Math.round((totalCompletedVisits / totalPlannedVisits) * 100) : 100;

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectLead.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && p.renewalStatus !== statusFilter) return false;
    if (slaFilter !== 'all' && p.slaLevel !== slaFilter) return false;

    return true;
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove project "${title}"?`)) {
      deleteProject(id);
    }
  };

  const handleQuickRenew = (project: CRMProject) => {
    const currentEnd = new Date(project.endDate);
    currentEnd.setFullYear(currentEnd.getFullYear() + 1);
    const newEndDate = currentEnd.toISOString().split('T')[0];

    updateProject(project.id, {
      renewalStatus: 'renewed',
      endDate: newEndDate,
      visitsCompleted: 0,
      progress: 0
    });

    alert(`Contract ${project.projectNumber} renewed through ${newEndDate}!`);
  };

  return (
    <div className="space-y-6">


      {/* Filter and Action Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search contract code, project title, or client..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Renewal Statuses</option>
            <option value="active">Active & Running</option>
            <option value="expiring_soon">Expiring Soon (Under 30 Days)</option>
            <option value="renewed">Renewed for Next Cycle</option>
            <option value="pending">Pending Client Sign-off</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={slaFilter}
            onChange={e => setSlaFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All SLA Levels</option>
            <option value="24_7_dedicated">24/7 Dedicated Emergency</option>
            <option value="4hr_onsite">4-Hour Critical On-Site</option>
            <option value="next_business_day">Next Business Day</option>
            <option value="standard_48hr">Standard 48-Hour</option>
          </select>
        </div>

        <button
          onClick={onOpenNewProject}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-blue-200 transition-colors cursor-pointer self-end md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add AMC / Project
        </button>
      </div>

      {/* Projects Cards List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Projects or AMC Agreements Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No service contracts match your current filter settings.
            </p>
            <button
              onClick={onOpenNewProject}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Maintenance Agreement
            </button>
          </div>
        ) : (
          filteredProjects.map(proj => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                      {proj.projectNumber}
                    </span>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      proj.renewalStatus === 'expiring_soon' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      proj.renewalStatus === 'renewed' ? 'bg-emerald-100 text-emerald-800' :
                      proj.renewalStatus === 'expired' ? 'bg-rose-100 text-rose-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {proj.renewalStatus.replace('_', ' ')}
                    </span>

                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      {proj.contractTier}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1">{proj.title}</h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700">{proj.clientName}</span>
                    <span>•</span>
                    <span>SLA: {proj.slaLevel.replace('_', ' ').toUpperCase()}</span>
                    <span>•</span>
                    <span>Lead: {proj.projectLead}</span>
                  </div>
                </div>

                {/* Financials & Value */}
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-lg font-black text-slate-900 block">
                    {settings.currencySymbol}{proj.contractValue.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium capitalize">
                    {proj.billingCycle} billing schedule
                  </span>
                </div>
              </div>

              {/* Progress & Scheduled Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
                {/* Visits Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Scheduled Audits & Visits</span>
                    <span className="font-bold text-slate-900">
                      {proj.visitsCompleted} of {proj.totalVisitsPlanned} completed ({proj.progress}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        proj.progress >= 75 ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Contract Duration */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Contract Active Period</span>
                    <span className="font-semibold text-slate-800">
                      {proj.startDate} → {proj.endDate}
                    </span>
                  </div>
                </div>

                {/* Next Scheduled Service */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Next Scheduled Maintenance</span>
                    <span className="font-semibold text-blue-700">
                      {proj.nextServiceDate ? proj.nextServiceDate : 'Pending technician assignment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes if any */}
              {proj.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-700">Scope: </span>
                  {proj.notes}
                </div>
              )}

              {/* Bottom Actions Toolbar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLoggingProject(proj)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Log Maintenance Audit
                  </button>

                  <button
                    onClick={() => handleQuickRenew(proj)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Renew for 1 Year
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditProject(proj)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Agreement"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id, proj.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Maintenance Visit Modal */}
      <LogMaintenanceModal
        isOpen={Boolean(loggingProject)}
        project={loggingProject}
        onClose={() => setLoggingProject(null)}
      />
    </div>
  );
};
