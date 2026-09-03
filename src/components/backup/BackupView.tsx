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
  ShieldAlert
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface BackupItem {
  id: string;
  filename: string;
  size: string;
  date: string;
  type: 'Database (SQL Dump)' | 'Full System & Media (ZIP)';
}

export const BackupView: React.FC = () => {
  const [backups, setBackups] = useState<BackupItem[]>([
    { id: '1', filename: 'ultimatepos_db_backup_2026_09_01_1000.sql', size: '14.2 MB', date: '2026-09-01 10:00 AM', type: 'Database (SQL Dump)' },
    { id: '2', filename: 'ultimatepos_full_backup_2026_08_25_2300.zip', size: '86.4 MB', date: '2026-08-25 11:00 PM', type: 'Full System & Media (ZIP)' },
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBackup = () => {
    setIsCreating(true);
    setTimeout(() => {
      const now = new Date();
      const filename = `ultimatepos_db_backup_${now.toISOString().slice(0, 10).replace(/-/g, '_')}_${Date.now().toString().slice(-4)}.sql`;
      setBackups([
        {
          id: Date.now().toString(),
          filename,
          size: '14.5 MB',
          date: 'Just now',
          type: 'Database (SQL Dump)',
        },
        ...backups
      ]);
      setIsCreating(false);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Administer System Backup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create snapshot dumps of transactions, inventory tables, and customer ledgers.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
        >
          {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>{isCreating ? 'Generating SQL Dump...' : 'Create New Backup'}</span>
        </button>
      </div>

      {/* Backup Status Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Automated Daily Backups</div>
            <div className="font-bold text-slate-900 text-sm">Cron Schedule: Daily at 02:00 AM UTC</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cloud Storage Target: Local Server & S3 Storage
            </div>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Backup File Name</th>
                <th className="px-4 py-3">Backup Type</th>
                <th className="px-4 py-3">File Size</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {backups.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600 shrink-0" />
                    {b.filename}
                  </td>
                  <td className="px-4 py-3.5 font-medium">{b.type}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{b.size}</td>
                  <td className="px-4 py-3.5 text-slate-500">{b.date}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => alert(`Downloading backup file: ${b.filename}`)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                      <button
                        onClick={() => setBackups(backups.filter(item => item.id !== b.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
};
