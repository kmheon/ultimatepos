import React, { useState } from 'react';
import { 
  Archive, 
  Download, 
  FolderArchive, 
  Plus, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Layers, 
  Check 
} from 'lucide-react';
import { 
  useArchivesQuery, 
  useCreateArchiveMutation 
} from '../../services/dataManagement/useDataManagement';

export const ArchiveCenterSubView: React.FC = () => {
  const { data: archives = [] } = useArchivesQuery();
  const createArchiveMutation = useCreateArchiveMutation();

  const [showModal, setShowModal] = useState(false);
  const [archiveName, setArchiveName] = useState('');
  const [archiveModule, setArchiveModule] = useState('sales_invoices');
  const [olderThanYears, setOlderThanYears] = useState(2);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createArchiveMutation.mutateAsync({
        name: archiveName || 'Fiscal Year Archive',
        module: archiveModule,
        olderThanYears,
      });
      setShowModal(false);
      setSuccessNotice(`Archive created: ${res.name} (${res.recordCount.toLocaleString()} records archived).`);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-indigo-600" />
              Long-Term Data Archiving & Compliance Vault
            </h3>
            <p className="text-xs text-slate-500">
              Move closed fiscal years and legacy work orders to compressed cold storage for regulatory retention.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Archive Old Records</span>
          </button>
        </div>

        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Archives Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Archive Container</th>
                <th className="px-4 py-3">Date Archived</th>
                <th className="px-4 py-3">Records Contained</th>
                <th className="px-4 py-3">Date Range</th>
                <th className="px-4 py-3">Compressed Size</th>
                <th className="px-4 py-3">Vault Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {archives.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <Archive className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div>{a.name}</div>
                      <span className="text-[10px] font-mono text-slate-400">{a.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{a.dateArchived}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{a.recordCount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-slate-600">{a.dataRange}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">{a.size}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Exporting audit package for ${a.name}...`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Archive Historical Data</h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Archive Name / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY 2024 Final Closed Ledger"
                  value={archiveName}
                  onChange={e => setArchiveName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Module</label>
                <select
                  value={archiveModule}
                  onChange={e => setArchiveModule(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="sales_invoices">Sales & POS Closed Invoices</option>
                  <option value="purchases">Completed Purchase Orders</option>
                  <option value="service_orders">Closed Repair & Service Reports</option>
                  <option value="audit_logs">Historical Security Logs</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Retention Filter</label>
                <select
                  value={olderThanYears}
                  onChange={e => setOlderThanYears(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value={1}>Older than 1 Year</option>
                  <option value={2}>Older than 2 Years (Standard)</option>
                  <option value={3}>Older than 3 Years</option>
                  <option value={5}>Older than 5 Years</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createArchiveMutation.isPending}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                >
                  {createArchiveMutation.isPending ? 'Archiving...' : 'Start Archiving'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
