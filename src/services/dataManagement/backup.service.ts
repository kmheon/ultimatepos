import { 
  BackupItem, 
  BackupScheduleConfig, 
  BackupType, 
  StorageProvider, 
  StorageProviderConfig,
  BackupScheduleFrequency
} from '../../types/dataManagement';

// Mock in-memory store with realistic ERP data
let backupsStore: BackupItem[] = [
  {
    id: 'BKP-2026-0901-01',
    filename: 'nebula_full_sys_2026_09_01_0200.bak',
    date: '2026-09-01 02:00 AM',
    createdBy: 'System Automated (Cron)',
    backupType: 'full',
    backupTypeLabel: 'Full System Snapshot',
    size: '148.6 MB',
    storageLocation: 's3',
    storageLocationLabel: 'Amazon S3 (Primary Bucket)',
    encryptionStatus: 'AES-256',
    digitalSignature: 'RSA-4096:SHA256:7f9a8b1c4e...',
    integrityStatus: 'Verified (SHA-256)',
    healthScore: 100,
    scope: ['Entire ERP', 'Database', 'Media', 'Documents', 'Configs'],
    canRestore: true,
  },
  {
    id: 'BKP-2026-0831-02',
    filename: 'nebula_db_trans_2026_08_31_1800.sql.gz',
    date: '2026-08-31 06:00 PM',
    createdBy: 'David Admin (Admin)',
    backupType: 'db_only',
    backupTypeLabel: 'Database Only',
    size: '34.2 MB',
    storageLocation: 'azure',
    storageLocationLabel: 'Azure Blob Storage (Archive)',
    encryptionStatus: 'AES-256',
    digitalSignature: 'RSA-4096:SHA256:4c2d8e9f1a...',
    integrityStatus: 'Verified (SHA-256)',
    healthScore: 98,
    scope: ['PostgreSQL Database', 'Sales', 'Accounting', 'Inventory'],
    canRestore: true,
  },
  {
    id: 'BKP-2026-0830-03',
    filename: 'nebula_inc_2026_08_30_2200.tar.enc',
    date: '2026-08-30 10:00 PM',
    createdBy: 'System Automated (Cron)',
    backupType: 'incremental',
    backupTypeLabel: 'Incremental Backup',
    size: '12.4 MB',
    storageLocation: 'nas',
    storageLocationLabel: 'Network Storage (NAS-01)',
    encryptionStatus: 'AES-256',
    digitalSignature: 'RSA-4096:SHA256:3a1b5c7d9e...',
    integrityStatus: 'Verified (SHA-256)',
    healthScore: 99,
    scope: ['Delta Changes', 'Transaction Journals'],
    canRestore: true,
  },
  {
    id: 'BKP-2026-0828-04',
    filename: 'nebula_config_docs_2026_08_28_1400.zip',
    date: '2026-08-28 02:00 PM',
    createdBy: 'Sarah Operations (Mgr)',
    backupType: 'config_only',
    backupTypeLabel: 'Configuration Only',
    size: '4.8 MB',
    storageLocation: 'local',
    storageLocationLabel: 'Local Server Storage',
    encryptionStatus: 'Password Protected',
    digitalSignature: 'RSA-4096:SHA256:9f8e7d6c5b...',
    integrityStatus: 'Verified (SHA-256)',
    healthScore: 95,
    scope: ['Tax Rules', 'Invoice Layouts', 'Store Settings', 'User Roles'],
    canRestore: true,
  }
];

let schedulesStore: BackupScheduleConfig[] = [
  {
    id: 'SCHED-01',
    name: 'Nightly Full System Vault',
    frequency: 'daily',
    backupType: 'full',
    storageTarget: 's3',
    retentionCopies: 30,
    encryptionEnabled: true,
    enabled: true,
    lastRun: '2026-09-01 02:00 AM',
    nextRun: '2026-09-02 02:00 AM',
  },
  {
    id: 'SCHED-02',
    name: 'Hourly Transaction Log Incremental',
    frequency: 'hourly',
    backupType: 'incremental',
    storageTarget: 'azure',
    retentionCopies: 48,
    encryptionEnabled: true,
    enabled: true,
    lastRun: '1 hour ago',
    nextRun: 'In 45 minutes',
  },
  {
    id: 'SCHED-03',
    name: 'Pre-Migration Safety Snapshot',
    frequency: 'before_migration',
    backupType: 'db_only',
    storageTarget: 'local',
    retentionCopies: 10,
    encryptionEnabled: true,
    enabled: true,
    lastRun: '2026-08-31 06:00 PM',
    nextRun: 'Automatic on Data Migration trigger',
  },
  {
    id: 'SCHED-04',
    name: 'Weekly Offline Deep Archive',
    frequency: 'weekly',
    backupType: 'full',
    storageTarget: 'nas',
    retentionCopies: 52,
    encryptionEnabled: true,
    enabled: true,
    lastRun: '2026-08-25 03:00 AM',
    nextRun: '2026-09-01 03:00 AM',
  }
];

