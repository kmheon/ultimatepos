import { 
  MigrationSnapshotManager, 
  MigrationTemplateGenerator,
  SUPPORTED_CONNECTORS,
  SUPPORTED_MODULES 
} from '../migration/migrationEngine.service';

export interface MigrationOverviewStats {
  totalMigrationsRun: number;
  lastMigrationDate: string;
  lastUser: string;
  activeConnectorsCount: number;
  healthStatus: 'Operational' | 'Active' | 'Idle';
  supportedSourcesCount: number;
}

let overviewStats: MigrationOverviewStats = {
  totalMigrationsRun: 14,
  lastMigrationDate: '2026-09-02 04:15 PM',
  lastUser: 'Lead IT Admin',
  activeConnectorsCount: 30,
  healthStatus: 'Operational',
  supportedSourcesCount: 30,
};

export const MigrationDataService = {
  async getMigrationStats(): Promise<MigrationOverviewStats> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { ...overviewStats };
  },

  async recordMigrationCompleted(details: { source: string; recordsCount: number; user?: string }) {
    overviewStats.totalMigrationsRun += 1;
    overviewStats.lastMigrationDate = new Date().toLocaleString();
    if (details.user) {
      overviewStats.lastUser = details.user;
    }
  },

  getSnapshotManager() {
    return MigrationSnapshotManager;
  },

  getTemplateGenerator() {
    return MigrationTemplateGenerator;
  },

  getConnectors() {
    return SUPPORTED_CONNECTORS;
  },

  getModules() {
    return SUPPORTED_MODULES;
  }
};
