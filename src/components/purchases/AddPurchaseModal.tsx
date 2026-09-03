import React, { useState } from 'react';
import { X, Truck, Plus, Trash2, Calendar, DollarSign, Package } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Contact, Product } from '../../types';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PurchaseLineItem {
  product: Product;
  quantity: number;
  purchasePrice: number;
  subtotal: number;
}

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({ isOpen, onClose }) => {
  const { contacts, products, addPurchaseTransaction, settings } = usePOS();

  const suppliers = contacts.filter(c => c.type === 'supplier' || c.type === 'both');

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [refNo, setRefNo] = useState(`PO-${Date.now().toString().slice(-6)}`);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [lineItems, setLineItems] = useState<PurchaseLineItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'due'>('paid');
  const [amountPaid, setAmountPaid] = useState('0.00');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'cheque'>('bank_transfer');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleAddProductToLines = () => {
    const p = products.find(prod => prod.id === selectedProductId);
    if (!p) return;

    const existingIndex = lineItems.findIndex(item => item.product.id === p.id);
    if (existingIndex > -1) {
      const updated = [...lineItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].purchasePrice;
      setLineItems(updated);
    } else {
      setLineItems([
        ...lineItems,
        {
          product: p,
          quantity: 10,
          purchasePrice: p.purchasePrice,
          subtotal: 10 * p.purchasePrice,
        },
      ]);
    }
  };

  const updateLineQty = (index: number, qty: number) => {
    const updated = [...lineItems];
    updated[index].quantity = Math.max(1, qty);
    updated[index].subtotal = updated[index].quantity * updated[index].purchasePrice;
    setLineItems(updated);
  };

  const updateLinePrice = (index: number, price: number) => {
    const updated = [...lineItems];
    updated[index].purchasePrice = Math.max(0, price);
    updated[index].subtotal = updated[index].quantity * updated[index].purchasePrice;
    setLineItems(updated);
  };

  const removeLine = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * (settings.taxRate / 100);
  const grandTotal = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) return;

    const supplier = suppliers.find(s => s.id === supplierId) || {
      id: 'sup-1',
      name: 'Supplier',
      type: 'supplier',
      totalPurchaseDue: 0,
    } as Contact;

    const paid = paymentStatus === 'paid' ? grandTotal : paymentStatus === 'due' ? 0 : parseFloat(amountPaid) || 0;

    addPurchaseTransaction({
      supplierId: supplier.id,
      items: lineItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
      })),
      paymentMethod,
      paymentStatus,
      amountPaid: paid,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Create Purchase Order (Stock In)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Supplier & Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier <span className="text-rose-500">*</span>
              </label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.businessName || s.mobile})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PO Reference / Invoice Number</label>
              <input
                type="text"
                required
                value={refNo}
                onChange={e => setRefNo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          {/* Add Item Row */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Product to Receive</label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) - Current Stock: {p.currentStock} {p.unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="self-end">
              <button
                type="button"
                onClick={handleAddProductToLines}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Product Description</th>
                  <th className="py-2.5 px-3 text-center">Qty to Receive</th>
                  <th className="py-2.5 px-3 text-right">Purchase Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No products added yet. Select a product above and click "Add Item".
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-800">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.product.sku}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateLineQty(index, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 text-center font-bold bg-slate-50 border border-slate-300 rounded"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.purchasePrice}
                          onChange={e => updateLinePrice(index, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-right font-medium bg-slate-50 border border-slate-300 rounded"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {settings.currencySymbol}{item.subtotal.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Details & Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Payment & Terms</h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="paid">Paid in Full</option>
                    <option value="partial">Partial Payment</option>
                    <option value="due">Payable Due (Credit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="bank_transfer">Bank Wire</option>
                    <option value="cash">Cash</option>
                    <option value="card">Company Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {paymentStatus === 'partial' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount Paid Now</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span>{settings.currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Estimated Tax ({settings.taxRate}%):</span>
                  <span>{settings.currencySymbol}{tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                <span className="text-xs uppercase font-bold text-slate-400">Total Purchase Cost:</span>
                <span className="text-2xl font-black text-emerald-400">
                  {settings.currencySymbol}{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={lineItems.length === 0}
              className={`px-5 py-2 text-xs font-bold rounded-lg shadow-sm transition-colors ${
                lineItems.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              Receive Inventory & Save PO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
