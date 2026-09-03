import React from 'react';
import { X, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { MigrationHistoryRecord } from '../../types/migration';

interface RollbackConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MigrationHistoryRecord | null;
  onConfirmRollback: (migrationId: string) => void;
}

export const RollbackConfirmModal: React.FC<RollbackConfirmModalProps> = ({
  isOpen,
  onClose,
  record,
  onConfirmRollback,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm shadow-rose-200">
            <RotateCcw className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Execute System Rollback</h3>
            <p className="text-xs text-slate-500 mt-1">
              Revert database state to pre-migration snapshot <strong className="text-slate-800">{record.snapshotId}</strong>
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Impact Assessment
            </div>
            <p className="leading-relaxed">
              This operation will purge the <strong>{record.recordsImported} records</strong> imported during batch <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">{record.migrationId}</code> from <strong>{record.sourceSystem}</strong> and reinstate the exact pre-migration baseline.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Migration ID</span>
              <span className="font-bold text-slate-800 font-mono text-[11px]">{record.migrationId}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Executed Date</span>
              <span className="font-bold text-slate-800 text-[11px]">{record.date}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmRollback(record.migrationId);
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Confirm Rollback
          </button>
        </div>
      </div>
    </div>
  );
};
