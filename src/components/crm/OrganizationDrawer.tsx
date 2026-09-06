import React from 'react';
import { 
  X, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  FolderKanban, 
  Wrench, 
  DollarSign, 
  ExternalLink 
} from 'lucide-react';
import { CRMOrganization } from '../../types';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';

interface OrganizationDrawerProps {
  org: CRMOrganization | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (org: CRMOrganization) => void;
  onCreateLead?: (org: CRMOrganization) => void;
  onCreateProject?: (org: CRMOrganization) => void;
}

export const OrganizationDrawer: React.FC<OrganizationDrawerProps> = ({
  org,
  isOpen,
  onClose,
  onEdit,
  onCreateLead,
  onCreateProject
}) => {
  const { settings } = usePOS();
  const { leads, projects } = useCRM();

  if (!isOpen || !org) return null;

  const orgLeads = leads.filter(
    l => l.companyName?.toLowerCase() === org.name.toLowerCase()
  );

  const orgProjects = projects.filter(
    p => p.clientId === org.id || p.clientName?.toLowerCase() === org.name.toLowerCase()
  );

  const totalContractVal = orgProjects.reduce((acc, p) => acc + (p.contractValue || 0), 0);
  const totalPipelineVal = orgLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{org.name}</h2>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{org.industry}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  org.status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}>
                  {org.status}
                </span>
                <span className="text-[10px] text-slate-400">Tax ID: {org.binOrTaxNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Commercial Snapshot */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 block">Credit Ceiling</span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {settings.currencySymbol}{org.creditLimit.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase">{org.paymentTerms} terms</span>
            </div>

            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
              <span className="text-[11px] font-bold text-indigo-700 block">Active AMC Value</span>
              <span className="text-base font-extrabold text-indigo-900 mt-1 block">
                {settings.currencySymbol}{totalContractVal.toLocaleString()}
              </span>
              <span className="text-[10px] text-indigo-600">{orgProjects.length} active agreements</span>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
              <span className="text-[11px] font-bold text-blue-700 block">Pipeline Deals</span>
              <span className="text-base font-extrabold text-blue-900 mt-1 block">
                {settings.currencySymbol}{totalPipelineVal.toLocaleString()}
              </span>
              <span className="text-[10px] text-blue-600">{orgLeads.length} active opportunities</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            {onCreateLead && (
              <button
                onClick={() => {
                  onCreateLead(org);
                  onClose();
                }}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Opportunity
              </button>
            )}
            {onCreateProject && (
              <button
                onClick={() => {
                  onCreateProject(org);
                  onClose();
                }}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                New AMC / Project
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(org);
                  onClose();
                }}
                className="py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          {/* Key Contact & Relationship */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Decision Maker & Location</h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs text-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-900 block">{org.contactPersonName}</span>
                    <span className="text-slate-500 text-[11px]">{org.contactPersonRole}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  Tier: {org.amcTier.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                {org.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${org.phone}`} className="text-slate-700 hover:text-blue-600 font-medium">
                      {org.phone}
                    </a>
                  </div>
                )}
                {org.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${org.email}`} className="text-slate-700 hover:text-blue-600 font-medium truncate">
                      {org.email}
                    </a>
                  </div>
                )}
              </div>

              {org.address && (
                <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {org.address}, {org.city}
                    {org.country ? `, ${org.country}` : ''}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                Account Manager: <span className="font-semibold text-slate-800">{org.accountManager}</span>
              </div>
            </div>
          </div>

          {/* Associated Active Projects & AMC */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contracted Service Agreements ({orgProjects.length})
            </h3>
            {orgProjects.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                No maintenance contracts active for this account.
              </div>
            ) : (
              <div className="space-y-2">
                {orgProjects.map(proj => (
                  <div
                    key={proj.id}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600">{proj.projectNumber}</span>
                        <span className="text-[10px] font-semibold text-slate-500">{proj.contractTier}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{proj.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Expires: {proj.endDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        {settings.currencySymbol}{proj.contractValue.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">{proj.progress}% progress</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Associated Pipeline Opportunities */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sales Pipeline Opportunities ({orgLeads.length})
            </h3>
            {orgLeads.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                No active leads currently in pipeline.
              </div>
            ) : (
              <div className="space-y-2">
                {orgLeads.map(lead => (
                  <div
                    key={lead.id}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {lead.stage}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">{lead.probability}% probability</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1">{lead.title}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        {settings.currencySymbol}{lead.dealValue.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">Close: {lead.expectedCloseDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
