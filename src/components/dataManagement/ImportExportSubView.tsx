import React, { useState } from 'react';
import { 
  ArrowDownUp, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export const ImportExportSubView: React.FC<{ onNavigateSubTab?: (subTab: string) => void }> = ({ onNavigateSubTab }) => {
  const { products, contacts, transactions } = usePOS();
  const [selectedEntity, setSelectedEntity] = useState('products');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const salesCount = transactions.filter(t => t.type === 'sell').length;
  const purchasesCount = transactions.filter(t => t.type === 'purchase').length;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      let dataToExport: any = [];
      if (selectedEntity === 'products') dataToExport = products;
      else if (selectedEntity === 'customers') dataToExport = contacts.filter(c => c.type === 'customer');
      else if (selectedEntity === 'suppliers') dataToExport = contacts.filter(c => c.type === 'supplier');
      else if (selectedEntity === 'sales') dataToExport = transactions.filter(t => t.type === 'sell');
      else if (selectedEntity === 'purchases') dataToExport = transactions.filter(t => t.type === 'purchase');

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nebula_export_${selectedEntity}_${Date.now()}.${exportFormat === 'json' ? 'json' : 'csv'}`;
      a.click();

      setIsExporting(false);
      setExportSuccess(`Successfully exported ${dataToExport.length} ${selectedEntity} records.`);
      setTimeout(() => setExportSuccess(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ArrowDownUp className="w-5 h-5 text-blue-600" />
              Batch Import & Export Hub
            </h3>
            <p className="text-xs text-slate-500">Fast round-trip bulk data extraction and template ingestion</p>
          </div>
          <button
            onClick={() => onNavigateSubTab && onNavigateSubTab('migration')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Need Full System Migration? Open Migration Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {exportSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{exportSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Export Side */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Export Business Records</h4>
                <p className="text-[11px] text-slate-500">Download filtered tables in CSV, JSON or Excel format</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Data Entity:</label>
              <select
                value={selectedEntity}
                onChange={e => setSelectedEntity(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="products">Products & Catalog ({products.length} records)</option>
                <option value="customers">Customers & CRM Contacts</option>
                <option value="suppliers">Suppliers & Vendors</option>
                <option value="sales">Sales & POS Invoices ({salesCount} records)</option>
                <option value="purchases">Purchase Orders ({purchasesCount} records)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Export Format:</label>
              <div className="flex gap-2">
                {(['csv', 'json', 'xlsx'] as const).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      exportFormat === fmt
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isExporting ? 'Generating Export Package...' : 'Download Export File'}</span>
            </button>
          </div>

          {/* Import Side */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Import CSV Template</h4>
                <p className="text-[11px] text-slate-500">Upload structured CSV files with automatic column mapping</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-white transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">Drag and drop CSV files here</div>
              <div className="text-[11px] text-slate-500 mt-1">or click to browse local computer (Max 50MB)</div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Supported Templates: Products, Contacts, Opening Stock</span>
              <button 
                type="button"
                onClick={() => alert('Downloading blank CSV schema template...')}
                className="text-blue-600 hover:text-blue-800 font-bold"
              >
                Download Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
