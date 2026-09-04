import React, { useState } from 'react';
import { 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  useCleanupRulesQuery, 
  useExecuteCleanupMutation 
} from '../../services/dataManagement/useDataManagement';

export const DataCleanupSubView: React.FC = () => {
  const { data: rules = [] } = useCleanupRulesQuery();
  const cleanupMutation = useExecuteCleanupMutation();

  const [activeRunningId, setActiveRunningId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleRunRule = async (ruleId: string, title: string) => {
    setActiveRunningId(ruleId);
    try {
      const res = await cleanupMutation.mutateAsync(ruleId);
      setSuccessNotice(`Cleanup completed for "${title}". Freed ${res.freedMB} of storage.`);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setActiveRunningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Automated Data Cleanup & Garbage Collection
          </h3>
          <p className="text-xs text-slate-500">
            Safely purge orphaned draft states, temporary token locks, and expired logs without touching business-critical ledgers.
          </p>
        </div>

        {successNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{rule.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rule.safetyLevel === 'Safe' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rule.safetyLevel} Operation
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{rule.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <div className="text-[11px] text-slate-600">
                  Target items: <strong>{rule.targetCount.toLocaleString()}</strong> (~{rule.estimatedSpaceSavings})
                </div>
                <button
                  type="button"
                  onClick={() => handleRunRule(rule.id, rule.title)}
                  disabled={activeRunningId === rule.id}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {activeRunningId === rule.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>{activeRunningId === rule.id ? 'Purging...' : 'Purge Now'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
