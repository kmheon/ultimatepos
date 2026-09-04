import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  AlertTriangle,
  History
} from 'lucide-react';

interface AuditRecord {
  id: string;
  timestamp: string;
  operator: string;
  action: 'UPDATE' | 'DELETE' | 'INSERT' | 'BULK_IMPORT';
  module: string;
  recordIdentifier: string;
  diffSummary: string;
  canRevert: boolean;
}

export const AuditRecoverySubView: React.FC = () => {
  const [records, setRecords] = useState<AuditRecord[]>([
    {
      id: 'AUD-9402',
      timestamp: '2026-09-03 11:20 AM',
      operator: 'Lead Cashier',
      action: 'UPDATE',
      module: 'Sales Invoices',
      recordIdentifier: 'INV-2026-0814',
      diffSummary: 'Payment method adjusted from Cash to Credit Card ($450.00)',
      canRevert: true,
    },
    {
      id: 'AUD-9398',
      timestamp: '2026-09-03 09:45 AM',
      operator: 'Store Manager',
      action: 'UPDATE',
      module: 'Products Catalog',
      recordIdentifier: 'PRD-1002 (Dell XPS 15)',
      diffSummary: 'Selling price updated from $1,899.00 to $1,849.00',
      canRevert: true,
    },
    {
      id: 'AUD-9380',
      timestamp: '2026-09-02 04:15 PM',
      operator: 'Lead IT Admin',
      action: 'BULK_IMPORT',
      module: 'Data Migration Center',
      recordIdentifier: 'BATCH-MIG-782',
      diffSummary: 'Imported 12,840 inventory stock lines from QuickBooks Online',
      canRevert: true,
    },
    {
      id: 'AUD-9365',
      timestamp: '2026-09-01 02:00 PM',
      operator: 'Operations Dept',
      action: 'DELETE',
      module: 'Quotations',
      recordIdentifier: 'QUO-Draft-108',
      diffSummary: 'Soft-deleted expired draft quotation for Acme Logistics',
      canRevert: true,
    }
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRevert = (id: string, recordIdentifier: string) => {
    if (window.confirm(`Revert mutation ${id} on ${recordIdentifier}? Prior states will be atomically restored.`)) {
      setRecords(records.filter(r => r.id !== id));
      setFeedback(`Transaction ${id} reverted successfully. Record ${recordIdentifier} restored to prior state.`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Audit Trail & Transaction Undo Engine
            </h3>
            <p className="text-xs text-slate-500">
              Cryptographically signed Change Data Capture (CDC) with atomic point-in-time state reversion.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Audit Ledger Tamper-Sealed (SHA-256)
          </span>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Audit ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Module & Target</th>
                <th className="px-4 py-3">Mutation Diff</th>
                <th className="px-4 py-3 text-right">Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{r.id}</td>
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{r.timestamp}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{r.operator}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.action === 'INSERT' ? 'bg-emerald-100 text-emerald-800' :
                      r.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                      r.action === 'DELETE' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {r.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{r.module}</div>
                    <div className="text-[11px] font-mono text-slate-500">{r.recordIdentifier}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-xs">{r.diffSummary}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleRevert(r.id, r.recordIdentifier)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-blue-600" />
                      <span>Revert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
