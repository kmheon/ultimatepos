import React, { useState } from 'react';
import { 
  ShoppingBag, 
  RefreshCw, 
  Key, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Layers, 
  Clock
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export const WooCommerceView: React.FC = () => {
  const { products } = usePOS();
  const [storeUrl, setStoreUrl] = useState('https://store.camnexbd.com');
  const [consumerKey, setConsumerKey] = useState('ck_981a287349120481239');
  const [consumerSecret, setConsumerSecret] = useState('cs_*************************');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2026-09-01 10:45 AM');
  const [syncStatus, setSyncStatus] = useState<'success' | 'idle' | 'syncing'>('idle');

  const [syncLogs] = useState([
    { id: '1', time: '10:45 AM', action: 'Exported 12 updated inventory levels to WooCommerce', status: 'Success' },
    { id: '2', time: '09:30 AM', action: 'Imported 3 new web orders (#WC-8842, #WC-8843, #WC-8844)', status: 'Success' },
    { id: '3', time: 'Yesterday', action: 'Synced 2 new product variations with price updates', status: 'Success' },
  ]);

  const handleSyncNow = () => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('success');
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-600" />
            WooCommerce Online Store Sync
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time two-way synchronization for online products, stock quantities, and web orders.
          </p>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing with WooCommerce...' : 'Sync Now'}</span>
        </button>
      </div>

      {/* Connection Status Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Connected Storefront</div>
            <div className="font-bold text-slate-900 text-sm">{storeUrl}</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> API Connected (v3 REST API)
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <div>Last Synchronized: <strong className="text-slate-800">{lastSyncTime}</strong></div>
          <div className="text-[11px] text-slate-400">Total Products Synced: {products.length} Items</div>
        </div>
      </div>

      {/* API Configuration & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            REST API Credentials
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WooCommerce Store URL</label>
              <input
                type="text"
                value={storeUrl}
                onChange={e => setStoreUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consumer Key (CK)</label>
              <input
                type="text"
                value={consumerKey}
                onChange={e => setConsumerKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consumer Secret (CS)</label>
              <input
                type="password"
                value={consumerSecret}
                onChange={e => setConsumerSecret(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>
          <button className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors">
            Update API Keys
          </button>
        </div>

        {/* Sync Operations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Batch Sync Actions
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Push Products to WooCommerce</div>
                <div className="text-[11px] text-slate-500">Sync all {products.length} POS catalog items and retail prices</div>
              </div>
              <button onClick={handleSyncNow} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-1">
                <ArrowUpFromLine className="w-3.5 h-3.5" /> Push
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Fetch Orders from Webstore</div>
                <div className="text-[11px] text-slate-500">Download customer orders directly into Sales & Invoices</div>
              </div>
              <button onClick={handleSyncNow} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-1">
                <ArrowDownToLine className="w-3.5 h-3.5" /> Fetch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Logs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          Recent Sync Activity Logs
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          {syncLogs.map(l => (
            <div key={l.id} className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">{l.action}</div>
                <div className="text-[11px] text-slate-400">{l.time}</div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md">
                {l.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
