import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BackupService, CreateBackupParams } from './backup.service';
import { RestoreService, ExecuteRestoreParams } from './restore.service';
import { MigrationDataService } from './migration.service';
import { ArchiveService } from './archive.service';
import { MaintenanceService } from './maintenance.service';

export const DATA_MANAGEMENT_KEYS = {
  backups: ['dataManagement', 'backups'] as const,
  schedules: ['dataManagement', 'schedules'] as const,
  storageProviders: ['dataManagement', 'storageProviders'] as const,
  disasterRecovery: ['dataManagement', 'disasterRecovery'] as const,
  restorePreview: (id: string) => ['dataManagement', 'restorePreview', id] as const,
  migrationStats: ['dataManagement', 'migrationStats'] as const,
  archives: ['dataManagement', 'archives'] as const,
  dbMetrics: ['dataManagement', 'dbMetrics'] as const,
  cleanupRules: ['dataManagement', 'cleanupRules'] as const,
};

// Backups Hooks
export function useBackupsQuery() {
  return useQuery({
    queryKey: DATA_MANAGEMENT_KEYS.backups,
    queryFn: () => BackupService.getBackups(),
  });
}

export function useCreateBackupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateBackupParams) => BackupService.createBackup(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.backups });
    },
  });
}

export function useVerifyBackupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BackupService.verifyBackup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.backups });
    },
  });
}

export function useDeleteBackupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BackupService.deleteBackup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.backups });
    },
  });
}

// Schedules Hooks
export function useBackupSchedulesQuery() {
  return useQuery({
    queryKey: DATA_MANAGEMENT_KEYS.schedules,
    queryFn: () => BackupService.getSchedules(),
  });
}

export function useToggleScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BackupService.toggleSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.schedules });
    },
  });
}

// Storage Providers Hook
export function useStorageProvidersQuery() {
  return useQuery({
    queryKey: DATA_MANAGEMENT_KEYS.storageProviders,
    queryFn: () => BackupService.getStorageProviders(),
  });
}

// Disaster Recovery Hooks
export function useDisasterRecoveryQuery() {
  return useQuery({
    queryKey: DATA_MANAGEMENT_KEYS.disasterRecovery,
    queryFn: () => RestoreService.getDisasterRecoveryStatus(),
  });
}

export function useRestorePreviewQuery(backupId: string, enabled = true) {
  return useQuery({
    queryKey: DATA_MANAGEMENT_KEYS.restorePreview(backupId),
    queryFn: () => RestoreService.getRestorePreview(backupId),
    enabled: enabled && Boolean(backupId),
  });
}

export function useValidateRestoreMutation() {
  return useMutation({
    mutationFn: (backupId: string) => RestoreService.validateRestore(backupId),
  });
}

export function useExecuteRestoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: ExecuteRestoreParams & { onProgress?: (pct: number, step: string) => void }) => 
      RestoreService.executeRestore(params, params.onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.disasterRecovery });
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.backups });
    },
  });
}

export function useRunRecoveryTestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => RestoreService.runDisasterRecoveryTest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.disasterRecovery });
    },
  });
}

// Migration Stats Hook
export function useMigrationStatsQuery() {
  return useQuery({
    queryKey: DATA_MANAGEMENT_KEYS.migrationStats,
    queryFn: () => MigrationDataService.getMigrationStats(),
  });
}

// Archives Hooks
export function useArchivesQuery() {
  return useQuery({
    queryKey: DATA_MANAGEMENT_KEYS.archives,
    queryFn: () => ArchiveService.getArchives(),
  });
}

export function useCreateArchiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { name: string; module: string; olderThanYears: number }) => 
      ArchiveService.createArchive(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.archives });
    },
  });
}

// Maintenance & Cleanup Hooks
export function useDatabaseMetricsQuery() {
  return useQuery({
    queryKey: DATA_MANAGEMENT_KEYS.dbMetrics,
    queryFn: () => MaintenanceService.getDatabaseMetrics(),
  });
}

export function useOptimizeDatabaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => MaintenanceService.runVacuumAnalyze(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.dbMetrics });
    },
  });
}

export function useReindexDatabaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => MaintenanceService.reindexAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.dbMetrics });
    },
  });
}

export function useCleanupRulesQuery() {
  return useQuery({
    queryKey: DATA_MANAGEMENT_KEYS.cleanupRules,
    queryFn: () => MaintenanceService.getCleanupRules(),
  });
}

export function useExecuteCleanupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => MaintenanceService.executeCleanup(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.cleanupRules });
      queryClient.invalidateQueries({ queryKey: DATA_MANAGEMENT_KEYS.dbMetrics });
    },
  });
}
