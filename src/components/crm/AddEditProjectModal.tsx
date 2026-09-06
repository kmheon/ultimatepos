import React, { useState, useEffect } from 'react';
import { X, Wrench, Building2, Calendar, DollarSign, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { CRMProject, CRMProjectType, CRMProjectRenewalStatus, CRMSLALevel } from '../../types';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';

interface AddEditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject?: CRMProject | null;
}

export const AddEditProjectModal: React.FC<AddEditProjectModalProps> = ({
  isOpen,
  onClose,
  editingProject
}) => {
  const { settings } = usePOS();
  const { addProject, updateProject, organizations } = useCRM();

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [type, setType] = useState<CRMProjectType>('amc_maintenance');
  const [contractTier, setContractTier] = useState('Enterprise Platinum 24/7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [renewalStatus, setRenewalStatus] = useState<CRMProjectRenewalStatus>('active');
  const [contractValue, setContractValue] = useState<number>(36000);
  const [billingCycle, setBillingCycle] = useState<'annual' | 'quarterly' | 'monthly' | 'one_time'>('annual');
  const [slaLevel, setSlaLevel] = useState<CRMSLALevel>('4hr_onsite');
  const [projectLead, setProjectLead] = useState('Engr. Kamal Hossain');
  const [progress, setProgress] = useState<number>(25);
  const [totalVisitsPlanned, setTotalVisitsPlanned] = useState<number>(4);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editingProject) {
      const today = new Date();
      setStartDate(today.toISOString().split('T')[0]);
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setEndDate(nextYear.toISOString().split('T')[0]);
    }
  }, [editingProject]);

  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title);
      setClientId(editingProject.clientId || '');
      setClientName(editingProject.clientName);
      setType(editingProject.type);
      setContractTier(editingProject.contractTier);
      setStartDate(editingProject.startDate);
      setEndDate(editingProject.endDate);
      setRenewalStatus(editingProject.renewalStatus);
      setContractValue(editingProject.contractValue);
      setBillingCycle(editingProject.billingCycle);
      setSlaLevel(editingProject.slaLevel);
      setProjectLead(editingProject.projectLead);
      setProgress(editingProject.progress);
      setTotalVisitsPlanned(editingProject.totalVisitsPlanned || 4);
      setNotes(editingProject.notes || '');
    } else {
      setTitle('');
      setClientId('');
      setClientName('');
      setType('amc_maintenance');
      setContractTier('Gold Partner SLA');
      setRenewalStatus('active');
      setContractValue(36000);
      setBillingCycle('annual');
      setSlaLevel('4hr_onsite');
      setProjectLead('Engr. Kamal Hossain');
      setProgress(20);
      setTotalVisitsPlanned(4);
      setNotes('');
    }
    setError('');
  }, [editingProject, isOpen]);

  if (!isOpen) return null;

  const handleSelectOrg = (id: string) => {
    setClientId(id);
    const org = organizations.find(o => o.id === id);
    if (org) {
      setClientName(org.name);
      if (org.amcTier === 'enterprise_platinum') {
        setContractTier('Enterprise Platinum 24/7 SLA');
        setSlaLevel('24_7_dedicated');
      } else if (org.amcTier === 'gold_partner') {
        setContractTier('Gold Business SLA');
        setSlaLevel('4hr_onsite');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project / AMC Title is required');
      return;
    }
    if (!clientName.trim()) {
      setError('Client or Organization Name is required');
      return;
    }

    if (editingProject) {
      updateProject(editingProject.id, {
        title: title.trim(),
        clientId,
        clientName: clientName.trim(),
        type,
        contractTier,
        startDate,
        endDate,
        renewalStatus,
        contractValue: Number(contractValue) || 0,
        billingCycle,
        slaLevel,
        projectLead: projectLead.trim(),
        progress: Number(progress) || 0,
        totalVisitsPlanned: Number(totalVisitsPlanned) || 1,
        notes: notes.trim()
      });
    } else {
      addProject({
        title: title.trim(),
        clientId,
        clientName: clientName.trim(),
        clientType: 'b2b',
        type,
        contractTier,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
        renewalStatus,
        contractValue: Number(contractValue) || 0,
        billingCycle,
        slaLevel,
        projectLead: projectLead.trim(),
        progress: Number(progress) || 0,
        notes: notes.trim(),
        visitsCompleted: 0,
        totalVisitsPlanned: Number(totalVisitsPlanned) || 4
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
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingProject ? 'Edit AMC Contract / Project' : 'New Client Project & AMC Agreement'}
              </h2>
              <p className="text-xs text-slate-500">Service Level Agreement terms, hardware audit schedule, and milestones</p>
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

          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contract / Project Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Apex Supermarkets 34-Store POS Maintenance & Audit"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
            />
          </div>

          {/* Client Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Building2 className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Select Existing Client Organization
              </label>
              <select
                value={clientId}
                onChange={e => handleSelectOrg(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Corporate Client --</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client Legal Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="e.g. Apex Retail & Supermarket Chain Ltd."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contract Type & SLA Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agreement / Project Classification</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as CRMProjectType)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="amc_maintenance">Annual Maintenance Contract (AMC)</option>
                <option value="infrastructure_deployment">Enterprise Infrastructure Deployment</option>
                <option value="hardware_rollout">Hardware Fleet Upgrade & Rollout</option>
                <option value="custom_integration">Custom Software & API Integration</option>
                <option value="field_support">Dedicated On-Site Field Support SLA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contract Package Tier</label>
              <input
                type="text"
                value={contractTier}
                onChange={e => setContractTier(e.target.value)}
                placeholder="e.g. Enterprise Platinum 24/7"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Financials: Contract Value & Billing Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <DollarSign className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Contract Total Value ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={contractValue}
                onChange={e => setContractValue(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={e => setBillingCycle(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="annual">Annual Lump Sum</option>
                <option value="quarterly">Quarterly Installments</option>
                <option value="monthly">Monthly Retainer</option>
                <option value="one_time">Milestone / One-Time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                SLA Response Level
              </label>
              <select
                value={slaLevel}
                onChange={e => setSlaLevel(e.target.value as CRMSLALevel)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24_7_dedicated">24/7 Dedicated Emergency</option>
                <option value="4hr_onsite">4-Hour Critical On-Site</option>
                <option value="next_business_day">Next Business Day (NBD)</option>
                <option value="standard_48hr">Standard 48-Hour Routine</option>
              </select>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Expiry Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Renewal / Status</label>
              <select
                value={renewalStatus}
                onChange={e => setRenewalStatus(e.target.value as CRMProjectRenewalStatus)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active & Running</option>
                <option value="expiring_soon">Expiring Soon (Under 30 Days)</option>
                <option value="renewed">Renewed for Next Cycle</option>
                <option value="pending">Pending Client Signature</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Project Lead & Total Audits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Lead Engineer</label>
              <input
                type="text"
                value={projectLead}
                onChange={e => setProjectLead(e.target.value)}
                placeholder="Engr. Kamal Hossain"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Total Planned Audits/Visits
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={totalVisitsPlanned}
                onChange={e => setTotalVisitsPlanned(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Progress ({progress}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={e => setProgress(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2.5"
              />
            </div>
          </div>

          {/* Scope & Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Terms, Scope of Work & SLAs</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Detailed coverage: on-site printer repairs, replacement parts inclusions, quarterly scheduled audits, emergency hotline availability..."
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
              {editingProject ? 'Update Agreement' : 'Create Project / AMC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
