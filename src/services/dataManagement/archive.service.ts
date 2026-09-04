export interface ArchiveItem {
  id: string;
  name: string;
  dateArchived: string;
  recordCount: number;
  dataRange: string;
  size: string;
  archivedBy: string;
  status: 'Archived (Compressed)' | 'Glacier Cold Vault';
}

let archivesStore: ArchiveItem[] = [
  {
    id: 'ARC-2024-FY',
    name: 'Fiscal Year 2024 Closed Ledger & Invoices',
    dateArchived: '2025-01-15',
    recordCount: 52400,
    dataRange: 'Jan 2024 - Dec 2024',
    size: '84.2 MB',
    archivedBy: 'Compliance Auditor',
    status: 'Archived (Compressed)',
  },
  {
    id: 'ARC-2023-FY',
    name: 'Fiscal Year 2023 POS Sales & Stock Adjustments',
    dateArchived: '2024-01-20',
    recordCount: 48900,
    dataRange: 'Jan 2023 - Dec 2023',
    size: '76.1 MB',
    archivedBy: 'Chief Accountant',
    status: 'Glacier Cold Vault',
  },
  {
    id: 'ARC-REPAIR-HIST',
    name: 'Legacy Field Service Reports (2022-2023)',
    dateArchived: '2024-06-10',
    recordCount: 21800,
    dataRange: 'May 2022 - Jun 2023',
    size: '41.5 MB',
    archivedBy: 'Service Director',
    status: 'Archived (Compressed)',
  }
];

export const ArchiveService = {
  async getArchives(): Promise<ArchiveItem[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [...archivesStore];
  },

  async createArchive(params: { name: string; module: string; olderThanYears: number }): Promise<ArchiveItem> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const now = new Date();
    const newArchive: ArchiveItem = {
      id: `ARC-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: params.name,
      dateArchived: now.toLocaleDateString(),
      recordCount: Math.floor(15000 + Math.random() * 25000),
      dataRange: `Prior to ${now.getFullYear() - params.olderThanYears}`,
      size: `${(Math.random() * 50 + 20).toFixed(1)} MB`,
      archivedBy: 'Active Administrator',
      status: 'Archived (Compressed)',
    };
    archivesStore = [newArchive, ...archivesStore];
    return newArchive;
  },

  async unarchive(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    archivesStore = archivesStore.filter(a => a.id !== id);
    return true;
  }
};
