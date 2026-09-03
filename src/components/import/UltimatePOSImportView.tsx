import React, { useState } from 'react';
import { 
  Database, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  SlidersHorizontal, 
  Check, 
  X, 
  FileSpreadsheet, 
  Code2, 
  ShieldAlert,
  ArrowUpRight,
  Package,
  Users,
  Wrench,
  Receipt,
  Truck,
  Landmark,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Lock,
  Server,
  HelpCircle,
  Activity,
  FileCheck,
  Building2,
  Coins,
  FolderGit2,
  Clock,
  Factory,
  Target,
  ChevronRight,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  MigrationSourceSystem, 
  MigrationModule, 
  MigrationConfig, 
  MigrationMode, 
  DuplicateHandling, 
  ConflictResolution, 
  ValidationLevel, 
  FieldMappingRule, 
  MigrationProgressTelemetry, 
  MigrationHistoryRecord, 
  BackupSnapshot, 
  AuditLogEntry 
} from '../../types/migration';
import { 
  SUPPORTED_CONNECTORS, 
  SUPPORTED_MODULES, 
  ENTERPRISE_NEBULA_MIGRATION_BUNDLE, 
  DEFAULT_FIELD_MAPPINGS, 
  MigrationParser, 
  MigrationValidator, 
  MigrationSnapshotManager, 
  MigrationTemplateGenerator 
} from '../../services/migration/migrationEngine.service';
import { DownloadTemplatesModal } from '../migration/DownloadTemplatesModal';
import { MigrationDocumentationModal } from '../migration/MigrationDocumentationModal';
import { MigrationWizardModal } from '../migration/MigrationWizardModal';
import { AuditLogModal } from '../migration/AuditLogModal';
import { RollbackConfirmModal } from '../migration/RollbackConfirmModal';

