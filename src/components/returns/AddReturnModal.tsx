import React, { useState } from 'react';
import { X, RotateCcw, Plus, Trash2, ShieldAlert, PackageCheck } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { SaleReturnItem } from '../../types';

interface AddReturnModalProps {
  onClose: () => void;
}

export const AddReturnModal: React.FC<AddReturnModalProps> = ({ onClose }) => {
  const { contacts, transactions, products, addSaleReturn, settings, currentLocation } = usePOS();

  const [invoiceNo, setInvoiceNo] = useState('INV-2026-0048');
  const [customerId, setCustomerId] = useState(contacts[1]?.id || contacts[0]?.id || '');
  const [customerName, setCustomerName] = useState(contacts[1]?.name || 'Retail Customer');
  const [refundMethod, setRefundMethod] = useState<'cash' | 'card' | 'store_credit'>('cash');
  const [notes, setNotes] = useState('Returned in original condition, verified warranty serial.');

  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [items, setItems] = useState<SaleReturnItem[]>([
    {
      productId: products[4]?.id || 'p5',
      productName: products[4]?.name || 'Sony Headphones',
      sku: products[4]?.sku || 'SKU',
      quantity: 1,
      unitPrice: products[4]?.sellingPrice || 399.99,
      subtotal: products[4]?.sellingPrice || 399.99,
      reason: 'Customer upgraded to higher model',
      restockStock: true,
    }
  ]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setCustomerId(cid);
    const found = contacts.find(c => c.id === cid);
    if (found) setCustomerName(found.name);
  };

  const handleAddItem = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    setItems([
      ...items,
      {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: 1,
        unitPrice: prod.sellingPrice,
        subtotal: prod.sellingPrice,
        reason: 'Customer return / RMA',
        restockStock: true,
      }
    ]);
    setSelectedProductToAdd('');
  };

  const updateItemQty = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    setItems(items.map((it, idx) => idx === index ? { ...it, quantity, subtotal: quantity * it.unitPrice } : it));
  };

  const updateItemReason = (index: number, reason: string) => {
    setItems(items.map((it, idx) => idx === index ? { ...it, reason } : it));
  };

  const updateItemRestock = (index: number, restockStock: boolean) => {
    setItems(items.map((it, idx) => idx === index ? { ...it, restockStock } : it));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const totalRefund = items.reduce((s, i) => s + i.subtotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one item to return.');
      return;
    }

    addSaleReturn({
      invoiceNo,
      customerId,
      customerName,
      items,
      totalRefund,
      refundMethod,
      notes,
      locationId: currentLocation.id,
      locationName: currentLocation.name,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold">
              <RotateCcw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white">
                Process Sale Return & Refund
              </h2>
              <p className="text-xs text-slate-400">
                Issue refund, adjust inventory stock, and log RMA notes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Original Invoice #</label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={e => setInvoiceNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer</label>
              <select
                value={customerId}
                onChange={handleCustomerChange}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg"
              >
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add product */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Returned Products
            </label>
            <div className="flex gap-2">
              <select
                value={selectedProductToAdd}
                onChange={e => setSelectedProductToAdd(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select product being returned --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => selectedProductToAdd && handleAddItem(selectedProductToAdd)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.productName}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItemQty(idx, parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-500 font-semibold block">Reason for Return</label>
                    <input
                      type="text"
                      value={item.reason}
                      onChange={e => updateItemReason(idx, e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                      placeholder="e.g. Defective audio jack, wrong size"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1 font-semibold text-emerald-700">
                  <input
                    type="checkbox"
                    checked={item.restockStock}
                    onChange={e => updateItemRestock(idx, e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Restock item back into store inventory</span>
                </label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Refund Method</label>
              <select
                value={refundMethod}
                onChange={e => setRefundMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg"
              >
                <option value="cash">Cash Refund (Drawer Paid Out)</option>
                <option value="card">Card Chargeback Refund</option>
                <option value="store_credit">Store Credit / Account Balance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Total Refund Amount</label>
              <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg font-black text-rose-700 text-sm">
                {settings.currencySymbol}{totalRefund.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-500/20"
            >
              Confirm Sale Return & Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
