import React from 'react';
import { 
  Plus, 
  ClipboardCheck, 
  CalendarPlus, 
  Cpu, 
  FileText, 
  Receipt,
  Sparkles
} from 'lucide-react';

interface QuickActionsToolbarProps {
  onNewServiceRequest: () => void;
  onNewWorkOrder: () => void;
  onScheduleVisit: () => void;
  onRegisterAsset: () => void;
  onCreateQuote: () => void;
  onGenerateInvoice: () => void;
}

export const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  onNewServiceRequest,
  onNewWorkOrder,
  onScheduleVisit,
  onRegisterAsset,
  onCreateQuote,
  onGenerateInvoice,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Operations Quick Actions
        </span>
        <span className="text-[11px] text-slate-500">Shortcuts</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          onClick={onNewServiceRequest}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all shadow-blue-200 text-left"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">New Service Request</span>
        </button>

        <button
          onClick={onNewWorkOrder}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all border border-slate-200 text-left"
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">New Work Order</span>
        </button>

        <button
          onClick={onScheduleVisit}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all border border-slate-200 text-left"
        >
          <CalendarPlus className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <span className="truncate">Schedule Visit</span>
        </button>

        <button
          onClick={onRegisterAsset}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all border border-slate-200 text-left"
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">Register Asset</span>
        </button>

        <button
          onClick={onCreateQuote}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all border border-slate-200 text-left"
        >
          <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">Create Quote</span>
        </button>

        <button
          onClick={onGenerateInvoice}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all border border-slate-200 text-left"
        >
          <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Generate Invoice</span>
        </button>
      </div>
    </div>
  );
};
