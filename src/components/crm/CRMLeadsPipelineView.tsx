import React, { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  User, 
  Building, 
  ArrowRight, 
  ArrowLeft, 
  Table as TableIcon, 
  LayoutGrid, 
  Tag, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { CRMLead, CRMLeadPriority, CRMLeadStage } from '../../types';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';
import { LeadDetailDrawer } from './LeadDetailDrawer';

interface CRMLeadsPipelineViewProps {
  onOpenNewLead: (stage?: CRMLeadStage) => void;
  onEditLead: (lead: CRMLead) => void;
  onConvertToQuote?: (lead: CRMLead) => void;
}

export const CRMLeadsPipelineView: React.FC<CRMLeadsPipelineViewProps> = ({
  onOpenNewLead,
  onEditLead,
  onConvertToQuote
}) => {
  const { settings } = usePOS();
  const { leads, moveLeadStage, deleteLead } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | CRMLeadPriority>('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedLeadForDrawer, setSelectedLeadForDrawer] = useState<CRMLead | null>(null);

  // Assignees
  const assignees = Array.from(new Set(leads.map(l => l.assignedTo))).filter(Boolean);

  const stages: { key: CRMLeadStage; label: string; color: string; badgeColor: string }[] = [
    { key: 'new', label: 'New / Inbound', color: 'border-t-slate-400', badgeColor: 'bg-slate-100 text-slate-700' },
    { key: 'contacted', label: 'Contacted', color: 'border-t-blue-500', badgeColor: 'bg-blue-100 text-blue-800' },
    { key: 'qualified', label: 'Qualified', color: 'border-t-indigo-500', badgeColor: 'bg-indigo-100 text-indigo-800' },
    { key: 'proposal', label: 'Proposal Sent', color: 'border-t-amber-500', badgeColor: 'bg-amber-100 text-amber-800' },
    { key: 'negotiation', label: 'Negotiation', color: 'border-t-purple-500', badgeColor: 'bg-purple-100 text-purple-800' },
    { key: 'won', label: 'Closed Won', color: 'border-t-emerald-500', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { key: 'lost', label: 'Closed Lost', color: 'border-t-rose-400', badgeColor: 'bg-rose-100 text-rose-800' },
  ];

  // Filtering
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.companyName && l.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.tags && l.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!matchesSearch) return false;
    if (priorityFilter !== 'all' && l.priority !== priorityFilter) return false;
    if (assignedFilter !== 'all' && l.assignedTo !== assignedFilter) return false;

    return true;
  });

  // Metrics
  const totalPipelineVal = leads.reduce((acc, l) => acc + (l.stage !== 'lost' ? l.dealValue : 0), 0);
  const weightedVal = leads.reduce((acc, l) => acc + (l.stage !== 'lost' ? Math.round(l.dealValue * (l.probability / 100)) : 0), 0);
  const wonCount = leads.filter(l => l.stage === 'won').length;
  const closedCount = leads.filter(l => l.stage === 'won' || l.stage === 'lost').length;
  const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 75;

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete lead opportunity "${title}"?`)) {
      deleteLead(id);
    }
  };

  const getNextStage = (current: CRMLeadStage): CRMLeadStage | null => {
    const order: CRMLeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];
    const idx = order.indexOf(current);
    return idx !== -1 && idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStage = (current: CRMLeadStage): CRMLeadStage | null => {
    const order: CRMLeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
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
              placeholder="Search opportunity title, client name, or tags..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent 🔥</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={assignedFilter}
            onChange={e => setAssignedFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sales Reps</option>
            {assignees.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onOpenNewLead('new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-blue-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Opportunity
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-4 min-w-[1300px]">
            {stages.map(col => {
              const columnLeads = filteredLeads.filter(l => l.stage === col.key);
              const columnTotal = columnLeads.reduce((acc, l) => acc + l.dealValue, 0);

              return (
                <div
                  key={col.key}
                  className={`w-72 shrink-0 bg-slate-100/90 rounded-2xl p-3 border-t-4 ${col.color} border border-slate-200 flex flex-col max-h-[750px] shadow-2xs`}
                >
                  {/* Column Header */}
                  <div className="pb-3 border-b border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{col.label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                          {columnLeads.length}
                        </span>
                      </div>
                      <span className="text-[11px] font-extrabold text-slate-600 mt-0.5 block">
                        {settings.currencySymbol}{columnTotal.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenNewLead(col.key)}
                      title={`Add lead in ${col.label}`}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 overflow-y-auto pt-3 space-y-3 pr-0.5">
                    {columnLeads.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl">
                        No deals in this stage
                      </div>
                    ) : (
                      columnLeads.map(lead => {
                        const prev = getPrevStage(lead.stage);
                        const next = getNextStage(lead.stage);

                        return (
                          <div
                            key={lead.id}
                            className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all group relative space-y-2.5"
                          >
                            {/* Priority & Deal Value */}
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                lead.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                                lead.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {lead.priority}
                              </span>

                              <span className="text-xs font-black text-slate-900">
                                {settings.currencySymbol}{lead.dealValue.toLocaleString()}
                              </span>
                            </div>

                            {/* Title & Organization */}
                            <div>
                              <h4
                                onClick={() => setSelectedLeadForDrawer(lead)}
                                className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug"
                              >
                                {lead.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                                {lead.companyName || lead.contactName}
                              </p>
                            </div>

                            {/* Win Probability Bar */}
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                                <span>Win Probability</span>
                                <span className="font-bold text-blue-600">{lead.probability}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full transition-all"
                                  style={{ width: `${lead.probability}%` }}
                                />
                              </div>
                            </div>

                            {/* Footer: Target date & Sales rep */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {lead.expectedCloseDate}
                              </span>
                              <span className="font-semibold text-slate-600 truncate max-w-[90px]">
                                {lead.assignedTo}
                              </span>
                            </div>

                            {/* Fast Action Stage Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                              {prev ? (
                                <button
                                  onClick={() => moveLeadStage(lead.id, prev)}
                                  title={`Move back to ${prev}`}
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              ) : <div />}

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setSelectedLeadForDrawer(lead)}
                                  title="View Details"
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onEditLead(lead)}
                                  title="Edit Lead"
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(lead.id, lead.title)}
                                  title="Delete Lead"
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {next ? (
                                <button
                                  onClick={() => moveLeadStage(lead.id, next)}
                                  title={`Advance to ${next}`}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded-md font-bold cursor-pointer"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              ) : <div />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Opportunity Title</th>
                  <th className="py-3.5 px-4">Client / Prospect</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4 text-right">Deal Value</th>
                  <th className="py-3.5 px-4 text-center">Probability</th>
                  <th className="py-3.5 px-4">Close Date</th>
                  <th className="py-3.5 px-4">Sales Rep</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedLeadForDrawer(lead)}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left block cursor-pointer"
                      >
                        {lead.title}
                      </button>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        lead.priority === 'urgent' ? 'text-rose-600' :
                        lead.priority === 'high' ? 'text-amber-600' :
                        'text-slate-400'
                      }`}>
                        {lead.priority} priority • {lead.source.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {lead.companyName || lead.contactName}
                      </span>
                      <span className="text-[10px] text-slate-400">{lead.contactName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        lead.stage === 'won' ? 'bg-emerald-100 text-emerald-800' :
                        lead.stage === 'lost' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {lead.stage}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {settings.currencySymbol}{lead.dealValue.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-blue-600">{lead.probability}%</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {lead.expectedCloseDate}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {lead.assignedTo}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedLeadForDrawer(lead)}
                          title="View Lead"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onConvertToQuote && (
                          <button
                            onClick={() => onConvertToQuote(lead)}
                            title="Generate Quotation"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditLead(lead)}
                          title="Edit Lead"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id, lead.title)}
                          title="Delete Lead"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLeadForDrawer}
        isOpen={Boolean(selectedLeadForDrawer)}
        onClose={() => setSelectedLeadForDrawer(null)}
        onEdit={l => onEditLead(l)}
        onConvertToQuote={l => onConvertToQuote && onConvertToQuote(l)}
      />
    </div>
  );
};
