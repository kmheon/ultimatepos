import React, { useState } from 'react';
import { 
  Wrench, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Sliders, 
  Zap,
  Play
} from 'lucide-react';
import { 
  useDatabaseMetricsQuery, 
  useOptimizeDatabaseMutation, 
  useReindexDatabaseMutation 
} from '../../services/dataManagement/useDataManagement';

export const DatabaseMaintenanceSubView: React.FC = () => {
  const { data: metrics } = useDatabaseMetricsQuery();
  const optimizeMutation = useOptimizeDatabaseMutation();
  const reindexMutation = useReindexDatabaseMutation();

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleVacuum = async () => {
    try {
      const res = await optimizeMutation.mutateAsync();
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReindex = async () => {
    try {
      const res = await reindexMutation.mutateAsync();
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Database Storage Volume</span>
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{metrics?.databaseSize || '1.42 GB'}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{metrics?.totalTables || 64} relational tables active</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Index Fragmentation</span>
            <Sliders className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">{metrics?.indexFragmentation || '0.8% (Optimal)'}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">B-tree query lookups within &lt;2ms</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Cache Hit Ratio</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{metrics?.cacheHitRatio || '99.4%'}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Shared memory buffer efficiency</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Last Deep Optimization</span>
            <Wrench className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm font-black text-slate-900 mt-1.5">{metrics?.lastOptimized || '2026-09-02 03:30 AM'}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Automated maintenance routine</div>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              VACUUM FULL & ANALYZE
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Reclaims unused disk space from deleted/updated tuples and recalculates query planner statistics.
            </p>
          </div>
          <button
            type="button"
            onClick={handleVacuum}
            disabled={optimizeMutation.isPending}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {optimizeMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{optimizeMutation.isPending ? 'Executing VACUUM...' : 'Run Vacuum & Analyze'}</span>
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Rebuild All Table Indices
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Reconstructs all primary key, foreign key, and text search indices to eliminate index bloat.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReindex}
            disabled={reindexMutation.isPending}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {reindexMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{reindexMutation.isPending ? 'Reindexing Tables...' : 'Execute Reindex Operation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
