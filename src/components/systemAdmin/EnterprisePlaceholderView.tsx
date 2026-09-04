import React, { useState } from 'react';
import { 
  Database, 
  Wrench, 
  ShieldCheck, 
  Activity, 
  Clock, 
  CalendarClock, 
  HardDrive, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  Sparkles,
  Info,
  Server
} from 'lucide-react';

export type EnterprisePlaceholderType = 
  | 'database_utilities'
  | 'system_maintenance'
  | 'audit_logs'
  | 'system_health'
  | 'scheduler_jobs';

interface EnterprisePlaceholderViewProps {
  type: EnterprisePlaceholderType;
  onNavigateTab?: (tab: string) => void;
}

interface FeatureMetadata {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  targetRelease: string;
  plannedCapabilities: { name: string; desc: string; status: 'Specification Ready' | 'In Development' | 'Planned' }[];
  technicalOverview: string;
  cliCommandPreview: string;
}

const METADATA_MAP: Record<EnterprisePlaceholderType, FeatureMetadata> = {
  database_utilities: {
    title: 'Database Utilities',
    subtitle: 'PostgreSQL Relational Tuning & Schema Maintenance',
    badge: 'Database Operations',
    icon: <Database className="w-6 h-6 text-slate-700" />,
    description: 'Direct administrative utilities for schema health analysis, PostgreSQL dead tuple vacuuming, index bloat inspection, and cross-table foreign key referential integrity checks.',
    targetRelease: 'Enterprise v4.5 • Q4 Roadmap',
    plannedCapabilities: [
      { name: 'VACUUM FULL & ANALYZE', desc: 'Reclaim storage from deleted rows and refresh query optimizer statistics.', status: 'Specification Ready' },
      { name: 'B-Tree Index Defragmentation', desc: 'Rebuild high-cardinality transaction indexes without locking tables.', status: 'In Development' },
      { name: 'Connection Pool Governor', desc: 'Monitor active, idle, and waiting PgBouncer connections in real time.', status: 'Planned' },
      { name: 'Schema Drift Detection', desc: 'Diff runtime database catalogs against repository schema definitions.', status: 'Planned' },
    ],
    technicalOverview: 'Integrates natively with PostgreSQL `pg_stat_user_tables`, `pg_stat_activity`, and Drizzle ORM migrations engine.',
    cliCommandPreview: 'nebula db:tune --vacuum --analyze --reindex-bloat --threshold=15%',
  },
  system_maintenance: {
    title: 'System Maintenance',
    subtitle: 'Application Lifecycle & Offline Maintenance Mode',
    badge: 'Operations',
    icon: <Wrench className="w-6 h-6 text-slate-700" />,
    description: 'Administrative orchestrator for placing Nebula ERP into isolated maintenance mode, purging transient session stores, invalidating server micro-caches, and rotating runtime application logs.',
    targetRelease: 'Enterprise v4.5 • Q4 Roadmap',
    plannedCapabilities: [
      { name: 'Maintenance Mode Switcher', desc: 'Gracefully drain active client connections and display localized service updates.', status: 'Specification Ready' },
      { name: 'Cache & Session Purge', desc: 'Safely invalidate stale client sessions and Redis ephemeral key-value buffers.', status: 'In Development' },
      { name: 'Log Rotation & Archival', desc: 'Compress server-side logs and ship to cold cloud object storage.', status: 'Planned' },
      { name: 'Temporary Artifact Cleanup', desc: 'Purge orphaned invoice PDF previews and discarded batch upload chunks.', status: 'Specification Ready' },
    ],
    technicalOverview: 'Governed by Express server middleware interceptors and Node.js process signal dispatchers.',
    cliCommandPreview: 'nebula maintenance:enable --reason="Fiscal year migration" --drain-timeout=60s',
  },
  audit_logs: {
    title: 'System Audit Logs',
    subtitle: 'Immutable Forensic Activity & Regulatory Compliance',
    badge: 'Compliance & Security',
    icon: <FileText className="w-6 h-6 text-slate-700" />,
    description: 'Cryptographic append-only event stream tracking administrative logins, schema alterations, permissions changes, financial manual ledger overwrites, and data export operations.',
    targetRelease: 'Enterprise v4.5 • Q4 Roadmap',
    plannedCapabilities: [
      { name: 'Immutable Event Ledger', desc: 'SHA-256 chained transaction logs ensuring records cannot be tampered with.', status: 'Specification Ready' },
      { name: 'Privileged Action Tracking', desc: 'Audit trails for role elevations, price modifications, and bulk exports.', status: 'In Development' },
      { name: 'SOC-2 & GDPR Export', desc: 'One-click compliance packet generation in structured CSV and signed JSON.', status: 'Planned' },
      { name: 'Forensic IP & User Filter', desc: 'Sub-second search across millions of historical administrative interactions.', status: 'Planned' },
    ],
    technicalOverview: 'Uses Change Data Capture (CDC) with partitioned PostgreSQL audit schema tables.',
    cliCommandPreview: 'nebula audit:query --actor="admin@ultimatepos.io" --timeframe="30d" --format=csv',
  },
  system_health: {
    title: 'System Health & Telemetry',
    subtitle: 'Real-Time Performance Metrics & Resource Utilization',
    badge: 'Telemetry & Infra',
    icon: <Activity className="w-6 h-6 text-slate-700" />,
    description: 'Comprehensive system observability displaying Node.js event loop lag, container memory allocation, database query latency percentiles, and API endpoint throughput.',
    targetRelease: 'Enterprise v4.6 • Q1 Roadmap',
    plannedCapabilities: [
      { name: 'Query Latency (p50/p95/p99)', desc: 'Identify sluggish SQL queries impacting POS checkout speed.', status: 'Planned' },
      { name: 'Memory & CPU Gauges', desc: 'Container resource utilization monitoring with automated leak detection.', status: 'Planned' },
      { name: 'Storage Volume Forecast', desc: 'Predict disk exhaustion based on daily sales receipt velocity.', status: 'Specification Ready' },
      { name: 'Nginx Ingress Health', desc: 'WebSocket and HTTP response code distribution dashboard.', status: 'In Development' },
    ],
    technicalOverview: 'Powered by OpenTelemetry standards, Prometheus endpoints, and lightweight in-memory sliding windows.',
    cliCommandPreview: 'nebula telemetry:status --metrics=latency,memory,db_pool',
  },
  scheduler_jobs: {
    title: 'Scheduler & Background Jobs',
    subtitle: 'Automated Cron Routines & Asynchronous Worker Queues',
    badge: 'Worker Engine',
    icon: <CalendarClock className="w-6 h-6 text-slate-700" />,
    description: 'Centralized dashboard for overseeing recurring business background jobs, including daily automated backups, inventory low-stock alerts, WooCommerce bidirectional syncs, and financial reconciliation crons.',
    targetRelease: 'Enterprise v4.6 • Q1 Roadmap',
    plannedCapabilities: [
      { name: 'Cron Schedule Inspector', desc: 'View upcoming trigger timestamps, execution duration, and past exit codes.', status: 'Specification Ready' },
      { name: 'Dead-Letter Queue (DLQ)', desc: 'Inspect failed background tasks and trigger manual retry with backoff.', status: 'In Development' },
      { name: 'Worker Concurrency Tuning', desc: 'Adjust background worker thread limits to preserve POS checkout responsiveness.', status: 'Planned' },
      { name: 'Immediate Trigger Override', desc: 'Manually dispatch scheduled sync jobs ahead of scheduled intervals.', status: 'Specification Ready' },
    ],
    technicalOverview: 'Built on BullMQ/Redis worker pipelines with atomic lock distribution.',
    cliCommandPreview: 'nebula queue:inspect --queue=nightly_backup --retry-failed',
  },
};