const storageProvidersStore: StorageProviderConfig[] = [
  { id: 'local', name: 'Local Storage', type: 'Filesystem (Encrypted volume)', connected: true, targetPath: '/var/backups/nebula-erp/', lastSync: '10 min ago', details: 'High-speed local NVMe mount' },
  { id: 'nas', name: 'Network Storage (NAS)', type: 'NFS / SMB v3', connected: true, targetPath: 'smb://192.168.10.45/backup_share', lastSync: '1 hour ago', details: 'Synology Enterprise Rackmount' },
  { id: 's3', name: 'Amazon S3', type: 'Cloud Object Storage', connected: true, targetPath: 's3://nebula-erp-prod-backups-sg/', lastSync: '35 min ago', details: 'US-East-1 AWS Glacier Flexible Vault' },
  { id: 'azure', name: 'Azure Blob Storage', type: 'Cloud Object Storage', connected: true, targetPath: 'https://nebulaerpbkp.blob.core.windows.net/', lastSync: '2 hours ago', details: 'Hot tier with geo-redundant storage (GRS)' },
  { id: 'gdrive', name: 'Google Drive', type: 'Google Workspace Storage', connected: true, targetPath: 'Google Drive Enterprise/Backups', lastSync: 'Yesterday', details: 'Service Account Token Authorized' },
  { id: 'onedrive', name: 'Microsoft OneDrive', type: 'Office 365 Cloud', connected: false, targetPath: 'OneDrive for Business/ERP', details: 'Requires OAuth re-authentication' },
  { id: 'dropbox', name: 'Dropbox Business', type: 'Cloud File Sync', connected: false, targetPath: 'Dropbox/Nebula-Backups', details: 'Configured in read-only mode' },
  { id: 'sftp', name: 'SFTP / Remote Server', type: 'SSH File Transfer', connected: true, targetPath: 'sftp://backup-node.internal:22/backups', lastSync: '4 hours ago', details: 'Public-key authentication enabled' },
  { id: 'ftp', name: 'FTP Server', type: 'Legacy File Transfer', connected: false, targetPath: 'ftp://ftp.offsite.org/backups', details: 'Disabled for compliance reasons' },
  { id: 'custom_cloud', name: 'Custom Cloud Storage (S3-Compatible)', type: 'MinIO / Cloudflare R2', connected: true, targetPath: 'https://r2.nebulaerp.cloud/cold-vault', lastSync: 'Yesterday', details: 'Zero-egress fee encrypted archive' },
];

export interface CreateBackupParams {
  backupType: BackupType;
  storageLocation: StorageProvider;
  scope: string[];
  encryption: 'AES-256' | 'Password Protected' | 'Unencrypted';
  password?: string;
  notes?: string;
}

export const BackupService = {
  async getBackups(): Promise<BackupItem[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [...backupsStore];
  },

  async createBackup(params: CreateBackupParams): Promise<BackupItem> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const typeLabels: Record<BackupType, string> = {
      full: 'Full System Snapshot',
      incremental: 'Incremental Backup',
      differential: 'Differential Backup',
      db_only: 'Database Only',
      files_only: 'Files & Media Only',
      docs_only: 'Documents Only',
      config_only: 'Configuration Only',
    };

    const providerLabels: Record<StorageProvider, string> = {
      local: 'Local Storage',
      nas: 'Network Storage (NAS)',
      s3: 'Amazon S3 Storage',
      azure: 'Azure Blob Storage',
      gdrive: 'Google Drive',
      onedrive: 'Microsoft OneDrive',
      dropbox: 'Dropbox Business',
      sftp: 'Secure SFTP Server',
      ftp: 'FTP Server',
      custom_cloud: 'Custom S3 Cloud Storage',
    };

    const newBackup: BackupItem = {
      id: `BKP-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`,
      filename: `nebula_${params.backupType}_${now.toISOString().slice(0, 10).replace(/-/g, '_')}_${Date.now().toString().slice(-4)}.bak`,
      date: dateFormatted,
      createdBy: 'Active Operator (Manual Request)',
      backupType: params.backupType,
      backupTypeLabel: typeLabels[params.backupType],
      size: params.backupType === 'full' ? '154.2 MB' : params.backupType === 'db_only' ? '36.8 MB' : '18.4 MB',
      storageLocation: params.storageLocation,
      storageLocationLabel: providerLabels[params.storageLocation],
      encryptionStatus: params.encryption,
      digitalSignature: `RSA-4096:SHA256:${Math.random().toString(36).substring(2, 12)}...`,
      integrityStatus: 'Verified (SHA-256)',
      healthScore: 100,
      scope: params.scope.length > 0 ? params.scope : ['Entire ERP'],
      canRestore: true,
    };

    backupsStore = [newBackup, ...backupsStore];
    return newBackup;
  },

  async verifyBackup(id: string): Promise<{ success: boolean; hash: string; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const backup = backupsStore.find(b => b.id === id);
    if (!backup) throw new Error('Backup not found');

    backup.integrityStatus = 'Integrity Check Passed';
    backup.healthScore = 100;
    return {
      success: true,
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      message: `Integrity SHA-256 hash matched and verified successfully against stored catalog checksum.`
    };
  },

  async deleteBackup(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    backupsStore = backupsStore.filter(b => b.id !== id);
    return true;
  },

  async getSchedules(): Promise<BackupScheduleConfig[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...schedulesStore];
  },

  async updateSchedule(config: Partial<BackupScheduleConfig> & { id: string }): Promise<BackupScheduleConfig> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = schedulesStore.findIndex(s => s.id === config.id);
    if (idx === -1) throw new Error('Schedule not found');
    schedulesStore[idx] = { ...schedulesStore[idx], ...config };
    return schedulesStore[idx];
  },

  async toggleSchedule(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const idx = schedulesStore.findIndex(s => s.id === id);
    if (idx !== -1) {
      schedulesStore[idx].enabled = !schedulesStore[idx].enabled;
      return schedulesStore[idx].enabled;
    }
    return false;
  },

  async getStorageProviders(): Promise<StorageProviderConfig[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...storageProvidersStore];
  }
};
