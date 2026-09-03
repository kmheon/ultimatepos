import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  FileCheck,
  Star,
  User,
  ShieldCheck,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { ServiceScheduleSlot } from '../../../types';

interface CompleteVisitModalProps {
  slot: ServiceScheduleSlot;
  onClose: () => void;
  onComplete: (updates: Partial<ServiceScheduleSlot>) => void;
}

export const CompleteVisitModal: React.FC<CompleteVisitModalProps> = ({
  slot,
  onClose,
  onComplete,
}) => {
  const [completionNotes, setCompletionNotes] = useState<string>(
    slot.notes || 'Full on-site testing and diagnostic validation completed successfully. Systems operational.'
  );
  const [clientSignatory, setClientSignatory] = useState<string>(
    slot.contactPerson || 'Engr. Kamal Uddin (Client Facility Lead)'
  );
  const [csatRating, setCsatRating] = useState<number>(5);
  const [partsUsed, setPartsUsed] = useState<string>('Cat6A Shielded Patch Cords, SFP+ Optical Module');
  const [checklist, setChecklist] = useState(
    slot.checklist?.map(item => ({ ...item, completed: true })) || [
      { id: '1', task: 'Hardware physical mounting & cable termination verified', completed: true },
      { id: '2', task: 'Diagnostic impedance, signal throughput & decibel audit passed', completed: true },
      { id: '3', task: 'Client control room live telemetry sync confirmed', completed: true },
      { id: '4', task: 'Work area cleaned and surplus packing removed from server hall', completed: true },
    ]
  );

  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(c => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reportId = `CSR-BD-${slot.workOrderNumber ? slot.workOrderNumber.replace(/[^0-9]/g, '') : '2026'}-01`;

    onComplete({
      status: 'completed',
      dispatchStatus: 'Completed',
      progress: 100,
      progressPercent: 100,
      jobStatus: 'Completed & Client Sign-off Executed',
      checklist,
      serviceReport: {
        reportId,
        signedBy: clientSignatory,
        signedAt: new Date().toISOString().split('T')[0],
        completionNotes,
        customerFeedback: `${csatRating} Stars - Excellent service delivery and clean cabling standards.`,
        partsReplaced: partsUsed ? partsUsed.split(',').map(p => p.trim()) : [],
        testResultsPassed: true,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Complete Field Service Visit
              </h3>
              <p className="text-xs text-slate-500">
                Client Sign-Off & Handover • {slot.workOrderNumber || 'WO-2026-0041'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Work Order Summary */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Client Enterprise:</span>
              <span className="font-bold text-slate-900">{slot.customerName}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Site Location:</span>
              <span className="text-slate-800">{slot.siteName}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Lead Field Engineer:</span>
              <span className="text-blue-700 font-bold">{slot.technicianName}</span>
            </div>
          </div>

          {/* Checklist Verification */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Final Quality Verification Checklist *
            </label>
            <div className="space-y-1.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    item.completed
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklist(item.id)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium select-none">{item.task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Resolution Notes */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Technical Resolution & Diagnostic Summary *
            </label>
            <textarea
              rows={3}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
              placeholder="Detail work performed, calibration results, and system status..."
              required
            />
          </div>

          {/* Parts / Consumables Consumed */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-slate-500" /> Consumed Spare Parts / Consumables
            </label>
            <input
              type="text"
              value={partsUsed}
              onChange={(e) => setPartsUsed(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="e.g. RJ45 Connectors, 10G SFP+ Transceiver, Cat6A patch cord"
            />
          </div>

          {/* Client Acceptance Block */}
          <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
            <h4 className="text-[11px] font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> Client Representative Sign-Off
            </h4>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Client Signatory Name & Designation *</label>
              <input
                type="text"
                value={clientSignatory}
                onChange={(e) => setClientSignatory(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-slate-700">Client CSAT Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCsatRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-4 h-4 ${star <= csatRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" /> Complete & Execute Sign-Off
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
