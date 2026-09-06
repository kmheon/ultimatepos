import React, { useState } from 'react';
import { X, CheckCircle2, Wrench, Calendar, User, FileText } from 'lucide-react';
import { CRMProject } from '../../types';
import { useCRM } from '../../context/CRMContext';

interface LogMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CRMProject | null;
}

export const LogMaintenanceModal: React.FC<LogMaintenanceModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const { logMaintenanceVisit } = useCRM();
  const [engineerName, setEngineerName] = useState(project?.projectLead || 'Engr. Kamal Hossain');
  const [visitNotes, setVisitNotes] = useState('');
  const [checklist, setChecklist] = useState({
    hardwareCleaned: true,
    diagnosticsPassed: true,
    firmwareUpdated: false,
    paperSensorsRecalibrated: true,
    clientSignatureObtained: true
  });

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const summary = [
      visitNotes ? `Notes: ${visitNotes}` : '',
      `Inspector: ${engineerName}`,
      `Completed checks: ${Object.entries(checklist).filter(([, v]) => v).map(([k]) => k).join(', ')}`
    ].filter(Boolean).join(' | ');

    logMaintenanceVisit(project.id, summary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Log Maintenance Visit</h2>
              <p className="text-xs text-slate-500">{project.projectNumber} • {project.clientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <span className="text-xs text-emerald-800 font-semibold">Visit Progress:</span>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full">
              Logging Visit #{project.visitsCompleted + 1} of {project.totalVisitsPlanned}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              <User className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Service Engineer / Technician
            </label>
            <input
              type="text"
              required
              value={engineerName}
              onChange={e => setEngineerName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Service Audit Checklist</label>
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.hardwareCleaned}
                  onChange={e => setChecklist({ ...checklist, hardwareCleaned: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Hardware cleaned & thermal heads dusted</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.diagnosticsPassed}
                  onChange={e => setChecklist({ ...checklist, diagnosticsPassed: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Full diagnostic hardware test passed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.paperSensorsRecalibrated}
                  onChange={e => setChecklist({ ...checklist, paperSensorsRecalibrated: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Cash drawer & printer sensors recalibrated</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.clientSignatureObtained}
                  onChange={e => setChecklist({ ...checklist, clientSignatureObtained: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Client on-site acceptance signature obtained</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              <FileText className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Visit Notes & Service Remarks
            </label>
            <textarea
              rows={3}
              value={visitNotes}
              onChange={e => setVisitNotes(e.target.value)}
              placeholder="e.g. Inspected 8 POS registers at flagship branch. Replaced 1 roller gear; all systems optimal."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-xs shadow-emerald-200"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete & Log Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
