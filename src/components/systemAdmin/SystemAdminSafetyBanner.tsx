import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Info, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Database, 
  FileText,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface SystemAdminSafetyBannerProps {
  pageTitle?: string;
}

export const SystemAdminSafetyBanner: React.FC<SystemAdminSafetyBannerProps> = ({ 
  pageTitle = 'Operational & Maintenance Tools' 
}) => {
  const [acknowledged, setAcknowledged] = useState<boolean>(() => {
    return localStorage.getItem('sys_admin_safety_ack') === 'true';
  });
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);

  const handleContinue = () => {
    localStorage.setItem('sys_admin_safety_ack', 'true');
    setAcknowledged(true);
  };

  const handleResetAck = () => {
    localStorage.setItem('sys_admin_safety_ack', 'false');
    setAcknowledged(false);
  };

  return (
    <>
      {/* Compact Information Banner */}
      {!acknowledged ? (
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 sm:p-4 text-slate-100 shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    System Administration
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    High-Impact Operational Controls
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  These tools can modify, migrate, restore or permanently affect business data. Only authorized administrators should perform these actions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setShowLearnMoreModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              >
                Learn More
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-slate-100 hover:bg-white shadow-xs transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Acknowledged / Minimized subtle bar (remembers choice, non-intrusive) */
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
              Administrator Only
            </span>
            <span className="text-slate-400 text-[11px] truncate">
              System Administration safeguards active &bull; Policy acknowledged
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowLearnMoreModal(true)}
              className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Safety Guidelines
            </button>
            <button
              type="button"
              onClick={handleResetAck}
              className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
              title="Expand full safety banner"
            >
              Expand
            </button>
          </div>
        </div>
      )}

      {/* Learn More Modal */}
      {showLearnMoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-slate-200 text-[11px] font-bold px-2 py-0.5 rounded">
                  System Administration
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Standard Operating & Safety Policy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLearnMoreModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pre-Flight Automated Snapshots
                </h4>
                <p>
                  Before running migrations, imports, or database alterations, the system automatically writes an encrypted rollback snapshot to the local and cloud vaults.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  Transaction Isolation & Rollback
                </h4>
                <p>
                  Migration pipelines execute inside atomic database transactions (`BEGIN ... COMMIT`). If an unexpected failure occurs, all mutations are immediately rolled back.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Immutable Audit Logs
                </h4>
                <p>
                  All administrative executions, including data wipes, restores, and batch schema changes, are permanently logged with operator identity, timestamp, and payload hash.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  handleContinue();
                  setShowLearnMoreModal(false);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
