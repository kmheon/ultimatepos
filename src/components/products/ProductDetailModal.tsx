import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Barcode, 
  Tag, 
  DollarSign, 
  Layers, 
  ShoppingCart, 
  SlidersHorizontal, 
  Edit3, 
  Printer, 
  ShieldCheck, 
  Boxes, 
  TrendingUp, 
  Copy, 
  Check, 
  AlertTriangle,
  Building2,
  Calendar,
  Hash
} from 'lucide-react';
import { Product } from '../../types';
import { usePOS } from '../../context/POSContext';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onPrintBarcode: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onAdjustStock,
  onPrintBarcode,
}) => {
  const { settings, addToCart, setActiveTab } = usePOS();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const profit = product.sellingPrice - product.purchasePrice;
  const marginPercent = product.sellingPrice > 0 
    ? ((profit / product.sellingPrice) * 100).toFixed(1) 
    : '0';

  const inventoryValuation = product.purchasePrice * product.currentStock;
  const potentialRetail = product.sellingPrice * product.currentStock;

  const isLowStock = product.currentStock <= product.alertQuantity && product.currentStock > 0;
  const isOutOfStock = product.currentStock <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{product.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {product.sku}
                </span>
              </div>
              <p className="text-xs text-slate-400">Master Product Record & Inventory Intelligence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-130px)] overflow-y-auto">
          {/* Top Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Image & Barcode Visualizer */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300 p-4">
                    <Package className="w-16 h-16 stroke-[1.5]" />
                    <span className="text-xs font-semibold text-slate-400 mt-2">No Image Uploaded</span>
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5">
                  {isOutOfStock ? (
                    <span className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] uppercase rounded-full tracking-wider shadow-sm">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="px-2.5 py-1 bg-amber-500 text-white font-bold text-[10px] uppercase rounded-full tracking-wider shadow-sm">
                      Low Stock Alert
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] uppercase rounded-full tracking-wider shadow-sm">
                      Stock Optimal
                    </span>
                  )}
                </div>
              </div>

              {/* Barcode Display Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Scannable Barcode (EAN-13 / Code128)
                </span>
                <div className="h-10 flex items-center justify-center">
                  {/* Visual simulated barcode */}
                  <div className="flex items-center gap-[2px] h-8 px-3 bg-white border border-slate-200 rounded-md py-1">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1].map((w, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-bold text-slate-700">
                  <span>{product.barcode}</span>
                  <button
                    onClick={() => handleCopy(product.barcode, 'barcode')}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Copy Barcode"
                  >
                    {copiedField === 'barcode' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Product Master Details */}
            <div className="md:col-span-2 space-y-4">
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  {product.categoryName || 'General Category'}
                </span>
                {product.brandName && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    {product.brandName}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono">
                  Unit: {product.unit || 'Pc'}
                </span>
                {product.imeiTracking && (
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Serial / IMEI Tracked
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </div>
              )}

              {/* Financial & Margin Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Purchase Cost</span>
                  <p className="text-base font-black text-slate-800 mt-0.5">
                    {settings.currencySymbol}{product.purchasePrice.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Selling Price</span>
                  <p className="text-base font-black text-blue-700 mt-0.5">
                    {settings.currencySymbol}{product.sellingPrice.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Gross Profit</span>
                  <p className="text-base font-black text-emerald-700 mt-0.5">
                    +{settings.currencySymbol}{profit.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Margin</span>
                  <p className="text-base font-black text-purple-700 mt-0.5">
                    {marginPercent}%
                  </p>
                </div>
              </div>

              {/* Warehouse Stock Breakdown */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    Inventory & Warehouse Status
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">
                    Threshold: {product.alertQuantity} {product.unit}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {product.currentStock}
                    </span>
                    <span className="text-xs font-bold text-slate-500 ml-1.5">
                      {product.unit} available
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Cost Valuation:</span>
                    <span className="text-sm font-bold text-slate-800">
                      {settings.currencySymbol}{inventoryValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Stock Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOutOfStock ? 'w-0' : isLowStock ? 'bg-amber-500 w-1/4' : 'bg-emerald-500 w-3/4'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                  <div>
                    <span className="font-medium text-slate-400">Potential Gross Revenue: </span>
                    <span className="font-bold text-slate-700">{settings.currencySymbol}{potentialRetail.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-slate-400">Tax Rate: </span>
                    <span className="font-bold text-slate-700">{product.taxRate || settings.taxRate}%</span>
                  </div>
                </div>
              </div>

              {/* Warranty & Serial section if enabled */}
              {product.imeiTracking && product.serialNumbers && product.serialNumbers.length > 0 && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-purple-600" />
                      Tracked Unit Serials ({product.serialNumbers.length} registered)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {product.serialNumbers.map((sn, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-700 font-medium">
                        {sn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintBarcode(product)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Barcode</span>
            </button>

            <button
              onClick={() => onAdjustStock(product)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Adjust Stock</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Details</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                addToCart(product, 1);
                onClose();
                setActiveTab('pos');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shadow-blue-200"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to POS Terminal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
