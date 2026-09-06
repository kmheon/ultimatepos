import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  User, 
  Building, 
  Phone, 
  Mail, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Plus, 
  Send 
} from 'lucide-react';
import { CRMLead, CRMLeadStage } from '../../types';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';

interface LeadDetailDrawerProps {
  lead: CRMLead | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (lead: CRMLead) => void;
  onConvertToQuote?: (lead: CRMLead) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onEdit,
  onConvertToQuote
}) => {
  const { settings } = usePOS();
  const { moveLeadStage, activities, addActivity } = useCRM();
  const [newNote, setNewNote] = useState('');

  if (!isOpen || !lead) return null;

  const stages: { key: CRMLeadStage; label: string }[] = [
    { key: 'new', label: 'New' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'qualified', label: 'Qualified' },
    { key: 'proposal', label: 'Proposal' },
    { key: 'negotiation', label: 'Negotiation' },
    { key: 'won', label: 'Won' },
    { key: 'lost', label: 'Lost' }
  ];

  const currentStageIndex = stages.findIndex(s => s.key === lead.stage);

  // Filter activities related to this lead
  const leadActivities = activities.filter(
    a => a.entityId === lead.id || (a.entityName && a.entityName === (lead.companyName || lead.contactName))
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addActivity({
      title: 'Follow-up note logged',
      type: 'note',
      entityType: 'lead',
      entityId: lead.id,
      entityName: lead.companyName || lead.contactName,
      notes: newNote.trim(),
      createdBy: lead.assignedTo || 'Sales Rep'
    });

    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                lead.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' :
                lead.priority === 'high' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                'bg-blue-500/20 text-blue-300 border-blue-400/30'
              }`}>
                {lead.priority} priority • {lead.source.replace('_', ' ')}
              </span>
              <h2 className="text-base font-bold text-white mt-1.5 leading-snug">{lead.title}</h2>
              <p className="text-xs text-slate-300 mt-0.5">{lead.companyName || lead.contactName}</p>
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
          {/* Pipeline Stage Progression Stepper */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Opportunity Stage</span>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wide">
                {lead.stage} ({lead.probability}% Win Probability)
              </span>
            </div>

            {/* Stepper bar */}
            <div className="grid grid-cols-7 gap-1">
              {stages.map((s, idx) => {
                const isCurrent = s.key === lead.stage;
                const isPassed = currentStageIndex > idx && lead.stage !== 'lost';
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => moveLeadStage(lead.id, s.key)}
                    className={`text-[10px] font-bold py-1.5 rounded-md transition-all text-center truncate px-1 cursor-pointer ${
                      isCurrent
                        ? s.key === 'won'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : s.key === 'lost'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-blue-600 text-white shadow-xs'
                        : isPassed
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Value & Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
              <span className="text-[11px] font-bold text-blue-700 block">Estimated Deal Value</span>
              <span className="text-lg font-extrabold text-blue-900 mt-0.5 block">
                {settings.currencySymbol}{lead.dealValue.toLocaleString()}
              </span>
              <span className="text-[10px] text-blue-600">
                Weighted: {settings.currencySymbol}{Math.round(lead.dealValue * (lead.probability / 100)).toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 block">Target Close Date</span>
              <span className="text-sm font-extrabold text-slate-900 mt-1 block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {lead.expectedCloseDate}
              </span>
              <span className="text-[10px] text-slate-500">Rep: {lead.assignedTo}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            {lead.stage !== 'won' && (
              <button
                onClick={() => moveLeadStage(lead.id, 'won')}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark as Closed Won
              </button>
            )}
            {onConvertToQuote && (
              <button
                onClick={() => {
                  onConvertToQuote(lead);
                  onClose();
                }}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Generate Quote
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(lead);
                  onClose();
                }}
                className="py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Prospect & Contact Details</h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-900">{lead.contactName}</span>
                </div>
                {lead.companyName && (
                  <span className="text-slate-500 text-[11px] font-medium">{lead.companyName}</span>
                )}
              </div>

              {lead.mobile && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.mobile}</span>
                  </div>
                  <a href={`tel:${lead.mobile}`} className="text-blue-600 hover:underline font-bold text-[11px]">
                    Call Now
                  </a>
                </div>
              )}

              {lead.email && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.email}</span>
                  </div>
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline font-bold text-[11px]">
                    Send Email
                  </a>
                </div>
              )}

              {lead.notes && (
                <div className="pt-2 border-t border-slate-200/60 text-slate-600">
                  <span className="font-bold text-slate-700 block mb-0.5">Notes:</span>
                  <p className="text-[11px] leading-relaxed">{lead.notes}</p>
                </div>
              )}

              {lead.tags && lead.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                  {lead.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Communications & Activity Stream */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interaction Stream & Notes ({leadActivities.length})
            </h3>

            {/* Quick add note input */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Log a client interaction, phone summary, or next step..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                Log
              </button>
            </form>

            <div className="space-y-2">
              {leadActivities.length === 0 ? (
                <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  No interactions recorded yet. Use the field above to log meeting notes.
                </div>
              ) : (
                leadActivities.map(act => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{act.title}</span>
                      <span className="text-slate-400">{act.date}</span>
                    </div>
                    {act.notes && (
                      <p className="text-slate-600 text-[11px] leading-relaxed">{act.notes}</p>
                    )}
                    <span className="text-[10px] text-slate-400 block">By: {act.createdBy}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
