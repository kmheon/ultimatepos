import React, { useState, useEffect } from 'react';
import { X, Sparkles, DollarSign, Calendar, User, Building, Phone, Mail, Tag, AlertCircle } from 'lucide-react';
import { CRMLead, CRMLeadPriority, CRMLeadSource, CRMLeadStage } from '../../types';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';

interface AddEditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLead?: CRMLead | null;
  defaultStage?: CRMLeadStage;
}

export const AddEditLeadModal: React.FC<AddEditLeadModalProps> = ({
  isOpen,
  onClose,
  editingLead,
  defaultStage = 'new'
}) => {
  const { settings } = usePOS();
  const { addLead, updateLead, organizations } = useCRM();

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dealValue, setDealValue] = useState<number>(10000);
  const [stage, setStage] = useState<CRMLeadStage>(defaultStage);
  const [probability, setProbability] = useState<number>(20);
  const [source, setSource] = useState<CRMLeadSource>('website');
  const [priority, setPriority] = useState<CRMLeadPriority>('medium');
  const [assignedTo, setAssignedTo] = useState('Zubair Hossain');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  // Default close date 30 days from today
  useEffect(() => {
    if (!editingLead) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setExpectedCloseDate(d.toISOString().split('T')[0]);
    }
  }, [editingLead]);

  useEffect(() => {
    if (editingLead) {
      setTitle(editingLead.title);
      setCompanyName(editingLead.companyName || '');
      setContactName(editingLead.contactName);
      setEmail(editingLead.email || '');
      setMobile(editingLead.mobile || '');
      setDealValue(editingLead.dealValue);
      setStage(editingLead.stage);
      setProbability(editingLead.probability);
      setSource(editingLead.source);
      setPriority(editingLead.priority);
      setAssignedTo(editingLead.assignedTo);
      setExpectedCloseDate(editingLead.expectedCloseDate);
      setNotes(editingLead.notes || '');
      setTagsInput(editingLead.tags ? editingLead.tags.join(', ') : '');
    } else {
      setTitle('');
      setCompanyName('');
      setContactName('');
      setEmail('');
      setMobile('');
      setDealValue(15000);
      setStage(defaultStage);
      setProbability(defaultStage === 'new' ? 20 : defaultStage === 'qualified' ? 60 : 70);
      setSource('website');
      setPriority('medium');
      setAssignedTo('Zubair Hossain');
      setNotes('');
      setTagsInput('');
    }
    setError('');
  }, [editingLead, defaultStage, isOpen]);

  if (!isOpen) return null;

  // When stage changes, automatically suggest probability if not editing
  const handleStageChange = (newStage: CRMLeadStage) => {
    setStage(newStage);
    const probMap: Record<CRMLeadStage, number> = {
      new: 20,
      contacted: 40,
      qualified: 60,
      proposal: 70,
      negotiation: 85,
      won: 100,
      lost: 0
    };
    setProbability(probMap[newStage]);
  };

  const handleSelectExistingOrg = (orgId: string) => {
    const found = organizations.find(o => o.id === orgId);
    if (found) {
      setCompanyName(found.name);
      setContactName(found.contactPersonName);
      setEmail(found.email);
      setMobile(found.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an opportunity/lead title');
      return;
    }
    if (!contactName.trim() && !companyName.trim()) {
      setError('Please provide at least a contact person name or company name');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingLead) {
      updateLead(editingLead.id, {
        title: title.trim(),
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        dealValue: Number(dealValue) || 0,
        stage,
        probability: Number(probability) || 0,
        source,
        priority,
        assignedTo: assignedTo.trim(),
        expectedCloseDate,
        notes: notes.trim(),
        tags
      });
    } else {
      addLead({
        title: title.trim(),
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        dealValue: Number(dealValue) || 0,
        stage,
        probability: Number(probability) || 0,
        source,
        priority,
        assignedTo: assignedTo.trim(),
        expectedCloseDate: expectedCloseDate || new Date().toISOString().split('T')[0],
        notes: notes.trim(),
        tags
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingLead ? 'Edit Lead Opportunity' : 'Create New Lead Opportunity'}
              </h2>
              <p className="text-xs text-slate-500">Track deal pipeline, win probability, and sales communications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick autofill from existing Organization */}
          {organizations.length > 0 && !editingLead && (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
              <label className="block text-[11px] font-bold text-blue-900 mb-1">
                Link to Existing Corporate Client (Optional)
              </label>
              <select
                onChange={e => e.target.value && handleSelectExistingOrg(e.target.value)}
                className="w-full text-xs bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                <option value="">-- Or enter new lead details below --</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name} ({org.industry})</option>
                ))}
              </select>
            </div>
          )}

          {/* Deal Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity / Deal Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 50x Smart Android POS Terminals with Cloud Sync"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
            />
          </div>

          {/* Company & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Building className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Company / Organization Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Retail Group Ltd."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <User className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Key Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Mail className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Phone / Mobile Number
              </label>
              <input
                type="text"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="+880 1711-000000"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Deal Value & Probability */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <DollarSign className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Deal Value ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={dealValue}
                onChange={e => setDealValue(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pipeline Stage</label>
              <select
                value={stage}
                onChange={e => handleStageChange(e.target.value as CRMLeadStage)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">New Inbound</option>
                <option value="contacted">Contacted / Discovery</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won (Closed)</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Win Probability ({probability}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={probability}
                onChange={e => setProbability(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2.5"
              />
            </div>
          </div>

          {/* Priority, Source, Assigned To */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as CRMLeadPriority)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent 🔥</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lead Source</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as CRMLeadSource)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="website">Website / Inbound Form</option>
                <option value="in_store">In-Store Walk-in Inquiry</option>
                <option value="referral">Client Referral</option>
                <option value="partner">Vendor / Hardware Partner</option>
                <option value="exhibition">Trade Expo / Event</option>
                <option value="cold_call">Direct Outbound Call</option>
                <option value="campaign">Marketing Campaign</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Sales Rep</label>
              <input
                type="text"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                placeholder="e.g. Zubair Hossain"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Expected Close Date & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Target Close Date
              </label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={e => setExpectedCloseDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Tag className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. POS Terminal, Thermal Paper, Multi-Store"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deal Notes & Requirements</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Summary of client expectations, required hardware specifications, budget limits, or follow-up schedule..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-200 transition-all cursor-pointer"
            >
              {editingLead ? 'Save Changes' : 'Create Lead Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
