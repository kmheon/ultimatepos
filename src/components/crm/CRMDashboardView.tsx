import React from 'react';
import { 
  Users, 
  Building2, 
  FolderKanban, 
  Wrench, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  Clock, 
  PhoneCall,
  FileText, 
  Sparkles,
  Award,
  Activity,
  BarChart3,
  Contact
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';
import { CRMLeadStage } from '../../types';
import { NebulaStatGrid, NebulaStatCard, TableCard } from '../../core/ui';

interface CRMDashboardViewProps {
  onOpenNewLead: () => void;
  onOpenNewOrg: () => void;
  onOpenNewProject: () => void;
  onOpenNewCustomer: () => void;
}

export const CRMDashboardView: React.FC<CRMDashboardViewProps> = ({
  onOpenNewLead,
  onOpenNewOrg,
  onOpenNewProject,
  onOpenNewCustomer
}) => {
  const { settings, contacts } = usePOS();
  const { leads, organizations, projects, activities } = useCRM();

  // Metrics calculation
  const totalCustomersCount = contacts.filter(c => c.type === 'customer' || c.type === 'both').length;
  const totalCorporateCount = organizations.length;

  const totalPipelineValue = leads.reduce((acc, l) => acc + (l.stage !== 'lost' ? l.dealValue : 0), 0);
  const weightedPipelineValue = leads.reduce((acc, l) => acc + (l.stage !== 'lost' ? Math.round(l.dealValue * (l.probability / 100)) : 0), 0);
  
  const wonLeads = leads.filter(l => l.stage === 'won');
  const wonLeadsValue = wonLeads.reduce((acc, l) => acc + l.dealValue, 0);
  const totalClosed = leads.filter(l => l.stage === 'won' || l.stage === 'lost').length;
  const winRate = totalClosed > 0 ? Math.round((wonLeads.length / totalClosed) * 100) : 78;

  const activeProjects = projects.filter(p => p.renewalStatus === 'active' || p.renewalStatus === 'expiring_soon');
  const totalContractRevenue = projects.reduce((acc, p) => acc + p.contractValue, 0);

  // Stage counts
  const stageCounts: Record<CRMLeadStage, number> = {
    new: leads.filter(l => l.stage === 'new').length,
    contacted: leads.filter(l => l.stage === 'contacted').length,
    qualified: leads.filter(l => l.stage === 'qualified').length,
    proposal: leads.filter(l => l.stage === 'proposal').length,
    negotiation: leads.filter(l => l.stage === 'negotiation').length,
    won: leads.filter(l => l.stage === 'won').length,
    lost: leads.filter(l => l.stage === 'lost').length,
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      {/* Enterprise CRM KPIs Grid */}
      <NebulaStatGrid>
        <NebulaStatCard
          label="Total Pipeline Value"
          value={`${settings.currencySymbol}${totalPipelineValue.toLocaleString()}`}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          statusText={`Weighted: ${settings.currencySymbol}${weightedPipelineValue.toLocaleString()}`}
          statusColor="text-blue-600"
        />
        <NebulaStatCard
          label="Corporate B2B Accounts"
          value={totalCorporateCount}
          icon={Building2}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          statusText="Active enterprise partners"
          statusColor="text-indigo-600"
        />
        <NebulaStatCard
          label="Active AMC Contracts"
          value={activeProjects.length}
          icon={Wrench}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
          statusText={`Value: ${settings.currencySymbol}${totalContractRevenue.toLocaleString()}`}
          statusColor="text-purple-600"
        />
        <NebulaStatCard
          label="Deal Win Rate"
          value={`${winRate}%`}
          icon={Award}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          statusText={`${wonLeads.length} deals successfully won`}
          statusColor="text-emerald-600"
        />
      </NebulaStatGrid>

      {/* Quick Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Quick Commercial Actions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> New Opportunity
          </button>
          <button
            onClick={onOpenNewOrg}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            <Building2 className="w-3.5 h-3.5" /> Add B2B Account
          </button>
          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            <Wrench className="w-3.5 h-3.5" /> New AMC Contract
          </button>
          <button
            onClick={onOpenNewCustomer}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
          >
            <Contact className="w-3.5 h-3.5" /> Add Customer
          </button>
        </div>
      </div>

      {/* Pipeline Funnel Progression & Top Corporate Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableCard title="Opportunity Pipeline Progression" subtitle="Breakdown of active sales deals across negotiation and closing stages">
            <div className="p-5 space-y-4">
              {[
                { stage: 'new', label: 'New / Inbound Inquiry', count: stageCounts.new, color: 'bg-slate-400' },
                { stage: 'contacted', label: 'Contacted & Discovery', count: stageCounts.contacted, color: 'bg-blue-500' },
                { stage: 'qualified', label: 'Qualified Opportunities', count: stageCounts.qualified, color: 'bg-indigo-600' },
                { stage: 'proposal', label: 'Proposal & Quote Delivered', count: stageCounts.proposal, color: 'bg-amber-500' },
                { stage: 'negotiation', label: 'Final Commercial Negotiation', count: stageCounts.negotiation, color: 'bg-purple-600' },
                { stage: 'won', label: 'Won & Executed Contracts', count: stageCounts.won, color: 'bg-emerald-600' },
              ].map(item => {
                const maxLeads = Math.max(1, leads.length);
                const percentage = Math.round((item.count / maxLeads) * 100);
                const stageValue = leads
                  .filter(l => l.stage === item.stage)
                  .reduce((acc, l) => acc + l.dealValue, 0);

                return (
                  <div key={item.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-medium">{item.count} deals</span>
                        <span className="font-black text-slate-900">{settings.currencySymbol}{stageValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(6, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </TableCard>
        </div>

        <div>
          <TableCard title="Top Corporate Accounts" subtitle="Highest billed B2B partners">
            <div className="p-5 space-y-3">
              {organizations.slice(0, 4).map(org => (
                <div
                  key={org.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <span className="text-xs font-bold text-slate-900 block truncate">{org.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{org.industry}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 block">
                      {settings.currencySymbol}{org.totalRevenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold capitalize">
                      {org.amcTier.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TableCard>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <TableCard title="Recent Communications & Service Log" subtitle={`${activities.length} total events recorded across pipeline and accounts`}>
        <div className="p-5 space-y-3">
          {activities.slice(0, 5).map(act => (
            <div key={act.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shrink-0 shadow-2xs">
                {act.type === 'call' && <PhoneCall className="w-4 h-4 text-blue-600" />}
                {act.type === 'site_visit' && <Wrench className="w-4 h-4 text-emerald-600" />}
                {act.type === 'contract_signed' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                {act.type === 'email' && <FileText className="w-4 h-4 text-amber-600" />}
                {act.type === 'meeting' && <Users className="w-4 h-4 text-indigo-600" />}
                {act.type === 'note' && <Sparkles className="w-4 h-4 text-slate-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">{act.title}</span>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">{act.date}</span>
                </div>
                {act.notes && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{act.notes}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-800">{act.entityName}</span>
                  <span>•</span>
                  <span>Logged by: {act.createdBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TableCard>
    </div>
  );
};
