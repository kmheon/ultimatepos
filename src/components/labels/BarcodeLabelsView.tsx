import React, { useState, useRef } from 'react';
import { 
  Barcode, 
  Printer, 
  Plus, 
  Trash2, 
  Settings2, 
  Layers, 
  CheckSquare, 
  Square, 
  Sparkles,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';

interface LabelItem {
  product: Product;
  quantity: number;
}

export const BarcodeLabelsView: React.FC = () => {
  const { products, settings } = usePOS();
  const printRef = useRef<HTMLDivElement>(null);

  const [labelItems, setLabelItems] = useState<LabelItem[]>([
    { product: products[0] || {} as Product, quantity: 4 },
    { product: products[1] || {} as Product, quantity: 2 },
    { product: products[4] || {} as Product, quantity: 6 },
  ]);

  // Label display settings
  const [showBusinessName, setShowBusinessName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [showSKU, setShowSKU] = useState(true);
  const [showWarranty, setShowWarranty] = useState(true);
  const [showSpecs, setShowSpecs] = useState(false);
  const [paperLayout, setPaperLayout] = useState<'24_per_sheet' | '30_per_sheet' | '40_per_sheet' | 'continuous_50x25' | 'thermal_38x25'>('24_per_sheet');

  const handleAddProductToLabels = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    const existing = labelItems.find(i => i.product.id === prod.id);
    if (existing) {
      setLabelItems(labelItems.map(i => i.product.id === prod.id ? { ...i, quantity: i.quantity + 2 } : i));
    } else {
      setLabelItems([...labelItems, { product: prod, quantity: 4 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setLabelItems(labelItems.filter(i => i.product.id !== productId));
      return;
    }
    setLabelItems(labelItems.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const removeLabelItem = (productId: string) => {
    setLabelItems(labelItems.filter(i => i.product.id !== productId));
  };

  const handlePrint = () => {
    window.print();
  };

  // Flatten items into individual stickers for grid rendering
  const allStickers: Product[] = [];
  labelItems.forEach(item => {
    for (let i = 0; i < item.quantity; i++) {
      allStickers.push(item.product);
    }
  });

  const getGridColsClass = () => {
    switch (paperLayout) {
      case '24_per_sheet':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      case '30_per_sheet':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5';
      case '40_per_sheet':
        return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5';
      case 'continuous_50x25':
      case 'thermal_38x25':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Barcode & Price Sticker Label Generator
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-extrabold">
              Label Maker
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Design, format, and batch print barcode stickers, SKU tags, and retail price shelf labels for electronics.
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={allStickers.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Labels ({allStickers.length} Stickers)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Left column: Products Picker */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <span>Select Products & Quantities</span>
          </h2>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600">Add Product to Batch</label>
            <select
              onChange={e => {
                if (e.target.value) {
                  handleAddProductToLabels(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose product to print --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({settings.currencySymbol}{p.sellingPrice.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {labelItems.map(item => (
              <div key={item.product.id} className="pt-2 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {item.product.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                    className="w-14 px-2 py-1 text-xs border border-slate-200 rounded text-center font-bold"
                  />
                  <button
                    onClick={() => removeLabelItem(item.product.id)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {labelItems.length > 0 && (
            <button
              onClick={() => setLabelItems([])}
              className="w-full py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-bold rounded-lg border border-rose-200 transition-colors"
            >
              Clear Label Queue
            </button>
          )}
        </div>

        {/* Middle column: Label Layout & Formatting Configuration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-600" />
            <span>Label Sticker Format & Content Settings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Paper Sheet Layout</label>
              <select
                value={paperLayout}
                onChange={e => setPaperLayout(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="24_per_sheet">24 Labels per Sheet (A4 - 70mm x 37mm)</option>
                <option value="30_per_sheet">30 Labels per Sheet (A4 - 64mm x 25mm)</option>
                <option value="40_per_sheet">40 Labels per Sheet (A4 - 48mm x 25mm)</option>
                <option value="continuous_50x25">Continuous Thermal Roll (50mm x 25mm)</option>
                <option value="thermal_38x25">Barcode Thermal Roll (38mm x 25mm)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Store Name on Label</label>
              <input
                type="text"
                value={settings.businessName}
                readOnly
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Visible Label Elements</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={showBusinessName}
                  onChange={e => setShowBusinessName(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Store Name</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={showProductName}
                  onChange={e => setShowProductName(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Product Name</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={e => setShowPrice(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Retail Price</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={showBarcode}
                  onChange={e => setShowBarcode(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Barcode Graphic (Code 128)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={showSKU}
                  onChange={e => setShowSKU(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>SKU & Model #</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={showWarranty}
                  onChange={e => setShowWarranty(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Warranty Badge</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Live Label Stickers Print Preview Canvas */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Print Preview Canvas ({allStickers.length} Total Stickers)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Page size automatically adjusts to printer roll or A4 sheet
          </span>
        </div>

        <div ref={printRef} className={`grid gap-3 ${getGridColsClass()}`}>
          {allStickers.map((prod, index) => (
            <div
              key={`${prod.id}-${index}`}
              className="border border-slate-400/80 p-2.5 rounded-lg bg-white text-center flex flex-col justify-between items-center text-slate-900 shadow-2xs min-h-[120px]"
            >
              {/* Store Header */}
              {showBusinessName && (
                <p className="text-[9px] font-black uppercase tracking-tight text-slate-800 line-clamp-1">
                  {settings.businessName}
                </p>
              )}

              {/* Product Title */}
              {showProductName && (
                <p className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight my-0.5">
                  {prod.name}
                </p>
              )}

              {/* Specs / Model */}
              {showSKU && (
                <p className="text-[9px] text-slate-500 font-mono">
                  SKU: {prod.sku} {prod.modelNumber ? `| ${prod.modelNumber}` : ''}
                </p>
              )}

              {/* Barcode Lines (Simulated SVG Barcode) */}
              {showBarcode && (
                <div className="w-full flex flex-col items-center my-1">
                  <div className="h-7 w-36 flex items-center justify-center gap-[2px] bg-white px-1">
                    {[3,1,2,4,1,3,2,1,4,2,1,3,1,2,4,1,2,3,1,4,2,1,3,2].map((w, idx) => (
                      <span
                        key={idx}
                        className="bg-black h-full inline-block"
                        style={{ width: `${w}px` }}
                      ></span>
                    ))}
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-slate-800">
                    {prod.barcode || prod.sku}
                  </span>
                </div>
              )}

              {/* Bottom Row: Price & Warranty */}
              <div className="w-full flex items-center justify-between pt-1 border-t border-slate-200 mt-1">
                {showWarranty && (
                  <span className="text-[8px] font-bold px-1 py-0.2 bg-slate-100 rounded text-slate-700">
                    {prod.warrantyMonths ? `${prod.warrantyMonths}M Warr.` : '1Y Warr.'}
                  </span>
                )}
                {showPrice && (
                  <span className="text-xs font-black text-slate-950 ml-auto">
                    {settings.currencySymbol}{prod.sellingPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
