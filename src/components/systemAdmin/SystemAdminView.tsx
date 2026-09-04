import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Database, 
  HardDrive, 
  ArrowDownUp, 
  Wrench, 
  FileText, 
  Activity, 
  CalendarClock, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Server,
  Layers,
  Sparkles,
  RotateCcw,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { SystemAdminGuard } from './SystemAdminGuard';
import { SystemAdminSafetyBanner } from './SystemAdminSafetyBanner';
import { EnterprisePlaceholderView, EnterprisePlaceholderType } from './EnterprisePlaceholderView';
import { UltimatePOSImportView } from '../import/UltimatePOSImportView';
import { BackupRestoreView } from '../dataManagement/BackupRestoreView';
import { ImportExportSubView } from '../dataManagement/ImportExportSubView';

import { updateBrowserURL } from '../../utils/navigationRouter';

export type SystemAdminSubTab = 
  | 'overview'
  | 'data_migration'
  | 'backup_restore'
  | 'import_export'
  | 'database_utilities'
  | 'system_maintenance'
  | 'audit_logs'
  | 'system_health'
  | 'scheduler_jobs';

interface SystemAdminViewProps {
  initialSubTab?: SystemAdminSubTab;
}

export const SystemAdminView: React.FC<SystemAdminViewProps> = ({ 
  initialSubTab = 'overview' 
}) => {
  const { setActiveTab } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<SystemAdminSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const navItems: { id: SystemAdminSubTab; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    { id: 'overview', label: 'System Overview', icon: <Server className="w-4 h-4" /> },
    { id: 'data_migration', label: 'Data Migration', icon: <Database className="w-4 h-4" />, badge: '30 Sources', badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'backup_restore', label: 'Backup & Restore', icon: <HardDrive className="w-4 h-4" />, badge: 'Vault', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'import_export', label: 'Import / Export', icon: <ArrowDownUp className="w-4 h-4" /> },
    { id: 'database_utilities', label: 'Database Utilities', icon: <Database className="w-4 h-4" />, badge: 'Future', badgeColor: 'bg-slate-200 text-slate-700' },
    { id: 'system_maintenance', label: 'System Maintenance', icon: <Wrench className="w-4 h-4" />, badge: 'Future', badgeColor: 'bg-slate-200 text-slate-700' },
    { id: 'audit_logs', label: 'Audit Logs', icon: <FileText className="w-4 h-4" />, badge: 'Future', badgeColor: 'bg-slate-200 text-slate-700' },
    { id: 'system_health', label: 'System Health', icon: <Activity className="w-4 h-4" />, badge: 'Future', badgeColor: 'bg-slate-200 text-slate-700' },
    { id: 'scheduler_jobs', label: 'Scheduler & Jobs', icon: <CalendarClock className="w-4 h-4" />, badge: 'Future', badgeColor: 'bg-slate-200 text-slate-700' },
  ];

  return (
    <SystemAdminGuard>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
        {/* Module Header with Slate / Graphite Accent */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                Administrator Only
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Nebula ERP Core Operations
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-slate-800" />
              <span>System Administration</span>
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl">
              Dedicated operational and maintenance tools for data migration, automated backup vaults, database schema governance, and systems resilience.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Privileged Console</span>
            </span>
          </div>
        </div>

        {/* Safety Banner (Compact Information Banner with Single Acknowledgement) */}
        <SystemAdminSafetyBanner pageTitle={activeSubTab} />

        {/* Horizontal Navigation Pills (Subtle Slate/Graphite Accent) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSubTab(item.id);
                  updateBrowserURL('system-admin', item.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Rendering */}
        <div className="space-y-6">
          {/* 1. System Overview Dashboard */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Operational Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold">Migration Engine</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-xl font-black text-slate-900">30 Connectors</div>
                  <p className="text-[11px] text-slate-600">Active ETL pipeline ready for SQL dumps and CSV bundles</p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('data_migration')}
                    className="text-xs font-bold text-slate-900 hover:text-blue-600 inline-flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Launch Migration</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold">Backup Vault</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Protected</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">AES-256</div>
                  <p className="text-[11px] text-slate-600">Last automated snapshot taken today at 02:00 AM</p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('backup_restore')}
                    className="text-xs font-bold text-slate-900 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Manage Vault</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold">Import / Export</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Online</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">Round-Trip</div>
                  <p className="text-[11px] text-slate-600">CSV, JSON, and Excel bulk master catalog exports</p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('import_export')}
                    className="text-xs font-bold text-slate-900 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Export Records</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold">Database Relational Health</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">0.8% Bloat</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">Optimal</div>
                  <p className="text-[11px] text-slate-600">PostgreSQL schema, foreign key constraints healthy</p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('database_utilities')}
                    className="text-xs font-bold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Utilities Preview</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Architecture & Separation Information Card */}
              <div className="bg-white rounded-2xl border border-slate-300 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded">
                    Enterprise ERP Architecture
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">
                    Separation of Business Settings vs. High-Impact Administrative Tools
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Following enterprise ERP architecture best practices, operational data tools (Data Migration, Automated Backup & Restore, Import/Export pipelines, and Database Maintenance) have been moved into this dedicated <strong>System Administration</strong> module. Standard business configurations (Company Profile, Tax Rates, Printers, Invoicing) remain cleanly segregated within <strong>Settings</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">System Administration (Operational)</span>
                    <p className="text-slate-500 text-[11px]">
                      Data migration engines, rollback snapshots, database indexing, scheduler workers, and disaster recovery.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">Settings (Application Configuration)</span>
                    <p className="text-slate-500 text-[11px]">
                      Company metadata, currency & localization, invoice prefixes, barcode parameters, and tax brackets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Operational Tools Quick Access Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  System Administration Operational Tools
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div 
                    onClick={() => setActiveSubTab('data_migration')}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Database className="w-5 h-5 text-slate-700 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Production Ready
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">Data Migration</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Full ETL pipeline for 30+ ERP and POS systems with automatic schema mapping, data sanitization, and atomic rollback.
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveSubTab('backup_restore')}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <HardDrive className="w-5 h-5 text-slate-700 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Active Vault
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">Backup & Restore</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Encrypted point-in-time snapshots, disaster recovery downloads, and granular module restoration.
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveSubTab('import_export')}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <ArrowDownUp className="w-5 h-5 text-slate-700 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Operational
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-slate-800 transition-colors">Import / Export</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Batch catalog import and export in CSV, JSON, and Excel formats with format validation.
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveSubTab('database_utilities')}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Database className="w-5 h-5 text-slate-700 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        Roadmap Q4
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-slate-800 transition-colors">Database Utilities</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Relational tuning, VACUUM FULL optimization, index rebuilds, and foreign key verification.
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveSubTab('system_maintenance')}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Wrench className="w-5 h-5 text-slate-700 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        Roadmap Q4
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-slate-800 transition-colors">System Maintenance</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Maintenance mode switcher, session cache clearing, temporary artifact pruning, and log rotation.
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveSubTab('audit_logs')}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5 text-slate-700 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        Roadmap Q4
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-slate-800 transition-colors">Audit Logs</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Immutable cryptographic event stream tracking privileged operations, schema changes, and role elevations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Data Migration */}
          {activeSubTab === 'data_migration' && (
            <UltimatePOSImportView />
          )}

          {/* 3. Backup & Restore */}
          {activeSubTab === 'backup_restore' && (
            <BackupRestoreView onNavigateSubTab={(tab) => setActiveSubTab(tab as SystemAdminSubTab)} />
          )}

          {/* 4. Import / Export */}
          {activeSubTab === 'import_export' && (
            <ImportExportSubView onNavigateSubTab={(tab) => setActiveSubTab(tab as SystemAdminSubTab)} />
          )}

          {/* 5. Database Utilities (Future Placeholder) */}
          {activeSubTab === 'database_utilities' && (
            <EnterprisePlaceholderView 
              type="database_utilities" 
              onNavigateTab={(tab) => setActiveSubTab(tab as SystemAdminSubTab)} 
            />
          )}

          {/* 6. System Maintenance (Future Placeholder) */}
          {activeSubTab === 'system_maintenance' && (
            <EnterprisePlaceholderView 
              type="system_maintenance" 
              onNavigateTab={(tab) => setActiveSubTab(tab as SystemAdminSubTab)} 
            />
          )}

          {/* 7. Audit Logs (Future Placeholder) */}
          {activeSubTab === 'audit_logs' && (
            <EnterprisePlaceholderView 
              type="audit_logs" 
              onNavigateTab={(tab) => setActiveSubTab(tab as SystemAdminSubTab)} 
            />
          )}

          {/* 8. System Health (Future Placeholder) */}
          {activeSubTab === 'system_health' && (
            <EnterprisePlaceholderView 
              type="system_health" 
              onNavigateTab={(tab) => setActiveSubTab(tab as SystemAdminSubTab)} 
            />
          )}

          {/* 9. Scheduler & Jobs (Future Placeholder) */}
          {activeSubTab === 'scheduler_jobs' && (
            <EnterprisePlaceholderView 
              type="scheduler_jobs" 
              onNavigateTab={(tab) => setActiveSubTab(tab as SystemAdminSubTab)} 
            />
          )}
        </div>
      </div>
    </SystemAdminGuard>
  );
};
