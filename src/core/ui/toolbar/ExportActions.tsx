import React from 'react';
import { Download, FileSpreadsheet, Printer, Share2 } from 'lucide-react';

interface ExportActionsProps {
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  onExportCSV,
  onExportPDF,
  onPrint,
  onShare,
}) => {
  return (
    <div className="flex items-center gap-2">
      {onExportCSV && (
        <button
          type="button"
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Export CSV"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">CSV</span>
        </button>
      )}
      {onExportPDF && (
        <button
          type="button"
          onClick={onExportPDF}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Export PDF"
        >
          <Download className="w-3.5 h-3.5 text-red-600" />
          <span className="hidden sm:inline">PDF</span>
        </button>
      )}
      {onPrint && (
        <button
          type="button"
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Print"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
        </button>
      )}
      {onShare && (
        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Share"
        >
          <Share2 className="w-3.5 h-3.5 text-blue-600" />
        </button>
      )}
    </div>
  );
};
