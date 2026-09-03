import React from 'react';
import { X, BookOpen, CheckCircle2, ShieldAlert, Database, Layers, ArrowRight, FileText, Lock } from 'lucide-react';

interface MigrationDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MigrationDocumentationModal: React.FC<MigrationDocumentationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Nebula ERP Migration Documentation</h2>
              <p className="text-xs text-slate-500">Enterprise migration architecture, security policies, and schema specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-600">
          {/* Architecture Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              1. Modular ETL Architecture
            </h3>
            <p className="leading-relaxed">
              Nebula ERP isolates all ingestion logic inside a stateless <code>MigrationEngine</code> service. The UI never mutates database entities directly. Every data payload traverses a 4-phase lifecycle:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Phase 1: Ingestion</span>
                <p className="text-[11px] text-slate-500">Extracts flat CSV, JSON bundles, or raw database dumps.</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-800 block mb-0.5">Phase 2: Validation</span>
                <p className="text-[11px] text-blue-600">Audits 9 integrity gates including negative stock & GL codes.</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="font-bold text-indigo-800 block mb-0.5">Phase 3: Transform</span>
                <p className="text-[11px] text-indigo-600">Standardizes SKUs, dates, currencies and default values.</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-800 block mb-0.5">Phase 4: Load & Log</span>
                <p className="text-[11px] text-emerald-600">Commits atomic batch transaction with SHA-256 audit hash.</p>
              </div>
            </div>
          </div>

          {/* Security & Access Controls */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              2. Security & RBAC Enforcement
            </h3>
            <ul className="space-y-1.5 pl-2 list-disc list-inside">
              <li><strong className="text-slate-800">Administrator Privilege Gate:</strong> Only authenticated system administrators can trigger or commit migrations.</li>
              <li><strong className="text-slate-800">Immutable Audit Trail:</strong> Every batch execution records the administrator ID, source IP address, payload byte size, and cryptographic session fingerprint.</li>
              <li><strong className="text-slate-800">Background Worker Jobs:</strong> Payloads exceeding 5,000 records execute asynchronously via background queue workers with resumable checkpoints.</li>
            </ul>
          </div>

          {/* Rollback & Snapshots */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              3. Automatic Snapshots & Instant Rollback
            </h3>
            <p className="leading-relaxed">
              Prior to writing any imported records into the live database, Nebula ERP automatically generates a point-in-time <strong>Backup Snapshot</strong>. If anomalies occur during testing, clicking <em>Rollback</em> restores the database state within milliseconds and logs a critical audit reversal event.
            </p>
          </div>

          {/* Supported Sources */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              4. Supported Legacy Systems
            </h3>
            <p className="leading-relaxed">
              Pre-configured schemas are bundled for QuickBooks, Tally ERP, Odoo, ERPNext, Zoho Books, Busy Accounting, Sage, SAP Business One, Oracle NetSuite, Microsoft Dynamics, Legacy POS, Retail POS, Custom CSV, and direct relational databases (MySQL, MariaDB, SQL Server, PostgreSQL, SQLite).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
