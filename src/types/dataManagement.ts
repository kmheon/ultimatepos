export type StorageProvider = 
  | 'local'
  | 'nas'
  | 'gdrive'
  | 'onedrive'
  | 'dropbox'
  | 's3'
  | 'azure'
  | 'ftp'
  | 'sftp'
  | 'custom_cloud';

export type BackupType = 
  | 'full'
  | 'incremental'
  | 'differential'
  | 'db_only'
  | 'files_only'
  | 'docs_only'
  | 'config_only';

export type BackupScheduleFrequency = 
  | 'manual'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'before_updates'
  | 'before_migration'
  | 'before_restore'
  | 'before_bulk_import';

export type RestoreScopeOption = 
  | 'entire_erp'
  | 'company'
  | 'accounting'
  | 'inventory'
  | 'sales'
  | 'purchases'
  | 'crm'
  | 'hr'
  | 'assets'
  | 'service_management'
  | 'manufacturing'
  | 'documents'
  | 'selected_modules';

export interface BackupItem {
  id: string;
  filename: string;
  date: string;
  createdBy: string;
  backupType: BackupType;
  backupTypeLabel: string;
  size: string;
  storageLocation: StorageProvider;
  storageLocationLabel: string;
  encryptionStatus: 'AES-256' | 'Password Protected' | 'Unencrypted';
  digitalSignature: string;
  integrityStatus: 'Verified (SHA-256)' | 'Pending Verification' | 'Integrity Check Passed';
  healthScore: number; // 0 - 100
  scope: string[];
  canRestore: boolean;
}

export interface BackupScheduleConfig {
  id: string;
  name: string;
  frequency: BackupScheduleFrequency;
  backupType: BackupType;
  storageTarget: StorageProvider;
  retentionCopies: number;
  encryptionEnabled: boolean;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export interface StorageProviderConfig {
  id: StorageProvider;
  name: string;
  type: string;
  connected: boolean;
  targetPath: string;
  lastSync?: string;
  details: string;
}

export interface DisasterRecoveryStatus {
  recoveryStatus: 'Operational' | 'Standby' | 'Degraded';
  databaseIntegrity: '100% Optimal' | 'Indices Rebuilt' | 'Needs Check';
  recoveryHealthScore: number; // 0 - 100
  rto: string; // Recovery Time Objective (< 5 min)
  rpo: string; // Recovery Point Objective (< 15 min)
  lastRecoveryTest: string;
  lastTestResult: 'Passed' | 'Warning' | 'Failed';
  automatedFailover: boolean;
  logs: {
    id: string;
    timestamp: string;
    event: string;
    level: 'info' | 'success' | 'warning' | 'error';
    details: string;
  }[];
}

export interface RestorePreviewInfo {
  backupId: string;
  backupFilename: string;
  totalRecords: number;
  modulesIncluded: { name: string; count: number }[];
  compatibility: '100% Compatible' | 'Minor Migration Needed';
  schemaVersion: string;
  estimatedTimeSeconds: number;
}

export interface DataManagementOverviewCard {
  id: 'migration' | 'backup_restore' | 'import_export' | 'maintenance' | 'cleanup' | 'archive' | 'audit_recovery';
  title: string;
  description: string;
  status: 'Operational' | 'Healthy' | 'Scheduled' | 'Attention Needed' | 'Idle' | 'Active';
  statusType: 'healthy' | 'warning' | 'info' | 'active';
  lastActivity: string;
  lastUser: string;
  quickActionText: string;
  statBadge: string;
  subTab: DataManagementSubTab;
}

export type DataManagementSubTab = 
  | 'dashboard'
  | 'migration'
  | 'backup_restore'
  | 'import_export'
  | 'maintenance'
  | 'cleanup'
  | 'archive'
  | 'audit_recovery';
