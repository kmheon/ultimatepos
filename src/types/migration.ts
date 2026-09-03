export type MigrationSourceSystem = 
  | 'quickbooks'
  | 'tally'
  | 'odoo'
  | 'erpnext'
  | 'zoho'
  | 'busy'
  | 'sage'
  | 'sap_b1'
  | 'netsuite'
  | 'dynamics'
  | 'legacy_pos'
  | 'retail_pos'
  | 'custom_csv'
  | 'mysql'
  | 'mariadb'
  | 'sqlserver'
  | 'postgres'
  | 'sqlite'
  | 'sap_connector'
  | 'oracle_connector'
  | 'shopify'
  | 'woocommerce'
  | 'magento'
  | 'rest_api'
  | 'graphql'
  | 'xml_feed'
  | 'json_feed'
  | 'ftp_sftp'
  | 'cloud_storage';

export type MigrationModule = 
  | 'products'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'sales'
  | 'purchases'
  | 'accounting'
  | 'assets'
  | 'payroll'
  | 'projects'
  | 'crm'
  | 'service_management'
  | 'manufacturing'
  | 'rental'
  | 'contracts'
  | 'maintenance';

export type MigrationMode = 
  | 'safe_merge'
  | 'replace_existing'
  | 'insert_only'
  | 'preview_only';

export type DuplicateHandling = 
  | 'skip'
  | 'merge'
  | 'overwrite'
  | 'rename_automatically';

export type ConflictResolution = 
  | 'auto_match'
  | 'manual_review';

export type ValidationLevel = 
  | 'basic'
  | 'standard'
  | 'strict';

export interface MigrationConfig {
  mode: MigrationMode;
  duplicateHandling: DuplicateHandling;
  conflictResolution: ConflictResolution;
  validationLevel: ValidationLevel;
  executeInBackground: boolean;
  resumableCheckpoint: boolean;
  autoRollbackOnError: boolean;
  batchSize: number;
}

export interface MigrationReadinessMetrics {
  templatesUploaded: number;
  totalTemplatesExpected: number;
  validationErrors: number;
  warnings: number;
  readyToImport: boolean;
  estimatedImportTime: string;
  estimatedRecords: number;
  dataQualityScore: number; // 0 - 100
  qualityGrade: 'A+' | 'A' | 'B' | 'C' | 'Fail';
}

export interface ValidationRuleResult {
  id: string;
  name: string;
  category: 'schema' | 'integrity' | 'finance' | 'warehouse';
  status: 'passed' | 'warning' | 'error';
  issueCount: number;
  details: string;
  fixSuggestion: string;
  autoFixAvailable: boolean;
}

export interface FieldMappingRule {
  id: string;
  sourceField: string;
  destinationField: string;
  transformationRule: 'trim_uppercase' | 'currency_normalize' | 'date_iso' | 'sku_sanitize' | 'phone_e164' | 'boolean_cast' | 'none';
  defaultValue: string;
  previewResult: string;
  confidence: number;
  required: boolean;
  userOverridden?: boolean;
}

export type MigrationStage = 
  | 'idle'
  | 'queued'
  | 'validating'
  | 'importing'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'paused';

export interface MigrationProgressTelemetry {
  stage: MigrationStage;
  progressPercent: number;
  recordsProcessed: number;
  recordsTotal: number;
  recordsFailed: number;
  recordsSkipped: number;
  processingSpeed: number; // records / second
  estimatedRemainingTime: string;
  currentEntity: string;
  currentBatch: number;
  totalBatches: number;
}

export interface MigrationHistoryRecord {
  id: string;
  migrationId: string;
  importedBy: string;
  date: string;
  sourceSystem: string;
  sourceSystemKey: MigrationSourceSystem;
  recordsImported: number;
  warnings: number;
  errors: number;
  duration: string;
  rollbackAvailable: boolean;
  snapshotId: string;
  status: 'completed' | 'failed' | 'rolled_back';
  auditHash: string;
  details: string;
}

export interface BackupSnapshot {
  snapshotId: string;
  createdAt: string;
  name: string;
  createdBy: string;
  recordCounts: {
    products: number;
    customers: number;
    suppliers: number;
    sales: number;
    workOrders: number;
    expenses: number;
  };
  payloadBackup: any;
  auditSignature: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminUser: string;
  action: 'SNAPSHOT_CREATED' | 'VALIDATION_COMPLETED' | 'MIGRATION_EXECUTED' | 'ROLLBACK_TRIGGERED' | 'CONFIG_CHANGED' | 'MAPPING_UPDATED';
  details: string;
  ipAddress: string;
  sessionHash: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface ConnectorDefinition {
  id: MigrationSourceSystem;
  name: string;
  category: 'erp' | 'accounting' | 'pos' | 'database' | 'future_connector';
  description: string;
  badge?: string;
  formatsSupported: string[];
  status: 'connected' | 'ready' | 'beta' | 'future_ready';
  defaultModules: MigrationModule[];
  icon: string;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface ModuleDefinition {
  id: MigrationModule;
  name: string;
  description: string;
  requiredFields: string[];
  totalFields: number;
  currentCount: number;
  iconName: string;
  category: 'master' | 'transaction' | 'operations';
}
