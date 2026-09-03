import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileCode, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MigrationModule } from '../../types/migration';
import { SUPPORTED_MODULES, MigrationTemplateGenerator } from '../../services/migration/migrationEngine.service';

interface DownloadTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadTemplatesModal: React.FC<DownloadTemplatesModalProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');
  const [downloadedModule, setDownloadedModule] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = (moduleId: MigrationModule) => {
    MigrationTemplateGenerator.downloadTemplate(moduleId, selectedFormat);
    setDownloadedModule(moduleId);
    setTimeout(() => setDownloadedModule(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Download Import Templates</h2>
              <p className="text-xs text-slate-500">Official pre-structured Nebula ERP master data and opening balance templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Format Selector */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800">Target File Format</span>
              <p className="text-[11px] text-slate-500">Choose CSV for Excel editing or JSON for programmatic pipelines</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFormat('csv')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFormat === 'csv'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV (Excel)
              </button>
              <button
                onClick={() => setSelectedFormat('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFormat === 'json'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" /> JSON (API)
              </button>
            </div>
          </div>

          {/* Module Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORTED_MODULES.map((mod) => {
              const isDownloaded = downloadedModule === mod.id;
              return (
                <div
                  key={mod.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs truncate">{mod.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-medium">
                        {mod.requiredFields.length} Required
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{mod.description}</p>
                  </div>

                  <button
                    onClick={() => handleDownload(mod.id)}
                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      isDownloaded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                    }`}
                  >
                    {isDownloaded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" /> Download
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Guidelines info */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Templates contain standardized UTF-8 headers with sample enterprise values. Do not rename column headers. Nebula ERP's migration engine will automatically validate character encodings, decimal formats, and unique constraint indices upon file upload.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
