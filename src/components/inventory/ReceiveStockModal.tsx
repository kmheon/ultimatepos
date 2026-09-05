import React, { useState, useEffect } from 'react';
import { X, Truck, Package, Building2, DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
}

export const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({
  isOpen,
  onClose,
  preselectedProductId,
}) => {
  const { products, locations, updateProduct, adjustStock, settings } = usePOS();

  const [productId, setProductId] = useState(preselectedProductId || products[0]?.id || '');
  const [locationId, setLocationId] = useState(locations[0]?.id || '');
  const [quantity, setQuantity] = useState('10');
  const [unitCost, setUnitCost] = useState('');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [receivedNotes, setReceivedNotes] = useState('Supplier shipment received & verified');
  const [serialNumbersText, setSerialNumbersText] = useState('');
  const [error, setError] = useState('');

  const selectedProduct = products.find(p => p.id === productId);

  useEffect(() => {
    if (preselectedProductId) {
      setProductId(preselectedProductId);
    }
  }, [preselectedProductId]);

  useEffect(() => {
    if (selectedProduct) {
      setUnitCost(selectedProduct.purchasePrice.toString());
    }
  }, [productId, selectedProduct]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Please select a valid product');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Received quantity must be greater than 0');
      return;
    }

    const cost = parseFloat(unitCost);
    const validCost = !isNaN(cost) && cost > 0 ? cost : selectedProduct.purchasePrice;

    // Split serial numbers if IMEI tracking is active
    const newSerials = selectedProduct.imeiTracking
      ? serialNumbersText.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
      : [];

    const existingSerials = selectedProduct.serialNumbers || [];
    const mergedSerials = [...new Set([...existingSerials, ...newSerials])];

    // Update product stock and cost
    updateProduct(selectedProduct.id, {
      currentStock: selectedProduct.currentStock + qty,
      purchasePrice: validCost,
      serialNumbers: selectedProduct.imeiTracking ? mergedSerials : existingSerials,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Receive Inbound Stock</h2>
              <p className="text-xs text-slate-400">Post supplier delivery & increment warehouse stock</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product <span className="text-rose-500">*</span>
            </label>
            <select
              value={productId}
              onChange={e => {
                setProductId(e.target.value);
                setError('');
              }}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current Stock: {p.currentStock} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination Location / Warehouse
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Unit Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Received Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Cost ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={e => setUnitCost(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Delivery Note & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier Invoice / PO #
              </label>
              <input
                type="text"
                placeholder="e.g. INV-98421"
                value={invoiceRef}
                onChange={e => setInvoiceRef(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Impact
              </label>
              <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {selectedProduct ? `${selectedProduct.currentStock} → ${selectedProduct.currentStock + (parseInt(quantity) || 0)}` : '—'} units
                </span>
              </div>
            </div>
          </div>

          {/* Serial / IMEI Input if product has IMEI tracking */}
          {selectedProduct?.imeiTracking && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Serial / IMEI Numbers (1 per line)
              </label>
              <textarea
                rows={2}
                placeholder="Enter or scan IMEIs (one per line)..."
                value={serialNumbersText}
                onChange={e => setSerialNumbersText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receiving Notes & Inspection
            </label>
            <input
              type="text"
              placeholder="e.g. Sealed box inspected, zero transit damage"
              value={receivedNotes}
              onChange={e => setReceivedNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs shadow-blue-200 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Confirm & Receive Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
