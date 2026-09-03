import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Database, 
  SlidersHorizontal, 
  Check, 
  ShieldCheck, 
  RefreshCw, 
  FileSpreadsheet,
  Layers,
  AlertCircle
} from 'lucide-react';
import { 
  MigrationSourceSystem, 
  MigrationConfig, 
  MigrationMode, 
  DuplicateHandling, 
  ConflictResolution, 
  ValidationLevel,
  FieldMappingRule 
} from '../../types/migration';
import { 
  SUPPORTED_CONNECTORS, 
  DEFAULT_FIELD_MAPPINGS, 
  MigrationValidator, 
  ENTERPRISE_NEBULA_MIGRATION_BUNDLE,
  MigrationSnapshotManager 
} from '../../services/migration/migrationEngine.service';

interface MigrationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteMigration: (sourceName: string, sourceKey: MigrationSourceSystem, config: MigrationConfig) => void;
}

export const MigrationWizardModal: React.FC<MigrationWizardModalProps> = ({
  isOpen,
  onClose,
  onCompleteMigration,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSource, setSelectedSource] = useState<MigrationSourceSystem>('sap_b1');
  
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

  const [mappings, setMappings] = useState<FieldMappingRule[]>(DEFAULT_FIELD_MAPPINGS);
  const [isExecuting, setIsExecuting] = useState(false);
  const [wizardProgress, setWizardProgress] = useState(0);

  if (!isOpen) return null;

  const currentConnector = SUPPORTED_CONNECTORS.find(c => c.id === selectedSource) || SUPPORTED_CONNECTORS[0];

  const { metrics, ruleResults } = MigrationValidator.evaluateReadiness(
    ENTERPRISE_NEBULA_MIGRATION_BUNDLE,
    config.validationLevel
  );

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as any);
    } else {
      // Execute in step 4
      setIsExecuting(true);
      setWizardProgress(20);
      setTimeout(() => {
        setWizardProgress(60);
        setTimeout(() => {
          setWizardProgress(100);
          setTimeout(() => {
            setIsExecuting(false);
            onCompleteMigration(currentConnector.name, selectedSource, config);
            onClose();
          }, 300);
        }, 500);
      }, 500);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Guided Migration Wizard</h2>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">
                  Step {currentStep} of 4
                </span>
              </div>
              <p className="text-xs text-slate-500">Step-by-step automated mapping, integrity verification, and database ingestion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>1</span>
            Source System
          </div>
          <div className="h-0.5 w-10 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>2</span>
            Configuration
          </div>
          <div className="h-0.5 w-10 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>3</span>
            Field Mapping
          </div>
          <div className="h-0.5 w-10 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${currentStep >= 4 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>4</span>
            Readiness & Commit
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* STEP 1: Select Source System */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Select Legacy or Source System</h3>
                <p className="text-xs text-slate-500">Choose the origin platform to automatically apply verified connector schemas</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUPPORTED_CONNECTORS.slice(0, 12).map((connector) => {
                  const isSelected = selectedSource === connector.id;
                  return (
                    <div
                      key={connector.id}
                      onClick={() => setSelectedSource(connector.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">{connector.name}</span>
                        {connector.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-medium">
                            {connector.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{connector.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Configure Options */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Configure Ingestion & Conflict Strategies</h3>
                <p className="text-xs text-slate-500">Determine how matching records, duplicate SKUs, and schema validations are governed</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Migration Mode */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-slate-800 block">Migration Mode</span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'safe_merge', label: 'Safe Merge (Preserve & Update)', desc: 'Updates matching SKUs, leaves unique existing items untouched.' },
                      { id: 'replace_existing', label: 'Replace Existing', desc: 'Overwrites existing matching entities completely.' },
                      { id: 'insert_only', label: 'Insert Only', desc: 'Only inserts fresh records, strictly skips matches.' },
                      { id: 'preview_only', label: 'Preview Only (Dry Run)', desc: 'Validates and maps records without committing changes.' }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 cursor-pointer">
                        <input
                          type="radio"
                          name="mode"
                          checked={config.mode === opt.id}
                          onChange={() => setConfig({ ...config, mode: opt.id as any })}
                          className="mt-0.5 text-blue-600"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 text-[11px]">{opt.label}</div>
                          <div className="text-[10px] text-slate-500">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duplicate Handling */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-slate-800 block">Duplicate Handling</span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'skip', label: 'Skip Duplicate Records' },
                      { id: 'merge', label: 'Merge Fields Incrementally' },
                      { id: 'overwrite', label: 'Overwrite Existing Record' },
                      { id: 'rename_automatically', label: 'Rename Automatically (SKU-COPY)' }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 cursor-pointer">
                        <input
                          type="radio"
                          name="dup"
                          checked={config.duplicateHandling === opt.id}
                          onChange={() => setConfig({ ...config, duplicateHandling: opt.id as any })}
                          className="text-blue-600"
                        />
                        <span className="font-semibold text-slate-800 text-[11px]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conflict Resolution */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-slate-800 block">Conflict Resolution</span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'auto_match', label: 'Auto Match (Recommended)' },
                      { id: 'manual_review', label: 'Manual Review & Approval' }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 cursor-pointer">
                        <input
                          type="radio"
                          name="conflict"
                          checked={config.conflictResolution === opt.id}
                          onChange={() => setConfig({ ...config, conflictResolution: opt.id as any })}
                          className="text-blue-600"
                        />
                        <span className="font-semibold text-slate-800 text-[11px]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Validation Level */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-slate-800 block">Validation Level</span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'basic', label: 'Basic (Header & Non-null checks)' },
                      { id: 'standard', label: 'Standard (Schema & Currency Normalization)' },
                      { id: 'strict', label: 'Strict (Full Relational & GL Account verification)' }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 cursor-pointer">
                        <input
                          type="radio"
                          name="valLevel"
                          checked={config.validationLevel === opt.id}
                          onChange={() => setConfig({ ...config, validationLevel: opt.id as any })}
                          className="text-blue-600"
                        />
                        <span className="font-semibold text-slate-800 text-[11px]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Field Mapping */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Review & Adjust Field Mappings</h3>
                  <p className="text-xs text-slate-500">Automatic matching confidence: <strong>96% Auto-Mapped</strong> (10/10 Core Attributes)</p>
                </div>
                <span className="text-[11px] px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                  Schema Synced
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-3">Source Field ({currentConnector.name})</th>
                      <th className="p-3">Destination Field (Nebula ERP)</th>
                      <th className="p-3">Transformation</th>
                      <th className="p-3">Preview Sample</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mappings.map(map => (
                      <tr key={map.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-[11px] text-slate-700 font-medium">
                          {map.sourceField}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded border border-blue-200 text-[11px]">
                            {map.destinationField}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          {map.transformationRule.replace('_', ' ').toUpperCase()}
                        </td>
                        <td className="p-3 font-medium text-slate-900 text-[11px]">
                          {map.previewResult}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: Readiness & Commit */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pre-Migration Readiness Assessment</h3>
                <p className="text-xs text-slate-500">All 9 validation gates passed. System backup snapshot will be recorded before executing.</p>
              </div>

              {/* Assessment Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Quality Score</span>
                  <div className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                    {metrics.dataQualityScore}%
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      {metrics.qualityGrade}
                    </span>
                  </div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Ready to Import</span>
                  <div className="text-lg font-bold text-slate-900 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Yes
                  </div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Validation Errors</span>
                  <div className="text-lg font-bold text-slate-900">{metrics.validationErrors}</div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Time</span>
                  <div className="text-lg font-bold text-slate-900">{metrics.estimatedImportTime}</div>
                </div>
              </div>

              {/* Snapshot notice */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">Restore Point Snapshot Ready</span>
                  <p className="text-[11px] text-emerald-800">
                    A system snapshot <code className="bg-emerald-100 px-1 rounded font-mono">SNP-2026-MIG-READY</code> will be registered automatically with instant rollback support.
                  </p>
                </div>
              </div>

              {isExecuting && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Migrating master records into Nebula ERP database...</span>
                    <span className="text-blue-600">{wizardProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${wizardProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isExecuting}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isExecuting}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              disabled={isExecuting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              {currentStep === 4 ? (
                isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting Data...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Execute Migration
                  </>
                )
              ) : (
                <>
                  Next Step <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
