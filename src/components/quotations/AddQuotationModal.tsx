import React, { useState } from 'react';
import { X, Plus, Trash2, FileSpreadsheet, User, Calendar, DollarSign, Search } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { QuotationItem } from '../../types';

interface AddQuotationModalProps {
  onClose: () => void;
}

export const AddQuotationModal: React.FC<AddQuotationModalProps> = ({ onClose }) => {
  const { contacts, products, currentLocation, addQuotation, settings } = usePOS();

  const [customerId, setCustomerId] = useState(contacts[1]?.id || contacts[0]?.id || '');
  const [customerName, setCustomerName] = useState(contacts[1]?.name || 'Direct Customer');
  const [customerMobile, setCustomerMobile] = useState(contacts[1]?.mobile || '');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('Standard 1-Year Manufacturer Warranty included on all serialized hardware.');
  const [terms, setTerms] = useState('Prices valid for 30 days. Payment terms: 100% on delivery.');

  const [items, setItems] = useState<QuotationItem[]>([
    {
      productId: products[0]?.id || 'p1',
      productName: products[0]?.name || 'iPhone 15 Pro Max',
      sku: products[0]?.sku || 'IP15',
      quantity: 2,
      unitPrice: products[0]?.sellingPrice || 1199,
      discount: 50,
      taxRate: products[0]?.taxRate || 8.5,
      subtotal: (products[0]?.sellingPrice || 1199) * 2 - 50,
    }
  ]);

  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setCustomerId(cid);
    const found = contacts.find(c => c.id === cid);
    if (found) {
      setCustomerName(found.name);
      setCustomerMobile(found.mobile || '');
    }
  };

  const handleAddItem = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    const existing = items.find(i => i.productId === prod.id);
    if (existing) {
      setItems(items.map(i => i.productId === prod.id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice - i.discount } : i));
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: 1,
          unitPrice: prod.sellingPrice,
          discount: 0,
          taxRate: prod.taxRate,
          subtotal: prod.sellingPrice,
        }
      ]);
    }
    setSelectedProductToAdd('');
  };

  const updateItemQty = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    setItems(items.map((item, idx) => {
      if (idx === index) {
        return { ...item, quantity, subtotal: quantity * item.unitPrice - item.discount };
      }
      return item;
    }));
  };

  const updateItemPrice = (index: number, unitPrice: number) => {
    setItems(items.map((item, idx) => {
      if (idx === index) {
        return { ...item, unitPrice, subtotal: item.quantity * unitPrice - item.discount };
      }
      return item;
    }));
  };

  const updateItemDiscount = (index: number, discount: number) => {
    setItems(items.map((item, idx) => {
      if (idx === index) {
        return { ...item, discount, subtotal: item.quantity * item.unitPrice - discount };
      }
      return item;
    }));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalDiscount = items.reduce((s, i) => s + i.discount, 0);
  const totalTax = items.reduce((s, i) => s + (i.subtotal * (i.taxRate / 100)), 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one product to the quotation.');
      return;
    }

    addQuotation({
      customerId,
      customerName,
      customerMobile,
      validUntil,
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      items,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      finalTotal: grandTotal,
      status: 'sent',
      notes,
      termsAndConditions: terms,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white">
                Create Formal Client Quotation
              </h2>
              <p className="text-xs text-slate-400">
                Generate estimates with multi-product pricing, discounts, taxes and validity window.
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
          {/* Customer & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer / Client</label>
              <select
                value={customerId}
                onChange={handleCustomerChange}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.businessName ? `(${c.businessName})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Mobile</label>
              <input
                type="text"
                value={customerMobile}
                onChange={e => setCustomerMobile(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Quote Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Add Product Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Add Products to Estimate
            </label>
            <div className="flex gap-2">
              <select
                value={selectedProductToAdd}
                onChange={e => setSelectedProductToAdd(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose product from catalog --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.currentStock}) - {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => selectedProductToAdd && handleAddItem(selectedProductToAdd)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 w-20">Qty</th>
                  <th className="py-2.5 px-3 w-24">Unit Price</th>
                  <th className="py-2.5 px-3 w-24">Disc ({settings.currencySymbol})</th>
                  <th className="py-2.5 px-3 text-right w-28">Subtotal</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3">
                      <p className="font-bold text-slate-800">{item.productName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItemQty(idx, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-slate-200 rounded text-center font-bold"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={e => updateItemPrice(idx, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-slate-200 rounded font-bold"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.discount}
                        onChange={e => updateItemDiscount(idx, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-slate-200 rounded text-emerald-600 font-bold"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-black text-slate-900">
                      {settings.currencySymbol}{item.subtotal.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                <tr>
                  <td colSpan={4} className="py-2 px-3 text-right text-slate-600">Subtotal:</td>
                  <td className="py-2 px-3 text-right font-extrabold">{settings.currencySymbol}{subtotal.toFixed(2)}</td>
                  <td></td>
                </tr>
                {totalDiscount > 0 && (
                  <tr>
                    <td colSpan={4} className="py-1.5 px-3 text-right text-emerald-600">Total Discount:</td>
                    <td className="py-1.5 px-3 text-right text-emerald-600 font-extrabold">-{settings.currencySymbol}{totalDiscount.toFixed(2)}</td>
                    <td></td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="py-1.5 px-3 text-right text-slate-600">Est. Tax ({settings.taxName}):</td>
                  <td className="py-1.5 px-3 text-right font-extrabold">{settings.currencySymbol}{totalTax.toFixed(2)}</td>
                  <td></td>
                </tr>
                <tr className="border-t border-slate-200 text-sm">
                  <td colSpan={4} className="py-2.5 px-3 text-right text-slate-900 font-black">Final Quoted Total:</td>
                  <td className="py-2.5 px-3 text-right text-blue-600 font-black">{settings.currencySymbol}{grandTotal.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes / Scope Summary</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Terms & Conditions</label>
              <textarea
                rows={2}
                value={terms}
                onChange={e => setTerms(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
            >
              Save & Issue Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