export const EnterprisePlaceholderView: React.FC<EnterprisePlaceholderViewProps> = ({ 
  type,
  onNavigateTab
}) => {
  const meta = METADATA_MAP[type] || METADATA_MAP.database_utilities;
  const [subscribed, setSubscribed] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const handleCopyCli = () => {
    navigator.clipboard.writeText(meta.cliCommandPreview);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Coming Soon Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              {meta.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Administrator Only
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {meta.badge}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {meta.title}
              </h2>
              <p className="text-xs text-slate-600">
                {meta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              {meta.targetRelease}
            </span>
            <span className="text-[10px] text-slate-500">
              Architecture & Interface Specification Preview
            </span>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Module Architecture & Scope
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {meta.description}
          </p>
        </div>

        {/* Planned Capabilities Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Planned Capabilities & Milestones
            </h3>
            <span className="text-[11px] text-slate-500">
              Enterprise Roadmap
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {meta.plannedCapabilities.map((cap, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    {cap.name}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    cap.status === 'Specification Ready' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : cap.status === 'In Development' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {cap.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CLI Command & Technical Note */}
        <div className="bg-slate-900 rounded-xl p-4 text-white space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-slate-300" />
              <span>Operator CLI Syntax Preview</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCli}
              className="text-[10px] text-slate-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded cursor-pointer transition-colors"
            >
              {copiedCli ? 'Copied to Clipboard!' : 'Copy Command'}
            </button>
          </div>
          <pre className="font-mono text-xs text-emerald-400 overflow-x-auto py-1">
            <code>$ {meta.cliCommandPreview}</code>
          </pre>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>{meta.technicalOverview}</span>
          </div>
        </div>

        {/* Action Footnotes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Need this functionality expedited for your enterprise deployment?
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSubscribed(!subscribed)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                subscribed 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            >
              {subscribed ? '✓ Subscribed to Milestone Updates' : 'Notify Me on Release'}
            </button>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('data_migration')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
              >
                Go to Active Migration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
