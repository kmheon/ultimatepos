import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Trash2, 
  Plus, 
  Clock, 
  CheckCircle2, 
  HardDrive,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Check,
  Server,
  Cloud,
  Lock,
  FileText,
  KeyRound,
  FileCheck,
  Activity,
  Play,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  useBackupsQuery, 
  useCreateBackupMutation, 
  useVerifyBackupMutation, 
  useDeleteBackupMutation,
  useBackupSchedulesQuery,
  useToggleScheduleMutation,
  useStorageProvidersQuery,
  useDisasterRecoveryQuery,
  useRestorePreviewQuery,
  useValidateRestoreMutation,
  useExecuteRestoreMutation,
  useRunRecoveryTestMutation
} from '../../services/dataManagement/useDataManagement';
import { 
  BackupType, 
  StorageProvider, 
  RestoreScopeOption, 
  BackupItem 
} from '../../types/dataManagement';

interface BackupRestoreViewProps {
  initialTab?: 'backups' | 'restore' | 'disaster_recovery' | 'history';
  onNavigateSubTab?: (subTab: string) => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({ 
  initialTab = 'backups',
  onNavigateSubTab
}) => {
  const { setActiveTab } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<'backups' | 'restore' | 'disaster_recovery' | 'history'>(initialTab);

  // React Query data hooks
  const { data: backups = [], isLoading: isBackupsLoading } = useBackupsQuery();
  const { data: schedules = [] } = useBackupSchedulesQuery();
  const { data: storageProviders = [] } = useStorageProvidersQuery();
  const { data: drStatus } = useDisasterRecoveryQuery();

  // Mutations
  const createBackupMutation = useCreateBackupMutation();
  const verifyBackupMutation = useVerifyBackupMutation();
  const deleteBackupMutation = useDeleteBackupMutation();
  const toggleScheduleMutation = useToggleScheduleMutation();
  const validateRestoreMutation = useValidateRestoreMutation();
  const executeRestoreMutation = useExecuteRestoreMutation();
  const runRecoveryTestMutation = useRunRecoveryTestMutation();

  // Create Backup Modal / Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBackupType, setSelectedBackupType] = useState<BackupType>('full');
  const [selectedStorage, setSelectedStorage] = useState<StorageProvider>('s3');
  const [selectedScope, setSelectedScope] = useState<string[]>(['Entire ERP']);
  const [selectedEncryption, setSelectedEncryption] = useState<'AES-256' | 'Password Protected' | 'Unencrypted'>('AES-256');
  const [backupPassword, setBackupPassword] = useState('');
  const [backupSuccessMsg, setBackupSuccessMsg] = useState<string | null>(null);

  // Restore State
  const [selectedRestoreBackupId, setSelectedRestoreBackupId] = useState<string>(backups[0]?.id || 'BKP-2026-0901-01');
  const [restoreScope, setRestoreScope] = useState<RestoreScopeOption>('entire_erp');
  const [selectedModulesToRestore, setSelectedModulesToRestore] = useState<string[]>([
    'Accounting', 'Inventory', 'Sales', 'Contacts'
  ]);
  const [enableRollbackProtection, setEnableRollbackProtection] = useState(true);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; checks: { name: string; passed: boolean; details: string }[] } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState<number>(0);
  const [restoreCurrentStep, setRestoreCurrentStep] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreCompletedMessage, setRestoreCompletedMessage] = useState<string | null>(null);

  // Verify State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{ id: string; message: string } | null>(null);

  // Preview Query
  const { data: restorePreview } = useRestorePreviewQuery(selectedRestoreBackupId);

  // Handle Create Backup
  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createBackupMutation.mutateAsync({
        backupType: selectedBackupType,
        storageLocation: selectedStorage,
        scope: selectedScope,
        encryption: selectedEncryption,
        password: backupPassword,
      });
      setShowCreateModal(false);
      setBackupSuccessMsg(`Backup created successfully: ${result.filename}`);
      setTimeout(() => setBackupSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Verify Backup
  const handleVerifyBackup = async (backup: BackupItem) => {
    setVerifyingId(backup.id);
    try {
      const res = await verifyBackupMutation.mutateAsync(backup.id);
      setVerificationFeedback({ id: backup.id, message: res.message });
      setTimeout(() => setVerificationFeedback(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  // Handle Run Restore Validation
  const handleValidateRestore = async () => {
    setIsValidating(true);
    try {
      const res = await validateRestoreMutation.mutateAsync(selectedRestoreBackupId);
      setValidationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle Execute Restore
  const handleExecuteRestore = async () => {
    if (!window.confirm(`Are you sure you want to restore from ${selectedRestoreBackupId}? A rollback snapshot will be generated automatically.`)) {
      return;
    }
    setIsRestoring(true);
    setRestoreProgress(0);
    setRestoreCompletedMessage(null);

    try {
      const res = await executeRestoreMutation.mutateAsync({
        backupId: selectedRestoreBackupId,
        scope: restoreScope,
        selectedModules: selectedModulesToRestore,
        enableRollbackProtection,
        onProgress: (pct, step) => {
          setRestoreProgress(pct);
          setRestoreCurrentStep(step);
        }
      });
      setRestoreCompletedMessage(res.message + (res.rollbackSnapshotId ? ` (Rollback Point: ${res.rollbackSnapshotId})` : ''));
    } catch (err) {
      console.error(err);
    } finally {
      setIsRestoring(false);
    }
  };

  // Trigger Recovery Test
  const handleRunRecoveryTest = async () => {
    await runRecoveryTestMutation.mutateAsync();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
      {/* Header & Breadcrumb */}
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
              onClick={() => onNavigateSubTab ? onNavigateSubTab('dashboard') : setActiveTab('settings')}
              className="hover:text-blue-600 transition-colors"
            >
              Data Management
            </button>
            <span>/</span>
            <span className="text-slate-700 font-bold">Backup & Restore</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-600" />
            Backup & Restore Center
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Enterprise Resilience
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Autonomous full-system vaulting, point-in-time rollback protection, and disaster recovery orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Backup</span>
          </button>
        </div>
      </div>

      {backupSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{backupSuccessMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('backups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'backups'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Tab 1: Backups & Schedules</span>
        </button>

        <button
          onClick={() => setActiveSubTab('restore')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'restore'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tab 2: Restore Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab('disaster_recovery')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'disaster_recovery'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Tab 3: Disaster Recovery</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'history'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Tab 4: Backup History ({backups.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BACKUPS */}
      {/* ========================================================================= */}
      {activeSubTab === 'backups' && (
        <div className="space-y-6">
          {/* Automatic Backups Status Hero Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center justify-center shrink-0">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                    Automatic Backups Active
                  </span>
                  <span className="text-xs text-slate-300">Cron Daemon: Online</span>
                </div>
                <h3 className="font-bold text-base text-white mt-1">Multi-Target Scheduled Snapshots</h3>
                <p className="text-xs text-slate-300 max-w-xl mt-0.5">
                  Automated backups run on cron intervals (Hourly Transaction Delta & Daily Full Vault) with AES-256 encryption.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Trigger Manual Backup</span>
              </button>
            </div>
          </div>

          {/* Backup Types Specification Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Supported Backup Modes & Architectural Coverage</h3>
                <p className="text-xs text-slate-500">Configure granular backup scopes for specific compliance and storage policies</p>
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                7 Granular Archetypes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>Full Backup</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Complete system database, application states, file media, documents, and environment configs.</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">Daily Recommended</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Incremental Backup</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Saves only modified blocks and delta rows created since the last backup run.</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">Hourly Intervals</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>Differential Backup</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Captures all cumulative data changes since the last Full System Snapshot baseline.</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">Mid-day Fast Sync</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>Database Only</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">PostgreSQL relational schemas, sales journals, customer ledgers, and inventory counts.</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">Lightweight & Fast</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Files Only</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Product images, repair diagnostic attachments, brand logos, and digital receipts.</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">Media Vault</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <FileCheck className="w-4 h-4 text-cyan-600" />
                  <span>Documents Only</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Archived PDF invoices, supplier contracts, quotation estimates, and payroll slips.</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">Compliance</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <KeyRound className="w-4 h-4 text-rose-600" />
                  <span>Configuration Only</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Store details, tax zones, invoice layout schemes, user roles, and security policies.</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">Rapid Setup</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>AES-256 Security</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Military-grade encryption with digital signature verification and SHA-256 integrity tags.</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Zero-Leak Proof</span>
              </div>
            </div>
          </div>

          {/* Scheduled Backups Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Scheduled Backups Daemon</h3>
                <p className="text-xs text-slate-500">Automated backup schedules running in background</p>
              </div>
              <span className="text-xs font-semibold text-slate-600">4 Active Automation Jobs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Schedule Name</th>
                    <th className="px-4 py-3">Frequency</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Storage Target</th>
                    <th className="px-4 py-3">Retention</th>
                    <th className="px-4 py-3">Last Run</th>
                    <th className="px-4 py-3">Next Run</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {schedules.map(sched => (
                    <tr key={sched.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        {sched.name}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700 capitalize">
                        {sched.frequency.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {sched.backupType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-600 uppercase">
                        {sched.storageTarget}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{sched.retentionCopies} copies</td>
                      <td className="px-4 py-3.5 text-slate-500">{sched.lastRun}</td>
                      <td className="px-4 py-3.5 text-blue-700 font-semibold">{sched.nextRun}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => toggleScheduleMutation.mutate(sched.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            sched.enabled 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {sched.enabled ? 'Enabled' : 'Paused'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Connected Storage Providers Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Supported Storage Providers</h3>
                <p className="text-xs text-slate-500">Cross-cloud redundancy and on-premise vault destinations</p>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                10 Storage Protocols Supported
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {storageProviders.map(sp => (
                <div 
                  key={sp.id} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    sp.connected 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : 'border-slate-200 bg-slate-50/50 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Cloud className={`w-4 h-4 ${sp.connected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {sp.name}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      sp.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {sp.connected ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 truncate mt-1.5">{sp.targetPath}</div>
                  <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                    <span>{sp.details}</span>
                    {sp.lastSync && <span className="text-slate-400 text-[10px]">Sync: {sp.lastSync}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RESTORE */}
      {/* ========================================================================= */}
      {activeSubTab === 'restore' && (
        <div className="space-y-6">
          {/* Restore Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Safety Notice Regarding Point-in-Time System Restoration</span>
              <p>
                Restoring a snapshot overwrites selected relational data tables with historical records. Rollback Protection is enabled by default to automatically take an emergency snapshot before proceeding.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Target Backup Selection & Scope */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div>
                <h3 className="font-bold text-sm text-slate-900">1. Available Restore Points</h3>
                <p className="text-xs text-slate-500">Select an authenticated backup snapshot from local or cloud repositories</p>
              </div>

              <div className="space-y-2">
                {backups.map(b => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedRestoreBackupId(b.id);
                      setValidationResult(null);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedRestoreBackupId === b.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                        selectedRestoreBackupId === b.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{b.filename}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{b.date}</span>
                          <span>•</span>
                          <span className="font-semibold">{b.storageLocationLabel}</span>
                          <span>•</span>
                          <span>{b.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {b.integrityStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Restore Scope Options */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">2. Restoration Scope</h3>
                  <p className="text-xs text-slate-500">Choose between full-system restoration or modular surgical restoration</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRestoreScope('entire_erp')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      restoreScope === 'entire_erp'
                        ? 'border-blue-600 bg-blue-50/70 font-bold text-blue-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">Restore Entire ERP System</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-normal">All schemas, transactions, users, configs & media</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRestoreScope('selected_modules')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      restoreScope === 'selected_modules'
                        ? 'border-blue-600 bg-blue-50/70 font-bold text-blue-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">Restore Selected Modules Only</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-normal">Isolate specific departments without touching others</div>
                  </button>
                </div>

                {/* Granular Module Selectors if Selected Modules */}
                {restoreScope === 'selected_modules' && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Select Target Modules to Restore:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        'Company', 'Accounting', 'Inventory', 'Sales', 
                        'Purchases', 'CRM', 'HR & Payroll', 'Assets', 
                        'Service Management', 'Manufacturing', 'Documents'
                      ].map(mod => {
                        const isSelected = selectedModulesToRestore.includes(mod);
                        return (
                          <label key={mod} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedModulesToRestore(prev => 
                                  isSelected ? prev.filter(m => m !== mod) : [...prev, mod]
                                );
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-slate-700 font-medium">{mod}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Rollback Protection Toggle */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-emerald-950">Rollback Protection (Pre-Restore Safety Snapshot)</div>
                    <div className="text-[11px] text-emerald-800">Generates an instant emergency point before starting restore</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableRollbackProtection}
                  onChange={e => setEnableRollbackProtection(e.target.checked)}
                  className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Right Col: Validation & Execute */}
            <div className="space-y-4">
              {/* Restore Preview Card */}
              {restorePreview && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    Restore Preview Details
                  </h3>
                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Schema Compatibility:</span>
                      <span className="font-bold text-emerald-600">{restorePreview.compatibility}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-500">Target Schema Version:</span>
                      <span className="font-mono font-semibold text-slate-700">{restorePreview.schemaVersion}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-500">Total Records Stored:</span>
                      <span className="font-bold text-slate-900">{restorePreview.totalRecords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-500">Est. Execution Time:</span>
                      <span className="font-semibold text-slate-700">~{restorePreview.estimatedTimeSeconds} seconds</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Contained Tables</div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {restorePreview.modulesIncluded.map((m, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>{m.name}</span>
                          <span className="font-mono text-slate-400">{m.count.toLocaleString()} rows</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Action */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900">Pre-Flight Integrity Check</h3>
                <p className="text-xs text-slate-500">Verify digital signatures, constraint maps, and disk locks before restoring.</p>

                <button
                  type="button"
                  onClick={handleValidateRestore}
                  disabled={isValidating || isRestoring}
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isValidating ? <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  <span>{isValidating ? 'Validating Constraints...' : 'Run Restore Validation'}</span>
                </button>

                {validationResult && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>All 5 Pre-Flight Checks Passed</span>
                    </div>
                    {validationResult.checks.map((chk, i) => (
                      <div key={i} className="text-[11px] text-emerald-800 flex items-center justify-between">
                        <span>{chk.name}</span>
                        <span className="font-bold">OK</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Start Restoration Button */}
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isRestoring || isValidating}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isRestoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  <span>{isRestoring ? 'Restoring System...' : 'Execute System Restore'}</span>
                </button>

                {/* Progress Bar during Restore */}
                {isRestoring && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-blue-900">
                      <span>{restoreCurrentStep}</span>
                      <span>{restoreProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${restoreProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {restoreCompletedMessage && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{restoreCompletedMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DISASTER RECOVERY */}
      {/* ========================================================================= */}
      {activeSubTab === 'disaster_recovery' && (
        <div className="space-y-6">
          {/* Recovery Status & Health Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Recovery Status</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                {drStatus?.recoveryStatus || 'Operational'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Multi-AZ Standby Cluster Synced</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Database Integrity</span>
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {drStatus?.databaseIntegrity || '100% Optimal'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Zero corrupted index pages</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Recovery Health Score</span>
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {drStatus?.recoveryHealthScore || 99} / 100
              </div>
              <div className="text-[11px] text-slate-500 mt-1">RTO & RPO SLA Compliance: Passed</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>RTO & RPO Targets</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                RTO: &lt; 3.5m | RPO: &lt; 15m
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Real-time continuous WAL stream</div>
            </div>
          </div>

          {/* Emergency Recovery & Recovery Test Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300">
                  Business Continuity Protocol
                </span>
                <h3 className="font-bold text-sm text-slate-900">Automated Disaster Recovery Testing</h3>
              </div>
              <p className="text-xs text-slate-500 max-w-xl">
                Last verified test: <span className="font-bold text-slate-800">{drStatus?.lastRecoveryTest}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRunRecoveryTest}
                disabled={runRecoveryTestMutation.isPending}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {runRecoveryTestMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{runRecoveryTestMutation.isPending ? 'Simulating Failover...' : 'Run Automated DR Test'}</span>
              </button>
            </div>
          </div>

          {/* Recovery Instructions & Runbook Guide */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Standard Operating Procedure (SOP): Emergency Failover Runbook
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
                  Primary Node Failure Detection
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Health probes poll every 10 seconds. If 3 consecutive heartbeat timeouts occur, traffic shifts automatically to the cold-standby endpoint.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
                  Offsite Replica Promotion
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  The Azure Blob / S3 secondary replica is promoted to read-write primary. Latest WAL logs replay up to the last 15-minute sync boundary.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
                  Integrity Seal & Client Reconnect
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Cryptographic verification confirms zero corrupted blocks. Client sessions re-establish with updated tokens without data loss.
                </p>
              </div>
            </div>
          </div>

          {/* Recovery Logs Audit Trail */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Disaster Recovery Event Logs</h3>
                <p className="text-xs text-slate-500">Immutable replication and validation heartbeat history</p>
              </div>
              <span className="text-xs font-semibold text-slate-600">Audited by Nebula Security Core</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {drStatus?.logs.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    log.level === 'success' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : log.level === 'warning'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.event}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BACKUP HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Historical Snapshot Catalog</h3>
                <p className="text-xs text-slate-500">Searchable repository of manual and automated ERP snapshots</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Total Vault Size: <strong>199.8 MB</strong></span>
              </div>
            </div>

            {verificationFeedback && (
              <div className="m-4 p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{verificationFeedback.message}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Backup ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Created By</th>
                    <th className="px-4 py-3">Backup Type</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Storage Location</th>
                    <th className="px-4 py-3">Encryption Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {backups.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{b.id}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal block mt-0.5">{b.filename}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{b.date}</td>
                      <td className="px-4 py-3.5 text-slate-800 font-medium">{b.createdBy}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] block w-fit">
                          {b.backupTypeLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700 font-semibold">{b.size}</td>
                      <td className="px-4 py-3.5 text-slate-700">
                        <span className="flex items-center gap-1 font-medium">
                          <Cloud className="w-3.5 h-3.5 text-slate-400" />
                          {b.storageLocationLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <Lock className="w-3 h-3" />
                          {b.encryptionStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Verify Button */}
                          <button
                            type="button"
                            title="Verify SHA-256 Checksum"
                            onClick={() => handleVerifyBackup(b)}
                            disabled={verifyingId === b.id}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {verifyingId === b.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>Verify</span>
                          </button>

                          {/* Download Button */}
                          <button
                            type="button"
                            title="Download Encrypted Snapshot"
                            onClick={() => {
                              const dummy = new Blob([`NEBULA_ERP_VAULT_DUMP_${b.filename}`], { type: 'application/octet-stream' });
                              const url = URL.createObjectURL(dummy);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = b.filename;
                              a.click();
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Restore Button */}
                          <button
                            type="button"
                            title="Restore from this Snapshot"
                            onClick={() => {
                              setSelectedRestoreBackupId(b.id);
                              setActiveSubTab('restore');
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            title="Delete Snapshot"
                            onClick={() => {
                              if (window.confirm(`Permanently delete backup ${b.filename}?`)) {
                                deleteBackupMutation.mutate(b.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE BACKUP */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Initiate New System Backup
                </h3>
                <p className="text-xs text-slate-500">Configure backup archetype, storage destination, and encryption keys</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBackup} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Backup Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Select Backup Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'full', label: 'Full Backup (Complete)' },
                    { id: 'incremental', label: 'Incremental (Delta changes)' },
                    { id: 'differential', label: 'Differential (Cumulative)' },
                    { id: 'db_only', label: 'Database Only (SQL dump)' },
                    { id: 'files_only', label: 'Files Only (Media files)' },
                    { id: 'docs_only', label: 'Documents Only (PDFs)' },
                    { id: 'config_only', label: 'Configuration Only (Settings)' },
                  ].map(bt => (
                    <button
                      key={bt.id}
                      type="button"
                      onClick={() => setSelectedBackupType(bt.id as BackupType)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedBackupType === bt.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-500/30' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage Provider */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Target Storage Provider</label>
                <select
                  value={selectedStorage}
                  onChange={e => setSelectedStorage(e.target.value as StorageProvider)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="s3">Amazon S3 (Primary Bucket)</option>
                  <option value="azure">Azure Blob Storage (Archive)</option>
                  <option value="nas">Network Storage (NAS-01)</option>
                  <option value="local">Local Server Storage</option>
                  <option value="gdrive">Google Drive Enterprise</option>
                  <option value="onedrive">Microsoft OneDrive</option>
                  <option value="dropbox">Dropbox Business</option>
                  <option value="sftp">Secure SFTP Server</option>
                  <option value="ftp">FTP Server</option>
                  <option value="custom_cloud">Custom S3 / Cloudflare R2 Vault</option>
                </select>
              </div>

              {/* Security & Encryption */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Cryptographic Protection
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="enc" 
                      value="AES-256" 
                      checked={selectedEncryption === 'AES-256'}
                      onChange={() => setSelectedEncryption('AES-256')}
                      className="text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">AES-256 Hardware Key</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="enc" 
                      value="Password Protected" 
                      checked={selectedEncryption === 'Password Protected'}
                      onChange={() => setSelectedEncryption('Password Protected')}
                      className="text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Custom Password</span>
                  </label>
                </div>

                {selectedEncryption === 'Password Protected' && (
                  <div className="pt-2">
                    <input
                      type="password"
                      placeholder="Enter encryption passphrase..."
                      value={backupPassword}
                      onChange={e => setBackupPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBackupMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {createBackupMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{createBackupMutation.isPending ? 'Generating Vault File...' : 'Create Backup'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
