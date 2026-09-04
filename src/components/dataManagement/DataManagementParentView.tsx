import React, { useState } from 'react';
import { 
  Database, 
  HardDrive, 
  ArrowDownUp, 
  Wrench, 
  Sparkles, 
  FolderArchive, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  User, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Sliders, 
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { DataManagementSubTab, DataManagementOverviewCard } from '../../types/dataManagement';
import { BackupRestoreView } from './BackupRestoreView';
import { ImportExportSubView } from './ImportExportSubView';
import { DatabaseMaintenanceSubView } from './DatabaseMaintenanceSubView';
import { DataCleanupSubView } from './DataCleanupSubView';
import { ArchiveCenterSubView } from './ArchiveCenterSubView';
import { AuditRecoverySubView } from './AuditRecoverySubView';
import { UltimatePOSImportView } from '../import/UltimatePOSImportView';

interface DataManagementParentViewProps {
  initialSubTab?: DataManagementSubTab;
}

export const DataManagementParentView: React.FC<DataManagementParentViewProps> = ({ 
  initialSubTab = 'dashboard' 
}) => {
  const { setActiveTab } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<DataManagementSubTab>(initialSubTab);

  // Sync if initialSubTab changes from parent
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const overviewCards: DataManagementOverviewCard[] = [
    {
      id: 'migration',
      title: 'Data Migration',
      description: 'Migrate complete master catalogs, charts of accounts, customers, vendors, and transactions from 30+ legacy systems.',
      status: 'Active',
      statusType: 'active',
      lastActivity: '2026-09-02 04:15 PM',
      lastUser: 'Lead IT Admin',
      quickActionText: 'Launch Migration Center',
      statBadge: '30 Connectors Supported',
      subTab: 'migration',
    },
    {
      id: 'backup_restore',
      title: 'Backup & Restore',
      description: 'Automated multi-target vaults (S3, Azure, NAS), granular module rollback protection, and disaster recovery orchestration.',
      status: 'Healthy',
      statusType: 'healthy',
      lastActivity: '2026-09-01 02:00 AM',
      lastUser: 'System Automated (Cron)',
      quickActionText: 'Open Backup & Restore',
      statBadge: 'AES-256 Protected',
      subTab: 'backup_restore',
    },
    {
      id: 'import_export',
      title: 'Import / Export',
      description: 'Fast round-trip bulk batch ingestion and export for products, customers, suppliers, sales orders, and accounting balances.',
      status: 'Operational',
      statusType: 'healthy',
      lastActivity: '2026-09-03 10:45 AM',
      lastUser: 'Store Manager',
      quickActionText: 'Import or Export Data',
      statBadge: 'CSV, JSON & Excel',
      subTab: 'import_export',
    },
    {
      id: 'maintenance',
      title: 'Database Maintenance',
      description: 'PostgreSQL relational maintenance, VACUUM FULL, ANALYZE query plans, B-tree index rebuilds, and buffer cache tuning.',
      status: 'Healthy',
      statusType: 'healthy',
      lastActivity: '2026-09-02 03:30 AM',
      lastUser: 'System Daemon',
      quickActionText: 'Run Database Maintenance',
      statBadge: '0.8% Fragmentation',
      subTab: 'maintenance',
    },
    {
      id: 'cleanup',
      title: 'Data Cleanup',
      description: 'Garbage collection routines to safely purge expired session drafts, rotate application debug logs, and clear orphaned caches.',
      status: 'Scheduled',
      statusType: 'info',
      lastActivity: '2026-08-30 11:00 PM',
      lastUser: 'System Automated',
      quickActionText: 'Review Cleanup Rules',
      statBadge: '157 MB Reclaimable',
      subTab: 'cleanup',
    },
    {
      id: 'archive',
      title: 'Archive Center',
      description: 'Cold-vault storage for closed fiscal years, historical invoices, and completed maintenance tickets for regulatory audits.',
      status: 'Operational',
      statusType: 'healthy',
      lastActivity: '2025-01-15 12:00 PM',
      lastUser: 'Compliance Officer',
      quickActionText: 'Access Archive Vault',
      statBadge: '3 Sealed Archives',
      subTab: 'archive',
    },
    {
      id: 'audit_recovery',
      title: 'Audit & Recovery',
      description: 'Cryptographic Change Data Capture (CDC) audit trail with instant atomic reversion for inadvertent mutations and deletions.',
      status: 'Operational',
      statusType: 'healthy',
      lastActivity: '2026-09-03 11:20 AM',
      lastUser: 'Lead Cashier',
      quickActionText: 'Inspect Audit Trail',
      statBadge: 'Tamper-Sealed SHA-256',
      subTab: 'audit_recovery',
    }
  ];

  const getCardIcon = (id: string) => {
    switch (id) {
      case 'migration': return <Database className="w-5 h-5 text-blue-600" />;
      case 'backup_restore': return <HardDrive className="w-5 h-5 text-emerald-600" />;
      case 'import_export': return <ArrowDownUp className="w-5 h-5 text-indigo-600" />;
      case 'maintenance': return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'cleanup': return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'archive': return <FolderArchive className="w-5 h-5 text-cyan-600" />;
      case 'audit_recovery': return <History className="w-5 h-5 text-rose-600" />;
      default: return <Database className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string, statusType: string) => {
    if (statusType === 'healthy') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          ● {status}
        </span>
      );
    }
    if (statusType === 'active') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          ● {status}
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        ● {status}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
            <button 
              onClick={() => setActiveTab('settings')}
              className="hover:text-blue-600 transition-colors"
            >
              Settings
            </button>
            <span>/</span>
            <button 
              onClick={() => setActiveSubTab('dashboard')}
              className={`hover:text-blue-600 transition-colors ${activeSubTab === 'dashboard' ? 'text-slate-800 font-bold' : ''}`}
            >
              Data Management
            </button>
            {activeSubTab !== 'dashboard' && (
              <>
                <span>/</span>
                <span className="text-slate-800 font-bold capitalize">
                  {activeSubTab.replace('_', ' & ')}
                </span>
              </>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-600" />
            Data Management
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Control Center
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Centralized landing page and administration suite for enterprise migration, vaults, disaster recovery, and maintenance.
          </p>
        </div>

        {/* Global Action / Switcher */}
        <div className="flex items-center gap-2">
          {activeSubTab !== 'dashboard' && (
            <button
              onClick={() => setActiveSubTab('dashboard')}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Overview</span>
            </button>
          )}
          <button
            onClick={() => setActiveSubTab('backup_restore')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Backup & Restore</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'migration', label: 'Data Migration', icon: Database },
          { id: 'backup_restore', label: 'Backup & Restore', icon: HardDrive },
          { id: 'import_export', label: 'Import / Export', icon: ArrowDownUp },
          { id: 'maintenance', label: 'Database Maintenance', icon: Wrench },
          { id: 'cleanup', label: 'Data Cleanup', icon: Sparkles },
          { id: 'archive', label: 'Archive Center', icon: FolderArchive },
          { id: 'audit_recovery', label: 'Audit & Recovery', icon: History },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id as DataManagementSubTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD: OVERVIEW CARDS (LANDING PAGE) */}
      {/* ========================================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Executive Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
                <span>Database Health</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                100% Operational
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Zero schema discrepancies</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
                <span>Last Vault Snapshot</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-1">
                2026-09-01
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Verified SHA-256 Checksum</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
                <span>Active Connectors</span>
                <Database className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-1">
                30 Connectors
              </div>
              <div className="text-[11px] text-slate-500 mt-1">ERP, POS, DB & API Bridges</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
                <span>Total Live Data Rows</span>
                <Layers className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-1">
                384,500
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Catalog, Sales & Ledgers</div>
            </div>
          </div>

          {/* 7 Required Overview Cards Grid */}
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Data Administration Modules & Functions
              </h2>
              <p className="text-xs text-slate-500">
                Direct access to data migration, snapshots, scheduled vaults, and cleanup routines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {overviewCards.map(card => (
                <div
                  key={card.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header with Icon & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-50 border border-slate-200/70 group-hover:border-blue-200 flex items-center justify-center transition-colors">
                        {getCardIcon(card.id)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(card.status, card.statusType)}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        {card.description}
                      </p>
                    </div>

                    {/* Status Metadata: Last Activity & Last User */}
                    <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Last Activity:</span>
                        </span>
                        <span className="font-semibold text-slate-800">{card.lastActivity}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Last User:</span>
                        </span>
                        <span className="font-semibold text-slate-800 truncate max-w-[150px]">{card.lastUser}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {card.statBadge}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab(card.subTab)}
                      className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <span>{card.quickActionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DATA MIGRATION SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'migration' && (
        <UltimatePOSImportView />
      )}

      {/* ========================================================================= */}
      {/* 3. BACKUP & RESTORE SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'backup_restore' && (
        <BackupRestoreView onNavigateSubTab={(sub) => setActiveSubTab(sub as DataManagementSubTab)} />
      )}

      {/* ========================================================================= */}
      {/* 4. IMPORT / EXPORT SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'import_export' && (
        <ImportExportSubView onNavigateSubTab={(sub) => setActiveSubTab(sub as DataManagementSubTab)} />
      )}

      {/* ========================================================================= */}
      {/* 5. DATABASE MAINTENANCE SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'maintenance' && (
        <DatabaseMaintenanceSubView />
      )}

      {/* ========================================================================= */}
      {/* 6. DATA CLEANUP SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'cleanup' && (
        <DataCleanupSubView />
      )}

      {/* ========================================================================= */}
      {/* 7. ARCHIVE CENTER SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'archive' && (
        <ArchiveCenterSubView />
      )}

      {/* ========================================================================= */}
      {/* 8. AUDIT & RECOVERY SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'audit_recovery' && (
        <AuditRecoverySubView />
      )}
    </div>
  );
};
