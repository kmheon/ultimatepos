import React, { useState } from 'react';
import { X, Printer, Barcode, Copy, Check, Sliders } from 'lucide-react';
import { Product } from '../../types';
import { usePOS } from '../../context/POSContext';

interface ProductBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductBarcodeModal: React.FC<ProductBarcodeModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { settings } = usePOS();
  const [labelQuantity, setLabelQuantity] = useState<number>(4);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showBusinessName, setShowBusinessName] = useState<boolean>(true);
  const [showSku, setShowSku] = useState<boolean>(true);

  if (!isOpen || !product) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate an array of labels to preview/print
  const labels = Array.from({ length: labelQuantity }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Print Barcode Labels</h3>
              <p className="text-xs text-slate-400">Generate retail price tags & barcode stickers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Quantity:</span>
            <div className="flex items-center gap-1">
              {[1, 4, 8, 12, 24].map(q => (
                <button
                  key={q}
                  onClick={() => setLabelQuantity(q)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    labelQuantity === q
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Display Elements */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={e => setShowPrice(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Price</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showSku}
                onChange={e => setShowSku(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>SKU</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showBusinessName}
                onChange={e => setShowBusinessName(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Store Name</span>
            </label>
          </div>
        </div>

        {/* Printable Labels Canvas */}
        <div className="p-6 bg-slate-100/60 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-2">
            {labels.map(idx => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl border border-slate-300 shadow-2xs flex flex-col items-center justify-between text-center min-h-[140px]"
              >
                {showBusinessName && (
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-full">
                    {settings.businessName || 'NEBULA RETAIL'}
                  </span>
                )}

                <p className="font-extrabold text-xs text-slate-900 line-clamp-1 mt-0.5">
                  {product.name}
                </p>

                {/* Simulated Visual Barcode Bars */}
                <div className="my-2 flex flex-col items-center">
                  <div className="flex items-center gap-[1.5px] h-9 px-1">
                    {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 4, 1, 2].map((w, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-800 tracking-wider mt-0.5">
                    {product.barcode}
                  </span>
                </div>

                <div className="w-full flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                  {showSku && (
                    <span className="font-mono text-slate-500 truncate max-w-[50%]">
                      {product.sku}
                    </span>
                  )}
                  {showPrice && (
                    <span className="font-black text-slate-900 ml-auto">
                      {settings.currencySymbol}{product.sellingPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Previewing {labelQuantity} barcode labels
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shadow-blue-200"
            >
              <Printer className="w-4 h-4" />
              <span>Print {labelQuantity} Labels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