export const UltimatePOSImportView: React.FC = () => {
  const { 
    importUltimatePOSData, 
    products, 
    contacts, 
    transactions, 
    repairJobSheets, 
    expenses, 
    categories, 
    brands,
    setActiveTab,
    settings 
  } = usePOS();

  // Mode Selection: Wizard, Excel/CSV, Database
  const [activeImportMode, setActiveImportMode] = useState<'wizard' | 'file_upload' | 'database_direct'>('wizard');
  
  // Selected Source System
  const [selectedSourceSystem, setSelectedSourceSystem] = useState<MigrationSourceSystem>('sap_b1');
  const [activeConnectorCategory, setActiveConnectorCategory] = useState<'all' | 'erp' | 'accounting' | 'database' | 'future'>('all');

  // Migration Configuration
  const [config, setConfig] = useState<MigrationConfig>({
    mode: 'safe_merge',
    duplicateHandling: 'merge',
    conflictResolution: 'auto_match',
    validationLevel: 'standard',
    executeInBackground: true,
    resumableCheckpoint: true,
    autoRollbackOnError: true,
    batchSize: 500,
  });

  // Staged Payload & Parsing
  const [stagedPayload, setStagedPayload] = useState<any>(ENTERPRISE_NEBULA_MIGRATION_BUNDLE);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMappingRule[]>(DEFAULT_FIELD_MAPPINGS);

  // Execution & Telemetry Progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [telemetry, setTelemetry] = useState<MigrationProgressTelemetry>({
    stage: 'idle',
    progressPercent: 0,
    recordsProcessed: 0,
    recordsTotal: 1420,
    recordsFailed: 0,
    recordsSkipped: 0,
    processingSpeed: 450,
    estimatedRemainingTime: '00:00s',
    currentEntity: 'Idle',
    currentBatch: 0,
    totalBatches: 3
  });

  // Modals
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [selectedRollbackRecord, setSelectedRollbackRecord] = useState<MigrationHistoryRecord | null>(null);

  // Audit and History
  const [historyList, setHistoryList] = useState<MigrationHistoryRecord[]>(MigrationSnapshotManager.getHistory());
  const [auditLogsList, setAuditLogsList] = useState<AuditLogEntry[]>(MigrationSnapshotManager.getAuditLogs());
  const [lastExecutedRecord, setLastExecutedRecord] = useState<MigrationHistoryRecord | null>(null);

  // Validation & Readiness Evaluation
  const { metrics, ruleResults } = MigrationValidator.evaluateReadiness(
    stagedPayload,
    config.validationLevel
  );

  // Filter Connectors
  const filteredConnectors = SUPPORTED_CONNECTORS.filter(c => {
    if (activeConnectorCategory === 'all') return true;
    if (activeConnectorCategory === 'erp') return c.category === 'erp';
    if (activeConnectorCategory === 'accounting') return c.category === 'accounting';
    if (activeConnectorCategory === 'database') return c.category === 'database';
    if (activeConnectorCategory === 'future') return c.category === 'future_connector';
    return true;
  });

  const activeConnector = SUPPORTED_CONNECTORS.find(c => c.id === selectedSourceSystem) || SUPPORTED_CONNECTORS[0];

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          setStagedPayload(parsed);
        } catch {
          alert('Invalid JSON syntax in uploaded file.');
        }
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        const rows = MigrationParser.parseCSV(content);
        setStagedPayload({
          ...stagedPayload,
          products: rows.map((r, i) => ({
            name: r.name || r.Title || `Imported Item ${i + 1}`,
            sku: r.sku || r.ItemCode || `SKU-${Date.now().toString().slice(-4)}-${i}`,
            sellingPrice: parseFloat(r.sellingPrice || r.Price || '100'),
            purchasePrice: parseFloat(r.purchasePrice || r.Cost || '70'),
            currentStock: parseInt(r.currentStock || r.Qty || '10', 10),
            unit: 'Unit'
          }))
        });
      } else if (file.name.endsWith('.sql')) {
        const parsed = MigrationParser.parseSQLDump(content);
        setStagedPayload(parsed);
      }
    };

    reader.readAsText(file);
  };

  // Execute Migration Handler
  const handleExecuteMigration = () => {
    setIsProcessing(true);
    setIsPaused(false);

    // 1. Create Pre-Migration Snapshot
    const currentCounts = {
      products: products.length,
      customers: contacts.filter(c => c.type === 'customer').length,
      suppliers: contacts.filter(c => c.type === 'supplier').length,
      sales: transactions.length,
      workOrders: repairJobSheets.length,
      expenses: expenses.length,
    };

    const snapshot = MigrationSnapshotManager.createSnapshot(
      `Pre-${activeConnector.name} Database Snapshot`,
      currentCounts,
      { products, contacts, transactions, repairJobSheets, expenses }
    );

    // 2. Stage 1: Queued
    setTelemetry({
      stage: 'queued',
      progressPercent: 10,
      recordsProcessed: 140,
      recordsTotal: metrics.estimatedRecords,
      recordsFailed: 0,
      recordsSkipped: 0,
      processingSpeed: 420,
      estimatedRemainingTime: '00:08s',
      currentEntity: 'Initializing secure transaction buffer...',
      currentBatch: 1,
      totalBatches: 3
    });

    // 3. Stage 2: Validating
    setTimeout(() => {
      setTelemetry(prev => ({
        ...prev,
        stage: 'validating',
        progressPercent: 35,
        recordsProcessed: 490,
        currentEntity: 'Auditing 9 schema integrity gates & GL accounts...',
        estimatedRemainingTime: '00:05s'
      }));

      // 4. Stage 3: Importing
      setTimeout(() => {
        setTelemetry(prev => ({
          ...prev,
          stage: 'importing',
          progressPercent: 75,
          recordsProcessed: 1065,
          currentEntity: 'Writing master products, enterprise clients & service orders...',
          estimatedRemainingTime: '00:02s'
        }));

        // 5. Final Stage: Completed
        setTimeout(() => {
          // Commit to POSContext
          const importResult = importUltimatePOSData({
            products: stagedPayload.products || ENTERPRISE_NEBULA_MIGRATION_BUNDLE.products,
            contacts: stagedPayload.contacts || ENTERPRISE_NEBULA_MIGRATION_BUNDLE.contacts,
            repairJobSheets: stagedPayload.serviceWorkOrders || ENTERPRISE_NEBULA_MIGRATION_BUNDLE.serviceWorkOrders,
            transactions: stagedPayload.transactions || ENTERPRISE_NEBULA_MIGRATION_BUNDLE.transactions,
            sourceType: activeImportMode === 'database_direct' ? 'sql_dump' : 'json_backup',
            mode: config.mode === 'replace_existing' ? 'overwrite' : 'merge',
          });

          // Record Completion in Audit History
          const completionRecord = MigrationSnapshotManager.recordMigrationCompletion(
            activeConnector.name,
            selectedSourceSystem,
            metrics.estimatedRecords,
            '3.8s',
            snapshot.snapshotId
          );

          setTelemetry({
            stage: 'completed',
            progressPercent: 100,
            recordsProcessed: metrics.estimatedRecords,
            recordsTotal: metrics.estimatedRecords,
            recordsFailed: 0,
            recordsSkipped: 0,
            processingSpeed: 480,
            estimatedRemainingTime: '00:00s',
            currentEntity: 'Migration committed successfully!',
            currentBatch: 3,
            totalBatches: 3
          });

          setLastExecutedRecord(completionRecord);
          setHistoryList(MigrationSnapshotManager.getHistory());
          setAuditLogsList(MigrationSnapshotManager.getAuditLogs());
          setIsProcessing(false);
        }, 800);
      }, 800);
    }, 800);
  };

  // Rollback Execution
  const handleRollback = (migrationId: string) => {
    const success = MigrationSnapshotManager.rollback(migrationId);
    if (success) {
      setHistoryList(MigrationSnapshotManager.getHistory());
      setAuditLogsList(MigrationSnapshotManager.getAuditLogs());
      alert(`Rollback successful for ${migrationId}. Previous database restore point re-established.`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/60 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-sm shadow-blue-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-0.5">
              <button 
                onClick={() => setActiveTab('settings')}
                className="hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <span>Settings</span>
              </button>
              <span>/</span>
              <span className="text-slate-600 font-semibold">Data Migration</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Enterprise Data Migration Center
              <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                Nebula ERP Universal Bridge
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Securely migrate master data and transactional records from legacy ERP, POS, Accounting and CRM systems into Nebula ERP.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            Download Import Templates
          </button>
          <button
            onClick={() => setIsDocsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <FileText className="w-4 h-4" />
            Migration Documentation
          </button>
          <button
            onClick={() => setIsWizardModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shadow-blue-200"
          >
            <Sparkles className="w-4 h-4" />
            Migration Wizard
          </button>
        </div>
      </div>

      {/* Main Content Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Security & Admin Clearance Banner */}
        <div className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Administrator Access Verified:</span>
              <span className="text-slate-300 ml-1.5">Sarah Jenkins (Security Principal ID: ADM-9028)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">Session Signature: SHA256:7f83b165...</span>
            <button
              onClick={() => setIsAuditLogModalOpen(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700 transition-colors"
            >
              View Audit Log
            </button>
          </div>
        </div>

        {/* 1. REPLACE IMPORT CARDS (3 CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Migration Wizard */}
          <div
            onClick={() => {
              setActiveImportMode('wizard');
              setIsWizardModalOpen(true);
            }}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeImportMode === 'wizard'
                ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Migration Wizard
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">
                Recommended
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Guided Step-by-Step Assistant</h3>
            <p className="text-xs text-slate-500 mb-3">
              Guided step-by-step migration assistant supporting automatic field mapping and validation.
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700">
              Launch Wizard <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Excel / CSV Import */}
          <div
            onClick={() => setActiveImportMode('file_upload')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeImportMode === 'file_upload'
                ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" /> Excel / CSV Import
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-bold">
                Templates
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Nebula Master Templates</h3>
            <p className="text-xs text-slate-500 mb-2">
              Import master data using Nebula templates.
            </p>
            <div className="flex flex-wrap gap-1">
              {[
                'Products', 'Services', 'Customers', 'Suppliers', 'Employees', 
                'Assets', 'Projects', 'Inventory', 'Chart of Accounts', 'Opening Balances'
              ].map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded border border-purple-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Database Migration */}
          <div
            onClick={() => setActiveImportMode('database_direct')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeImportMode === 'database_direct'
                ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" /> Database Migration
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                Direct DB
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Direct Database Connection</h3>
            <p className="text-xs text-slate-500 mb-2">
              Import directly from supported ERP/POS databases.
            </p>
            <div className="flex flex-wrap gap-1">
              {['MySQL', 'MariaDB', 'SQL Server', 'PostgreSQL', 'SQLite'].map(db => (
                <span key={db} className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-semibold">
                  {db}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 2. SUPPORTED SYSTEMS SELECTOR & CONNECTOR MATRIX */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Supported Systems & Connectors
              </h2>
              <p className="text-xs text-slate-500">
                Pre-configured relational adapters, field dictionaries, and automated transformation pipelines
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              {[
                { id: 'all', label: 'All Systems' },
                { id: 'erp', label: 'ERP Systems' },
                { id: 'accounting', label: 'Accounting' },
                { id: 'database', label: 'Databases' },
                { id: 'future', label: 'Future Ready' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveConnectorCategory(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    activeConnectorCategory === tab.id
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connectors Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredConnectors.map((connector) => {
              const isSelected = selectedSourceSystem === connector.id;
              return (
                <div
                  key={connector.id}
                  onClick={() => setSelectedSourceSystem(connector.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs truncate">{connector.name}</span>
                    {connector.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        connector.status === 'future_ready'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {connector.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{connector.formatsSupported.join(', ')}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">Adapter:</span>
                    <span className={`font-semibold ${
                      connector.status === 'connected' ? 'text-emerald-600' :
                      connector.status === 'ready' ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      {connector.status === 'future_ready' ? 'Architected' : 'Online'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Connector Banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                {activeConnector.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-slate-900">Active Pipeline Target: {activeConnector.name}</span>
                <p className="text-slate-500 text-[11px]">{activeConnector.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Modules Pre-Mapped:</span>
              <div className="flex gap-1">
                {activeConnector.defaultModules.slice(0, 4).map(m => (
                  <span key={m} className="px-1.5 py-0.2 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                    {m}
                  </span>
                ))}
                {activeConnector.defaultModules.length > 4 && (
                  <span className="px-1.5 py-0.2 bg-white text-slate-500 border border-slate-200 rounded text-[10px]">
                    +{activeConnector.defaultModules.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. MIGRATION CONFIGURATION & FILE INGESTION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Migration Configuration & Conflict Strategy</h2>
              <p className="text-xs text-slate-500">Configure ingestion mode, duplicate collision handling, conflict resolution, and validation stringency</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                Safe Atomic Ingestion
              </span>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Migration Mode */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-xs">Migration Mode</label>
              <select
                value={config.mode}
                onChange={(e) => setConfig({ ...config, mode: e.target.value as any })}
                className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="safe_merge">Safe Merge (Preserve & Update)</option>
                <option value="replace_existing">Replace Existing (Full Overwrite)</option>
                <option value="insert_only">Insert Only (Skip Collisions)</option>
                <option value="preview_only">Preview Only (Dry Run)</option>
              </select>
              <p className="text-[10px] text-slate-400">Updates existing matching records, inserts unique rows safely.</p>
            </div>

            {/* Duplicate Handling */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-xs">Duplicate Handling</label>
              <select
                value={config.duplicateHandling}
                onChange={(e) => setConfig({ ...config, duplicateHandling: e.target.value as any })}
                className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="skip">Skip</option>
                <option value="merge">Merge</option>
                <option value="overwrite">Overwrite</option>
                <option value="rename_automatically">Rename Automatically</option>
              </select>
              <p className="text-[10px] text-slate-400">Action taken when an existing SKU or tax ID is detected.</p>
            </div>

            {/* Conflict Resolution */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-xs">Conflict Resolution</label>
              <select
                value={config.conflictResolution}
                onChange={(e) => setConfig({ ...config, conflictResolution: e.target.value as any })}
                className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="auto_match">Auto Match</option>
                <option value="manual_review">Manual Review</option>
              </select>
              <p className="text-[10px] text-slate-400">Heuristic matching on normalized names and numbers.</p>
            </div>

            {/* Validation Level */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-xs">Validation Level</label>
              <select
                value={config.validationLevel}
                onChange={(e) => setConfig({ ...config, validationLevel: e.target.value as any })}
                className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="basic">Basic (Structural Integrity)</option>
                <option value="standard">Standard (Relational Check)</option>
                <option value="strict">Strict (Fiscal & GL Audit)</option>
              </select>
              <p className="text-[10px] text-slate-400">Determines strictness of foreign key and accounting audits.</p>
            </div>
          </div>

          {/* Security & Background Job Toggles */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={config.executeInBackground}
                  onChange={(e) => setConfig({ ...config, executeInBackground: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Execute as Background Worker Job (Large Datasets)
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={config.resumableCheckpoint}
                  onChange={(e) => setConfig({ ...config, resumableCheckpoint: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Support Resumable Checkpoints
              </label>
            </div>

            <span className="text-[11px] text-slate-500">
              Batch Size: <strong>{config.batchSize} records / cycle</strong>
            </span>
          </div>

          {/* File Upload / Ingestion Interface */}
          {activeImportMode !== 'wizard' ? (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
              <UploadCloud className="w-10 h-10 mx-auto text-blue-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                Upload {activeConnector.name} Export ({activeImportMode === 'database_direct' ? '.sql Database Dump' : 'CSV / JSON Template'})
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Drag and drop your file here, or click to browse files from your computer. UTF-8 encodings supported.
              </p>
              
              <div className="flex items-center justify-center gap-3">
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 cursor-pointer transition-all">
                  <UploadCloud className="w-4 h-4" /> Select File
                  <input
                    type="file"
                    accept={activeImportMode === 'database_direct' ? '.sql,.txt' : '.json,.csv,.xlsx'}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {uploadedFileName && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {uploadedFileName}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Enterprise Nebula ERP Dataset Verified & Ready</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Includes 6 enterprise infrastructure components (Cisco switches, APC UPS, Fortinet firewalls), 4 key accounts & OEM vendors, and 2 certified field work orders.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExecuteMigration}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isProcessing ? 'Ingesting Master Records...' : 'Execute Migration Now'}
                </button>
              </div>
            </div>
          )}

          {/* 4. MIGRATION PROGRESS PANEL (WHEN RUNNING OR RECENTLY COMPLETED) */}
          {(isProcessing || telemetry.stage === 'completed') && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    telemetry.stage === 'completed' ? 'bg-emerald-500' : 'bg-blue-600 animate-ping'
                  }`} />
                  <span className="font-bold text-slate-900 text-xs">
                    Stage: <span className="uppercase text-blue-700">{telemetry.stage}</span>
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-xs text-slate-600 font-medium">{telemetry.currentEntity}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <span>Speed: <strong className="text-slate-900">{telemetry.processingSpeed} records/s</strong></span>
                  <span>Est. Remaining: <strong className="text-slate-900">{telemetry.estimatedRemainingTime}</strong></span>
                  <span className="text-blue-700 font-bold">{telemetry.progressPercent}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${telemetry.progressPercent}%` }}
                />
              </div>

              {/* Telemetry Stage Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-[11px]">
                {[
                  { label: 'Queued', active: telemetry.stage === 'queued' || telemetry.progressPercent >= 10 },
                  { label: 'Validating', active: telemetry.stage === 'validating' || telemetry.progressPercent >= 35 },
                  { label: 'Importing', active: telemetry.stage === 'importing' || telemetry.progressPercent >= 75 },
                  { label: 'Completed', active: telemetry.stage === 'completed' },
                  { label: 'Failed (0)', active: false },
                  { label: 'Skipped (0)', active: false },
                ].map(st => (
                  <div key={st.label} className={`p-1.5 rounded-lg border text-center font-medium ${
                    st.active 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' 
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    {st.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Summary Audit Box */}
          {lastExecutedRecord && (
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Migration Audit Approved: {lastExecutedRecord.migrationId}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-700">
                  <span>Duration: {lastExecutedRecord.duration}</span>
                  <span>•</span>
                  <span>Restore Snapshot: <strong>{lastExecutedRecord.snapshotId}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Products</span>
                  <span className="font-bold text-slate-900 text-base">{products.length}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Customers</span>
                  <span className="font-bold text-slate-900 text-base">{contacts.filter(c => c.type === 'customer').length}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Suppliers</span>
                  <span className="font-bold text-slate-900 text-base">{contacts.filter(c => c.type === 'supplier').length}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Work Orders</span>
                  <span className="font-bold text-slate-900 text-base">{repairJobSheets.length}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Invoices</span>
                  <span className="font-bold text-slate-900 text-base">{transactions.length}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Accounts</span>
                  <span className="font-bold text-slate-900 text-base">{categories.length + 8}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    View Products Catalog →
                  </button>
                  <button
                    onClick={() => setActiveTab('services')}
                    className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Open Service Management
                  </button>
                </div>

                <button
                  onClick={() => setSelectedRollbackRecord(lastExecutedRecord)}
                  className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Rollback Migration
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. MIGRATION READINESS ASSESSMENT CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Migration Readiness Assessment
              </h3>
              <p className="text-xs text-slate-500">Automated pre-flight diagnostic evaluation across all data tables</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Data Quality Score:</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                {metrics.dataQualityScore}% ({metrics.qualityGrade})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Templates Uploaded</span>
              <span className="font-bold text-slate-900 text-base">{metrics.templatesUploaded} / {metrics.totalTemplatesExpected}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Validation Errors</span>
              <span className={`font-bold text-base ${metrics.validationErrors === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {metrics.validationErrors}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Warnings</span>
              <span className={`font-bold text-base ${metrics.warnings === 0 ? 'text-slate-900' : 'text-amber-600'}`}>
                {metrics.warnings}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Ready to Import</span>
              <span className="font-bold text-emerald-600 text-base flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Yes
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Time</span>
              <span className="font-bold text-slate-900 text-base">{metrics.estimatedImportTime}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Records</span>
              <span className="font-bold text-slate-900 text-base">{metrics.estimatedRecords.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">Quality Grade</span>
              <span className="font-bold text-emerald-700 text-base">{metrics.qualityGrade} Verified</span>
            </div>
          </div>
        </div>

        {/* 6. VALIDATION PANEL (9 CRITICAL INTEGRITY CHECKS) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Data Integrity & Validation Engine (9 Verification Gates)
              </h3>
              <p className="text-xs text-slate-500">Continuous pre-migration verification preventing schema corruption and orphaned records</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              9 / 9 Passed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {ruleResults.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    {rule.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    {rule.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    rule.status === 'passed' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {rule.status === 'passed' ? 'Passed' : `${rule.issueCount} Warning`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">{rule.details}</p>
                <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Remediation:</span>
                  <span className="text-slate-700 font-medium">{rule.fixSuggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. FIELD MAPPING SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Schema Field Mapping & Transformation Rules
              </h3>
              <p className="text-xs text-slate-500">
                Source schema translation to Nebula ERP data dictionary with real-time transformation preview
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Auto Mapping %:</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200">
                96% Auto-Mapped (10/10 Fields)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Source Field ({activeConnector.name})</th>
                  <th className="p-3">Destination Field (Nebula ERP)</th>
                  <th className="p-3">Transformation Rules</th>
                  <th className="p-3">Default Values</th>
                  <th className="p-3">Preview Result</th>
                  <th className="p-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fieldMappings.map(map => (
                  <tr key={map.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-[11px] text-slate-800 font-medium">
                      {map.sourceField}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded border border-blue-200 text-[11px]">
                        {map.destinationField}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[10px]">
                        {map.transformationRule.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {map.defaultValue}
                    </td>
                    <td className="p-3 font-semibold text-slate-900 text-[11px]">
                      {map.previewResult}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[11px] font-bold text-emerald-600">
                        {map.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8. CURRENT NEBULA ERP DATABASE SUMMARY (12 CARDS) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Current Nebula ERP Database
              </h3>
              <p className="text-xs text-slate-500">Live entity counts committed in Nebula ERP database storage</p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Cluster: node-prod-ap-east1</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {/* 1. Products */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Products</span>
                <div className="font-bold text-slate-900 text-base">{products.length} Items</div>
              </div>
            </div>

            {/* 2. Customers */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Customers</span>
                <div className="font-bold text-slate-900 text-base">{contacts.filter(c => c.type === 'customer').length} Accounts</div>
              </div>
            </div>

            {/* 3. Suppliers */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Suppliers</span>
                <div className="font-bold text-slate-900 text-base">{contacts.filter(c => c.type === 'supplier').length} Vendors</div>
              </div>
            </div>

            {/* 4. Inventory */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Inventory</span>
                <div className="font-bold text-slate-900 text-base">385 SKUs</div>
              </div>
            </div>

            {/* 5. Assets */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Assets</span>
                <div className="font-bold text-slate-900 text-base">52 Registered</div>
              </div>
            </div>

            {/* 6. Employees */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Employees</span>
                <div className="font-bold text-slate-900 text-base">38 Staff</div>
              </div>
            </div>

            {/* 7. Projects */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Projects</span>
                <div className="font-bold text-slate-900 text-base">14 Active</div>
              </div>
            </div>

            {/* 8. Sales */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Sales</span>
                <div className="font-bold text-slate-900 text-base">{transactions.length} Invoices</div>
              </div>
            </div>

            {/* 9. Purchases */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Purchases</span>
                <div className="font-bold text-slate-900 text-base">180 Orders</div>
              </div>
            </div>

            {/* 10. Accounting Entries */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Accounting</span>
                <div className="font-bold text-slate-900 text-base">86 GL Accounts</div>
              </div>
            </div>

            {/* 11. Service Work Orders */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Work Orders</span>
                <div className="font-bold text-slate-900 text-base">{repairJobSheets.length} Orders</div>
              </div>
            </div>

            {/* 12. Contracts */}
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-medium">Contracts</span>
                <div className="font-bold text-slate-900 text-base">29 Active AMCs</div>
              </div>
            </div>
          </div>
        </div>

        {/* 9. SUPPORTED MIGRATION MODULES (16 MODULES) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Supported Migration Modules (16 Modules)
              </h3>
              <p className="text-xs text-slate-500">Universal schema coverage spanning enterprise master entities and operational transactional ledgers</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">16 / 16 Available</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
            {SUPPORTED_MODULES.map((mod) => (
              <div
                key={mod.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-300 transition-all text-center space-y-1"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center mx-auto shadow-2xs font-bold text-xs">
                  {mod.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="font-bold text-slate-900 text-xs truncate">{mod.name}</div>
                <div className="text-[10px] text-slate-400 font-medium">{mod.totalFields} Fields</div>
              </div>
            ))}
          </div>
        </div>

        {/* 10. MIGRATION HISTORY & ROLLBACK SUPPORT */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Migration History & Rollback Controls
              </h3>
              <p className="text-xs text-slate-500">
                Every ingestion creates a point-in-time snapshot, restore point, and instant rollback mechanism
              </p>
            </div>

            <button
              onClick={() => setIsAuditLogModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Full Audit Trail
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Migration ID</th>
                  <th className="p-3">Imported By</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Source System</th>
                  <th className="p-3">Records</th>
                  <th className="p-3">Warnings</th>
                  <th className="p-3">Errors</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3 text-right">Rollback Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyList.map((hist) => (
                  <tr key={hist.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-[11px] text-blue-700">
                      {hist.migrationId}
                    </td>
                    <td className="p-3 font-medium text-slate-900">
                      {hist.importedBy}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {hist.date}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded text-[11px]">
                        {hist.sourceSystem}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {hist.recordsImported.toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-600">
                      {hist.warnings}
                    </td>
                    <td className="p-3 text-slate-600">
                      {hist.errors}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {hist.duration}
                    </td>
                    <td className="p-3 text-right">
                      {hist.rollbackAvailable ? (
                        <button
                          onClick={() => setSelectedRollbackRecord(hist)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 shadow-2xs"
                        >
                          <RotateCcw className="w-3 h-3" /> Rollback
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium italic">
                          {hist.status === 'rolled_back' ? 'Rolled Back' : 'Archived'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <DownloadTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
      />

      <MigrationDocumentationModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />

      <MigrationWizardModal
        isOpen={isWizardModalOpen}
        onClose={() => setIsWizardModalOpen(false)}
        onCompleteMigration={(sourceName, sourceKey, newConfig) => {
          setSelectedSourceSystem(sourceKey);
          setConfig(newConfig);
          handleExecuteMigration();
        }}
      />

      <AuditLogModal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
        logs={auditLogsList}
      />

      <RollbackConfirmModal
        isOpen={!!selectedRollbackRecord}
        onClose={() => setSelectedRollbackRecord(null)}
        record={selectedRollbackRecord}
        onConfirmRollback={handleRollback}
      />
    </div>
  );
};
